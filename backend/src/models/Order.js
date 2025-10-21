import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Order = sequelize.define('Order', {
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
  classId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Classes',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['name', 'classId']
    }
  ]
});

export default Order;
