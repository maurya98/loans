import { RequestHandler } from 'express';

export class PluginService {
  public loadPlugins(): RequestHandler {
    // TODO: Dynamically load plugins from directory
    return (req, res, next) => next();
  }
} 