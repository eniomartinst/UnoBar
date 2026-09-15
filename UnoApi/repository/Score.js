import { DataTypes, Model } from 'sequelize';
import database from '../config/database/database.js';

class Score extends Model {}

Score.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  playerId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
  gameId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'games', key: 'id' } },
  totalPoints: { type: DataTypes.INTEGER, allowNull: false }
}, { sequelize: database.connection, modelName: 'Score', tableName: 'scores', timestamps: true });

export default Score;