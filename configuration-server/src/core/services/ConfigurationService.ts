import { IConfiguration } from '../domain/Configuration';
import { IConfigurationRepository } from '../repositories/IConfigurationRepository';

export class ConfigurationService {
  constructor(private readonly repository: IConfigurationRepository) {}

  async createConfiguration(config: IConfiguration): Promise<IConfiguration> {
    try {
      return this.repository.create(config);
      
    } catch (error) {
      console.error('Error creating configuration:', error);
      throw new Error(`Failed to create configuration: ${error}`);
    }
  }

  async getConfiguration(applicationName: string, environment: string, configKey: string): Promise<IConfiguration | null> {
    return this.repository.findByKey(applicationName, environment, configKey);
  }

  async getAllConfigurations(applicationName: string, environment: string): Promise<IConfiguration[]> {
    return this.repository.findAll(applicationName, environment);
  }

  async updateConfiguration(config: IConfiguration): Promise<IConfiguration> {
    return this.repository.update(config);
  }

  async deleteConfiguration(applicationName: string, environment: string, configKey: string): Promise<boolean> {
    return this.repository.delete(applicationName, environment, configKey);
  }
} 