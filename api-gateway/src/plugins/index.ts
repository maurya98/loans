import { Plugin, PluginContext, PluginResult, PluginHandler } from '../types';
import logger from '../utils/logger';

export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();

  registerPlugin(name: string, _handler: PluginHandler, config: Record<string, any> = {}): void {
    this.plugins.set(name, {
      name,
      version: '1.0.0',
      enabled: true,
      config
    });
    logger.info(`Plugin registered: ${name}`);
  }

  async executePlugin(name: string, _context: PluginContext): Promise<PluginResult> {
    const plugin = this.plugins.get(name);
    if (!plugin || !plugin.enabled) {
      return { shouldContinue: true };
    }

    try {
      // This would execute the actual plugin handler
      // For now, return a default result
      return { shouldContinue: true };
    } catch (error) {
      logger.error(`Plugin execution failed for ${name}:`, error);
      return { shouldContinue: false, error: 'Plugin execution failed' };
    }
  }

  async executePlugins(pluginNames: string[], context: PluginContext): Promise<PluginResult> {
    for (const pluginName of pluginNames) {
      const result = await this.executePlugin(pluginName, context);
      if (!result.shouldContinue) {
        return result;
      }
    }
    return { shouldContinue: true };
  }

  getPlugin(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  enablePlugin(name: string): void {
    const plugin = this.plugins.get(name);
    if (plugin) {
      plugin.enabled = true;
      logger.info(`Plugin enabled: ${name}`);
    }
  }

  disablePlugin(name: string): void {
    const plugin = this.plugins.get(name);
    if (plugin) {
      plugin.enabled = false;
      logger.info(`Plugin disabled: ${name}`);
    }
  }
}

export default new PluginManager(); 