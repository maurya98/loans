import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface KycAttributes {
  id: number;
  userId: string;
  aadhaarNumber: string;
  name: string;
  dateOfBirth: Date;
  gender: string;
  address: string;
  digilockerId: string;
  status: 'pending' | 'verified' | 'rejected';
  verificationDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface KycCreationAttributes extends Optional<KycAttributes, 'id' | 'verificationDate' | 'createdAt' | 'updatedAt'> {}

class Kyc extends Model<KycAttributes, KycCreationAttributes> implements KycAttributes {
  public id!: number;
  public userId!: string;
  public aadhaarNumber!: string;
  public name!: string;
  public dateOfBirth!: Date;
  public gender!: string;
  public address!: string;
  public digilockerId!: string;
  public status!: 'pending' | 'verified' | 'rejected';
  public verificationDate!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Kyc.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    aadhaarNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dateOfBirth: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    digilockerId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'verified', 'rejected'),
      defaultValue: 'pending',
    },
    verificationDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'kyc',
    timestamps: true,
  }
);

export default Kyc; 