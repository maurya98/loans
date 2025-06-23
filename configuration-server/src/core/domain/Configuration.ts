export interface IConfiguration {
  id?: number;
  applicationName: string;
  environment: string;
  configKey: string;
  configValue: any;
  version: number;
  isActive: boolean;
  isEncrypted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Configuration implements IConfiguration {
  id?: number;
  applicationName: string;
  environment: string;
  configKey: string;
  configValue: any;
  version: number;
  isActive: boolean;
  isEncrypted: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: IConfiguration) {
    this.id = data.id;
    this.applicationName = data.applicationName;
    this.environment = data.environment;
    this.configKey = data.configKey;
    this.configValue = data.configValue;
    this.version = data.version;
    this.isActive = data.isActive;
    this.isEncrypted = data.isEncrypted;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
} 