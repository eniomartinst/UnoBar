import { DataTypes, Model } from 'sequelize';
import database from '../config/database/database.js';

class Tracking extends Model { }

Tracking.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  responseTime: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  endpointAccess: {
    type: DataTypes.STRING,
    allowNull: false
  },
  requestMethod: {
    type: DataTypes.STRING,
    allowNull: false
  },
  statusCode: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  sequelize: database.connection,
  modelName: 'Tracking',
  tableName: 'trackings',
  timestamps: false
});

export default Tracking;
