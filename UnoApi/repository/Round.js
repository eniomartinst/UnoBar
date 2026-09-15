import { DataTypes, Model } from 'sequelize';
import database from '../config/database/database.js';

class Round extends Model {}

Round.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  gameId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'games', key: 'id' } },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  currentPlayerIndex: { type: DataTypes.INTEGER, defaultValue: 0 },
  direction: { type: DataTypes.INTEGER, defaultValue: 1 },
  activeColor: { type: DataTypes.STRING, allowNull: true },
  pendingDraws: { type: DataTypes.INTEGER, defaultValue: 0 },
  deck: { type: DataTypes.JSON, defaultValue: [] },
  discardPile: { type: DataTypes.JSON, defaultValue: [] },
  hands: { type: DataTypes.JSON, defaultValue: {} },
  saidUno: { type: DataTypes.JSON, defaultValue: {} }
}, { sequelize: database.connection, modelName: 'Round', tableName: 'rounds', timestamps: true });

export default Round;