import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Class = sequelize.define('Class', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  commonName: {
    type: DataTypes.STRING
  },
  description: {
    type: DataTypes.TEXT
  },
  divisionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Divisions',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['name', 'divisionId']
    }
  ]
});

export default Class;
