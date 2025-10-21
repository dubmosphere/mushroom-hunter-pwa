import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Genus = sequelize.define('Genus', {
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
  familyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Families',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  tableName: 'Genera',
  indexes: [
    {
      unique: true,
      fields: ['name', 'familyId']
    }
  ]
});

export default Genus;
