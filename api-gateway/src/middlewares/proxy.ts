import { Request, Response, NextFunction } from 'express';
import API from '../models/API';
import axios from 'axios';

// Version-aware proxy middleware with composition, mock, and lifecycle support
export async function proxyMiddleware(req: Request, res: Response, next: NextFunction) {
  // Expect path like /api/v1/resource or /api/resource
  const versionMatch = req.path.match(/^\/v(\d+)\//);
  let version: string | undefined = undefined;
  let resourcePath = req.path;
  if (versionMatch) {
    version = versionMatch[1];
    resourcePath = req.path.replace(/^\/v\d+\//, '/');
  }
  // Find API definition by basePath and version
  const basePath = req.baseUrl.replace(/^\/api/, '');
  let api;
  if (version) {
    api = await API.findOne({ where: { basePath, version } });
  } else {
    api = await API.findOne({ where: { basePath, defaultVersion: true } });
  }
  if (!api) {
    res.status(404).json({ message: `API not found for basePath: ${basePath}, version: v${version || 'default'}` });
    return;
  }
  (req as any).api = api;

  // --- API Lifecycle Enforcement ---
  if (api.lifecycleStatus === 'retired') {
    res.status(410).json({ message: 'This API version is retired and no longer available.' });
    return;
  }
  if (api.lifecycleStatus === 'deprecated') {
    res.set('Warning', '299 - This API version is deprecated and will be removed soon.');
  }
  if (api.lifecycleStatus !== 'published' && api.lifecycleStatus !== 'deprecated') {
    res.status(403).json({ message: 'This API version is not published.' });
    return;
  }

  // --- API Mocking ---
  if (api.mockEnabled && api.mockResponse) {
    try {
      const mock = JSON.parse(api.mockResponse);
      res.json({ mock: true, data: mock });
    } catch {
      res.type('text/plain').send(api.mockResponse);
    }
    return;
  }

  // --- API Composition/Orchestration Example ---
  if (api.composition && Array.isArray(api.composition.steps)) {
    try {
      const results = await Promise.all(
        api.composition.steps.map((step: any) => axios.get(step.url))
      );
      const merged = results.map(r => r.data);
      res.json({ composition: true, merged });
      return;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      res.status(502).json({ message: 'Error during API composition', error: errorMsg });
      return;
    }
  }

  // TODO: Proxy to backend service based on api definition
  // For now, just return API info
  res.json({ message: 'Proxy would forward to backend', api, resourcePath });
} 