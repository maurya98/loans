import { Router } from 'express';
import API from '../models/API';

const router = Router();

router.get('/', async (req, res) => {
  const apis = await API.findAll();
  let html = `<html><head><title>API Gateway Developer Portal</title></head><body>`;
  html += `<h1>API Gateway Developer Portal</h1>`;
  html += `<h2>Available APIs</h2><ul>`;
  for (const api of apis) {
    html += `<li><b>${api.name}</b> (v${api.version}) - <code>${api.basePath}</code> - <a href='/docs'>Docs</a></li>`;
  }
  html += `</ul>`;
  html += `<h2>API Key Management</h2>`;
  html += `<p>Use the <code>/my/apikeys</code> endpoints to list, create, and revoke your API keys. (UI coming soon)</p>`;
  html += `<h2>SDK Download (Stub)</h2>`;
  html += `<p><a href='/portal/sdk'>Download SDK (stub)</a></p>`;
  html += `</body></html>`;
  res.send(html);
});

// SDK download stub
router.get('/sdk', (req, res) => {
  res.type('text/plain').send('// SDK stub: Use OpenAPI Generator for real SDKs.');
});

export default router; 