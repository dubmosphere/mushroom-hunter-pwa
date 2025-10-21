import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Finding = sequelize.define('Finding', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  speciesId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Species',
      key: 'id'
    }
  },
  foundAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false,
    validate: {
      min: -90,
      max: 90
    }
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false,
    validate: {
      min: -180,
      max: 180
    }
  },
  location: {
    type: DataTypes.STRING,
    comment: 'Location name or description'
  },
  notes: {
    type: DataTypes.TEXT
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  weather: {
    type: DataTypes.STRING
  },
  temperature: {
    type: DataTypes.DECIMAL(4, 1)
  },
  photoUrl: {
    type: DataTypes.STRING
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['speciesId']
    },
    {
      fields: ['foundAt']
    },
    {
      fields: ['latitude', 'longitude']
    }
  ]
});

export default Finding;
