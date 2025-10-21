import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Species = sequelize.define('Species', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  scientificName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  commonName: {
    type: DataTypes.STRING
  },
  commonNameDE: {
    type: DataTypes.STRING,
    comment: 'German common name'
  },
  commonNameFR: {
    type: DataTypes.STRING,
    comment: 'French common name'
  },
  commonNameIT: {
    type: DataTypes.STRING,
    comment: 'Italian common name'
  },
  description: {
    type: DataTypes.TEXT
  },
  habitat: {
    type: DataTypes.TEXT
  },
  edibility: {
    type: DataTypes.ENUM('edible', 'poisonous', 'inedible', 'medicinal', 'psychoactive', 'unknown'),
    defaultValue: 'unknown'
  },
  toxicity: {
    type: DataTypes.STRING
  },
  seasonStart: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 12
    },
    comment: 'Month when season starts (1-12)'
  },
  seasonEnd: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 12
    },
    comment: 'Month when season ends (1-12)'
  },
  capShape: {
    type: DataTypes.STRING
  },
  capColor: {
    type: DataTypes.STRING
  },
  gillAttachment: {
    type: DataTypes.STRING
  },
  sporePrintColor: {
    type: DataTypes.STRING
  },
  occurrence: {
    type: DataTypes.ENUM('common', 'frequent', 'occasional', 'rare', 'very_rare'),
    defaultValue: 'occasional'
  },
  imageUrl: {
    type: DataTypes.STRING
  },
  genusId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Genera',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['edibility']
    },
    {
      fields: ['occurrence']
    },
    {
      fields: ['genusId']
    }
  ]
});

export default Species;
