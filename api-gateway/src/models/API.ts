import { DataTypes, Model } from 'sequelize';
import { sequelize } from './index';

class API extends Model {
  public id!: number;
  public name!: string;
  public version!: string;
  public basePath!: string;
  public description?: string;
  public status!: string;
  public defaultVersion!: boolean;
  public rateLimit?: number;
  public rateLimitWindow?: number;
  public composition?: any;
  public mockEnabled!: boolean;
  public mockResponse?: string;
  public lifecycleStatus!: string;
  public deprecationDate?: Date;
  public retirementDate?: Date;
}

API.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    version: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    basePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active',
    },
    defaultVersion: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    rateLimit: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    rateLimitWindow: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    composition: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    mockEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    mockResponse: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    lifecycleStatus: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'draft',
    },
    deprecationDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    retirementDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'API',
    tableName: 'apis',
    timestamps: true,
  }
);

export default API; 