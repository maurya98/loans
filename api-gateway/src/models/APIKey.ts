import { DataTypes, Model } from 'sequelize';
import { sequelize } from './index';

class APIKey extends Model {
  public id!: number;
  public key!: string;
  public userId!: number;
  public apiId!: number;
  public status!: string;
}

APIKey.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    apiId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active',
    },
  },
  {
    sequelize,
    modelName: 'APIKey',
    tableName: 'api_keys',
    timestamps: true,
  }
);

export default APIKey; 