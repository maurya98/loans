import { IConfiguration } from '../domain/Configuration';

export interface IConfigurationRepository {
  create(config: IConfiguration): Promise<IConfiguration>;
  findByKey(applicationName: string, environment: string, configKey: string): Promise<IConfiguration | null>;
  findAll(applicationName: string, environment: string): Promise<IConfiguration[]>;
  update(config: IConfiguration): Promise<IConfiguration>;
  delete(applicationName: string, environment: string, configKey: string): Promise<boolean>;
} 