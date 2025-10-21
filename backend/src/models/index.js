import sequelize from '../config/database.js';
import User from './User.js';
import Division from './Division.js';
import Class from './Class.js';
import Order from './Order.js';
import Family from './Family.js';
import Genus from './Genus.js';
import Species from './Species.js';
import Finding from './Finding.js';

// Define associations
Division.hasMany(Class, { foreignKey: 'divisionId', as: 'classes' });
Class.belongsTo(Division, { foreignKey: 'divisionId', as: 'division' });

Class.hasMany(Order, { foreignKey: 'classId', as: 'orders' });
Order.belongsTo(Class, { foreignKey: 'classId', as: 'class' });

Order.hasMany(Family, { foreignKey: 'orderId', as: 'families' });
Family.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

Family.hasMany(Genus, { foreignKey: 'familyId', as: 'genera' });
Genus.belongsTo(Family, { foreignKey: 'familyId', as: 'family' });

Genus.hasMany(Species, { foreignKey: 'genusId', as: 'species' });
Species.belongsTo(Genus, { foreignKey: 'genusId', as: 'genus' });

User.hasMany(Finding, { foreignKey: 'userId', as: 'findings' });
Finding.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Species.hasMany(Finding, { foreignKey: 'speciesId', as: 'findings' });
Finding.belongsTo(Species, { foreignKey: 'speciesId', as: 'species' });

export {
  sequelize,
  User,
  Division,
  Class,
  Order,
  Family,
  Genus,
  Species,
  Finding
};
