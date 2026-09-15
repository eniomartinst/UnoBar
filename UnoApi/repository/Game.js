import { DataTypes, Model } from 'sequelize';
import database from '../config/database/database.js';

class Game extends Model {}

Game.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'waiting' },
  maxPlayers: { type: DataTypes.INTEGER, defaultValue: 4 },
  usersInGame: { type: DataTypes.JSON, defaultValue: [] },
  totalScores: { type: DataTypes.JSON, defaultValue: {} },
  winnerId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'users', key: 'id' } }
}, { sequelize: database.connection, modelName: 'Game', tableName: 'games', timestamps: true });

export default Game;