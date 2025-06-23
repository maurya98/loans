import { Model, DataTypes } from 'sequelize';
import { sequelize } from './config';
import { IConfiguration } from '../../core/domain/Configuration';
import { IConfigurationRepository } from '../../core/repositories/IConfigurationRepository';

class ConfigurationModel extends Model implements IConfiguration {
  public id!: number;
  public applicationName!: string;
  public environment!: string;
  public configKey!: string;
  public configValue!: any;
  public version!: number;
  public isActive!: boolean;
  public isEncrypted!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ConfigurationModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    applicationName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    environment: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    configKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    configValue: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    isEncrypted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'Configuration',
    tableName: 'configurations',
    indexes: [
      {
        unique: true,
        fields: ['applicationName', 'environment', 'configKey'],
      },
    ],
  }
);

export { ConfigurationModel };
export class ConfigurationRepository implements IConfigurationRepository {
  async create(config: IConfiguration): Promise<IConfiguration> {
    try {
      console.log('Creating configuration:', config);
      return await ConfigurationModel.create({ ...config });
    } catch (error) {
      console.error('Error creating configuration:', error);
      throw new Error(`Failed to create configuration: ${error}`);
    }
  }

  async findByKey(applicationName: string, environment: string, configKey: string): Promise<IConfiguration | null> {
    return ConfigurationModel.findOne({
      raw: true,
      where: {
        applicationName,
        environment,
        configKey,
        isActive: true,
      },
    });
  }

  async findAll(applicationName: string, environment: string): Promise<IConfiguration[]> {
    return ConfigurationModel.findAll({
      raw: true,
      where: {
        applicationName,
        environment,
        isActive: true,
      },
    });
  }

  async update(config: IConfiguration): Promise<IConfiguration> {
    const [updatedCount, [updatedConfig]] = await ConfigurationModel.update(
      {
        configValue: config.configValue,
        version: config.version + 1,
      },
      {
        where: {
          applicationName: config.applicationName,
          environment: config.environment,
          configKey: config.configKey,
        },
        returning: true,
      }
    );

    if (!updatedConfig) {
      throw new Error('Configuration not found');
    }

    return updatedConfig;
  }

  async delete(applicationName: string, environment: string, configKey: string): Promise<boolean> {
    const [deletedCount] = await ConfigurationModel.update(
      { isActive: false },
      {
        where: {
          applicationName,
          environment,
          configKey,
        },
      }
    );

    return deletedCount > 0;
  }
} 