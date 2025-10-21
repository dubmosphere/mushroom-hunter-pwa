import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Division = sequelize.define('Division', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  commonName: {
    type: DataTypes.STRING
  },
  description: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true
});

export default Division;
