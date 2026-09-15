import { DataTypes, Model } from 'sequelize';
import database from '../config/database/database.js';

class Card extends Model {}

Card.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  color: { type: DataTypes.STRING, allowNull: false },
  value: { type: DataTypes.STRING, allowNull: false },
  points: { type: DataTypes.INTEGER, allowNull: false }
}, { 
  sequelize: database.connection, 
  modelName: 'Card', 
  tableName: 'cards', 
  timestamps: false // Dicionário imutável não precisa de data de criação/atualização
});

export default Card;