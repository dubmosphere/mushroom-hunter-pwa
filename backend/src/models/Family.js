import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Family = sequelize.define('Family', {
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
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Orders',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['name', 'orderId']
    }
  ]
});

export default Family;
