import { Request, Response } from 'express';
import { ConfigurationService } from '../../core/services/ConfigurationService';
import { IConfiguration } from '../../core/domain/Configuration';

export class ConfigurationController {
  constructor(private readonly configurationService: ConfigurationService) {}

  async createConfig(req: Request, res: Response): Promise<void> {
    try {
      const config = await this.configurationService.createConfiguration(req.body as IConfiguration);
      res.status(201).json(config);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create configuration' });
    }
  }

  async getConfig(req: Request, res: Response): Promise<void> {
    try {
      const { applicationName, environment, configKey } = req.params;
      const config = await this.configurationService.getConfiguration(applicationName, environment, configKey);
      
      if (!config) {
        res.status(404).json({ error: 'Configuration not found' });
        return;
      }

      res.json(config);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get configuration' });
    }
  }

  async getAllConfigs(req: Request, res: Response): Promise<void> {
    try {
      const { applicationName, environment } = req.params;
      const configs = await this.configurationService.getAllConfigurations(applicationName, environment);
      res.json(configs);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get configurations' });
    }
  }

  async updateConfig(req: Request, res: Response): Promise<void> {
    try {
      const { applicationName, environment, configKey } = req.params;
      const config = await this.configurationService.getConfiguration(applicationName, environment, configKey);
      
      if (!config) {
        res.status(404).json({ error: 'Configuration not found' });
        return;
      }

      const updatedConfig = await this.configurationService.updateConfiguration({
        ...config,
        configValue: req.body.configValue
      });

      res.json(updatedConfig);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update configuration' });
    }
  }

  async deleteConfig(req: Request, res: Response): Promise<void> {
    try {
      const { applicationName, environment, configKey } = req.params;
      const success = await this.configurationService.deleteConfiguration(applicationName, environment, configKey);
      
      if (!success) {
        res.status(404).json({ error: 'Configuration not found' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete configuration' });
    }
  }
} 