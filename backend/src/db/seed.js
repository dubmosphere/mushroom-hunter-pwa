import {
  sequelize,
  User,
  Division,
  Class,
  Order,
  Family,
  Genus,
  Species
} from '../models/index.js';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    await sequelize.sync({ force: true });
    console.log('✓ Database tables created');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      email: 'admin@mushroomhunter.ch',
      username: 'admin',
      password: 'admin123',
      role: 'admin'
    });
    console.log('✓ Admin user created');

    // Create test user
    const testUser = await User.create({
      email: 'user@mushroomhunter.ch',
      username: 'testuser',
      password: 'user123',
      role: 'user'
    });
    console.log('✓ Test user created');

    // Create Division
    const basidiomycota = await Division.create({
      name: 'Basidiomycota',
      commonName: 'Club fungi',
      description: 'Phylum of fungi that includes most of the familiar mushrooms'
    });

    const ascomycota = await Division.create({
      name: 'Ascomycota',
      commonName: 'Sac fungi',
      description: 'Phylum of fungi that includes morels, truffles, and many others'
    });

    console.log('✓ Divisions created');

    // Create Classes
    const agaricomycetes = await Class.create({
      name: 'Agaricomycetes',
      description: 'Class containing most gilled mushrooms',
      divisionId: basidiomycota.id
    });

    const pezizomycetes = await Class.create({
      name: 'Pezizomycetes',
      description: 'Class containing cup fungi and morels',
      divisionId: ascomycota.id
    });

    console.log('✓ Classes created');

    // Create Orders
    const agaricales = await Order.create({
      name: 'Agaricales',
      commonName: 'Gilled mushrooms',
      classId: agaricomycetes.id
    });

    const boletales = await Order.create({
      name: 'Boletales',
      commonName: 'Boletes',
      classId: agaricomycetes.id
    });

    const pezizales = await Order.create({
      name: 'Pezizales',
      commonName: 'Cup fungi',
      classId: pezizomycetes.id
    });

    console.log('✓ Orders created');

    // Create Families
    const agaricaceae = await Family.create({
      name: 'Agaricaceae',
      commonName: 'Mushroom family',
      orderId: agaricales.id
    });

    const amanitaceae = await Family.create({
      name: 'Amanitaceae',
      commonName: 'Amanita family',
      orderId: agaricales.id
    });

    const boletaceae = await Family.create({
      name: 'Boletaceae',
      commonName: 'Bolete family',
      orderId: boletales.id
    });

    const morchellaceae = await Family.create({
      name: 'Morchellaceae',
      commonName: 'Morel family',
      orderId: pezizales.id
    });

    console.log('✓ Families created');

    // Create Genera
    const agaricus = await Genus.create({
      name: 'Agaricus',
      commonName: 'Field mushroom',
      familyId: agaricaceae.id
    });

    const amanita = await Genus.create({
      name: 'Amanita',
      commonName: 'Amanita',
      familyId: amanitaceae.id
    });

    const boletus = await Genus.create({
      name: 'Boletus',
      commonName: 'Bolete',
      familyId: boletaceae.id
    });

    const morchella = await Genus.create({
      name: 'Morchella',
      commonName: 'Morel',
      familyId: morchellaceae.id
    });

    console.log('✓ Genera created');

    // Create Species (Swiss mushrooms)
    await Species.bulkCreate([
      // Edible species
      {
        scientificName: 'Agaricus campestris',
        commonName: 'Field mushroom',
        commonNameDE: 'Wiesen-Champignon',
        commonNameFR: 'Champignon des prés',
        commonNameIT: 'Prataiolo',
        description: 'Common edible mushroom found in fields and meadows. White cap, pink to brown gills.',
        habitat: 'Grasslands, meadows, and pastures throughout Switzerland',
        edibility: 'edible',
        seasonStart: 6,
        seasonEnd: 10,
        capShape: 'Convex to flat',
        capColor: 'White to cream',
        gillAttachment: 'Free',
        sporePrintColor: 'Chocolate brown',
        occurrence: 'common',
        genusId: agaricus.id
      },
      {
        scientificName: 'Boletus edulis',
        commonName: 'Penny bun',
        commonNameDE: 'Steinpilz',
        commonNameFR: 'Cèpe de Bordeaux',
        commonNameIT: 'Porcino',
        description: 'Highly prized edible mushroom. Large brown cap, white pores that turn yellow-green.',
        habitat: 'Coniferous and deciduous forests, common in Swiss Alps',
        edibility: 'edible',
        seasonStart: 6,
        seasonEnd: 10,
        capShape: 'Hemispherical to convex',
        capColor: 'Brown to dark brown',
        sporePrintColor: 'Olive brown',
        occurrence: 'frequent',
        genusId: boletus.id
      },
      {
        scientificName: 'Morchella esculenta',
        commonName: 'Common morel',
        commonNameDE: 'Speise-Morchel',
        commonNameFR: 'Morille comestible',
        commonNameIT: 'Spugnola',
        description: 'Honeycomb-like cap structure, highly prized edible spring mushroom.',
        habitat: 'Deciduous forests, orchards, disturbed ground',
        edibility: 'edible',
        seasonStart: 3,
        seasonEnd: 5,
        capShape: 'Conical with pits and ridges',
        capColor: 'Yellow-brown to gray-brown',
        occurrence: 'occasional',
        genusId: morchella.id
      },
      // Poisonous species
      {
        scientificName: 'Amanita phalloides',
        commonName: 'Death cap',
        commonNameDE: 'Grüner Knollenblätterpilz',
        commonNameFR: 'Amanite phalloïde',
        commonNameIT: 'Amanita falloide',
        description: 'Extremely deadly poisonous mushroom. Greenish cap, white gills, ring and volva.',
        habitat: 'Deciduous and mixed forests, especially with oak and hazel',
        edibility: 'poisonous',
        toxicity: 'DEADLY POISONOUS - Contains amatoxins that cause liver and kidney failure. Responsible for most mushroom poisoning deaths worldwide.',
        seasonStart: 7,
        seasonEnd: 10,
        capShape: 'Hemispherical to flat',
        capColor: 'Greenish-yellow to olive',
        gillAttachment: 'Free',
        sporePrintColor: 'White',
        occurrence: 'frequent',
        genusId: amanita.id
      },
      {
        scientificName: 'Amanita muscaria',
        commonName: 'Fly agaric',
        commonNameDE: 'Fliegenpilz',
        commonNameFR: 'Amanite tue-mouches',
        commonNameIT: 'Ovolo malefico',
        description: 'Iconic red cap with white spots. Toxic and psychoactive.',
        habitat: 'Coniferous and birch forests throughout Switzerland',
        edibility: 'poisonous',
        toxicity: 'Toxic - Contains ibotenic acid and muscimol causing nausea, hallucinations, and confusion.',
        seasonStart: 8,
        seasonEnd: 11,
        capShape: 'Hemispherical to flat',
        capColor: 'Red to orange with white spots',
        gillAttachment: 'Free',
        sporePrintColor: 'White',
        occurrence: 'common',
        genusId: amanita.id
      },
      {
        scientificName: 'Amanita pantherina',
        commonName: 'Panther cap',
        commonNameDE: 'Pantherpilz',
        commonNameFR: 'Amanite panthère',
        commonNameIT: 'Amanita panterina',
        description: 'Brown cap with white warts, similar to A. muscaria but more toxic.',
        habitat: 'Coniferous and deciduous forests',
        edibility: 'poisonous',
        toxicity: 'Very toxic - Similar toxins to A. muscaria but in higher concentrations.',
        seasonStart: 7,
        seasonEnd: 10,
        capShape: 'Hemispherical to flat',
        capColor: 'Brown with white warts',
        gillAttachment: 'Free',
        sporePrintColor: 'White',
        occurrence: 'occasional',
        genusId: amanita.id
      },
      // More edible species
      {
        scientificName: 'Agaricus bisporus',
        commonName: 'Button mushroom',
        commonNameDE: 'Zucht-Champignon',
        commonNameFR: 'Champignon de Paris',
        commonNameIT: 'Champignon',
        description: 'Commercially cultivated mushroom, also found wild.',
        habitat: 'Grasslands, compost, cultivated',
        edibility: 'edible',
        seasonStart: 1,
        seasonEnd: 12,
        capShape: 'Convex to flat',
        capColor: 'White to light brown',
        gillAttachment: 'Free',
        sporePrintColor: 'Brown',
        occurrence: 'common',
        genusId: agaricus.id
      }
    ]);

    console.log('✓ Species created');

    console.log('\n=== Seed Data Summary ===');
    console.log('Admin credentials:');
    console.log('  Email: admin@mushroomhunter.ch');
    console.log('  Password: admin123');
    console.log('\nTest user credentials:');
    console.log('  Email: user@mushroomhunter.ch');
    console.log('  Password: user123');
    console.log('\nDatabase seeded successfully!');

  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seed();
