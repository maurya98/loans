import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class Document extends Model {
  public id!: string;
  public fileName!: string;
  public originalName!: string;
  public mimeType!: string;
  public size!: number;
  public storageType!: string;
  public storagePath!: string;
  public metadata!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Document.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    originalName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    storageType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    storagePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'documents',
    timestamps: true,
  }
); 