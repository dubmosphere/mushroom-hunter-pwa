import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csvParser from 'csv-parser';
import pg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Create database connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'mushroom_hunter',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

// Cache objects to store already imported entities
const cache = {
  genera: {},
  orders: {},
  families: {},
  classes: {},
  divisions: {},
};

/**
 * Clear all taxonomy and species tables
 */
async function clearTables() {
  console.log('Clearing tables...');

  const client = await pool.connect();
  try {
    await client.query('TRUNCATE TABLE "Species" CASCADE');
    await client.query('TRUNCATE TABLE "Genera" CASCADE');
    await client.query('TRUNCATE TABLE "Families" CASCADE');
    await client.query('TRUNCATE TABLE "Orders" CASCADE');
    await client.query('TRUNCATE TABLE "Classes" CASCADE');
    await client.query('TRUNCATE TABLE "Divisions" CASCADE');

    console.log('Tables cleared.');
  } finally {
    client.release();
  }
}

/**
 * Convert German genus name to plural form
 */
function getGenusGerman(genusGerman) {
  if (genusGerman.includes(' ')) {
    return '';
  }

  const lower = genusGerman.toLowerCase();

  if (lower.endsWith('pilz')) {
    return genusGerman + 'e';
  } else if (lower.endsWith('ling')) {
    return genusGerman + 'e';
  } else if (lower.endsWith('lorchel')) {
    return genusGerman + 'n';
  } else if (lower.endsWith('morchel')) {
    return genusGerman + 'n';
  } else if (genusGerman !== 'Shiitake' && lower.endsWith('e')) {
    return genusGerman + 'n';
  } else if (lower.endsWith('kopf')) {
    return genusGerman.slice(0, -4) + 'köpfe';
  } else if (lower.endsWith('hut')) {
    return genusGerman.slice(0, -3) + 'hüte';
  } else if (lower.endsWith('fuss')) {
    return genusGerman.slice(0, -4) + 'füsse';
  } else if (lower.endsWith('schwamm')) {
    return genusGerman.slice(0, -7) + 'schwämme';
  } else if (lower.endsWith('blatt')) {
    return genusGerman.slice(0, -5) + 'blätter';
  } else if (lower.endsWith('zahn')) {
    return genusGerman.slice(0, -4) + 'zähne';
  } else if (lower.endsWith('bovist')) {
    return genusGerman.slice(0, -6) + 'boviste';
  } else if (lower.endsWith('keule')) {
    return genusGerman.slice(0, -5) + 'keulen';
  }

  return genusGerman;
}

/**
 * Import division
 */
async function importDivision(client, divisionName) {
  if (!divisionName || cache.divisions[divisionName]) {
    return cache.divisions[divisionName];
  }

  const result = await client.query(
    'INSERT INTO "Divisions" (id, name, "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, NOW(), NOW()) RETURNING id',
    [divisionName]
  );

  const data = {
    id: result.rows[0].id,
    name: divisionName,
  };

  cache.divisions[divisionName] = data;
  console.log(`Imported division: ${data.id} (${data.name})`);

  return data;
}

/**
 * Import class
 */
async function importClass(client, className, divisionId) {
  if (!className || !divisionId || cache.classes[className]) {
    return cache.classes[className];
  }

  const result = await client.query(
    'INSERT INTO "Classes" (id, name, "divisionId", "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, NOW(), NOW()) RETURNING id',
    [className, divisionId]
  );

  const data = {
    id: result.rows[0].id,
    name: className,
    divisionId: divisionId,
  };

  cache.classes[className] = data;
  console.log(`Imported class: ${data.id} (${data.name})`);

  return data;
}

/**
 * Import order
 */
async function importOrder(client, orderName, classId) {
  if (!orderName || !classId || cache.orders[orderName]) {
    return cache.orders[orderName];
  }

  const result = await client.query(
    'INSERT INTO "Orders" (id, name, "classId", "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, NOW(), NOW()) RETURNING id',
    [orderName, classId]
  );

  const data = {
    id: result.rows[0].id,
    name: orderName,
    classId: classId,
  };

  cache.orders[orderName] = data;
  console.log(`Imported order: ${data.id} (${data.name})`);

  return data;
}

/**
 * Import family
 */
async function importFamily(client, familyName, orderId) {
  if (!familyName || !orderId || cache.families[familyName]) {
    return cache.families[familyName];
  }

  const result = await client.query(
    'INSERT INTO "Families" (id, name, "orderId", "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, NOW(), NOW()) RETURNING id',
    [familyName, orderId]
  );

  const data = {
    id: result.rows[0].id,
    name: familyName,
    orderId: orderId,
  };

  cache.families[familyName] = data;
  console.log(`Imported family: ${data.id} (${data.name})`);

  return data;
}

/**
 * Import genus
 */
async function importGenus(client, genusName, genusGerman, familyId) {
  if (!genusName || !familyId) {
    return null;
  }

  if (cache.genera[genusName]) {
    return cache.genera[genusName];
  }

  // Check if genus already exists
  const existing = await client.query(
    'SELECT id, name, "commonName" FROM "Genera" WHERE name = $1',
    [genusName]
  );

  let data;

  if (existing.rows.length > 0 && !existing.rows[0].commonName) {
    // Update existing genus with German name
    await client.query(
      'UPDATE "Genera" SET "commonName" = $1, "familyId" = $2, "updatedAt" = NOW() WHERE id = $3',
      [genusGerman, familyId, existing.rows[0].id]
    );
    data = {
      id: existing.rows[0].id,
      name: genusName,
      commonName: genusGerman,
      familyId: familyId,
    };
  } else if (existing.rows.length === 0) {
    // Insert new genus
    const result = await client.query(
      'INSERT INTO "Genera" (id, name, "commonName", "familyId", "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW()) RETURNING id',
      [genusName, genusGerman, familyId]
    );
    data = {
      id: result.rows[0].id,
      name: genusName,
      commonName: genusGerman,
      familyId: familyId,
    };
  } else {
    data = existing.rows[0];
  }

  cache.genera[genusName] = data;
  console.log(`Imported genus: ${data.id} (${data.name})`);

  return data;
}

/**
 * Import species
 */
async function importSpecies(client, data) {
  const result = await client.query(
    `INSERT INTO "Species" (
      id, "scientificName", "commonName", "commonNameDE", edibility, "genusId", "createdAt", "updatedAt"
    ) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id`,
    [
      data.scientificName,
      data.commonName,
      data.commonName, // German name
      data.edibility,
      data.genusId,
    ]
  );

  console.log(`Imported species: ${result.rows[0].id} (${data.scientificName})`);

  return result.rows[0].id;
}

/**
 * Process CSV row
 */
async function processRow(client, row) {
  // Extract fields from CSV row (array of values)
  const isValidName = row[0]?.replace(/[\*"]/g, '').trim();
  const genus = row[1]?.replace(/\*/g, '').trim();
  const species = row[2]?.replace(/\*/g, '').trim();
  let synonyms = row[34]?.replace(/\*/g, '').replace(/^=\s*/, '').replace(/\?$/, '').trim() || '';
  const names = row[35]?.replace(/["*]/g, '').trim() || '';
  const edibility = row[39]?.trim();
  const family = row[41]?.trim();
  const order = row[42]?.trim();
  const klasse = row[43]?.trim();
  const division = row[44]?.trim();

  // Skip invalid entries
  if (!genus || !species) {
    return;
  }

  // Skip "Incertae sedis" entries
  if (
    family?.includes('Incertae sedis') ||
    order?.includes('Incertae sedis') ||
    klasse?.includes('Incertae sedis') ||
    division?.includes('Incertae sedis')
  ) {
    return;
  }

  // Parse German names
  const nameSplit = names.split(',').map(n => n.trim()).filter(Boolean);
  const name = nameSplit[0] || '';

  // Extract genus German name
  let genusGerman = '';
  const nameParts = name.split('-').map(n => n.trim()).filter(Boolean);
  if (nameParts.length > 1) {
    genusGerman = getGenusGerman(nameParts[nameParts.length - 1]);
  }

  // Validate entry
  if (
    !name ||
    name === '' ||
    name === '-' ||
    isValidName.includes('(') ||
    isValidName === '' ||
    !['r', 'k'].includes(isValidName.toLowerCase())
  ) {
    return;
  }

  // Expand synonyms abbreviations
  if (synonyms && genus) {
    synonyms = synonyms.replace(new RegExp(`${genus[0]}\\.`, 'g'), genus);
    if (species) {
      synonyms = synonyms.replace(new RegExp(`${species[0]}\\.`, 'g'), species);
    }
  }

  // Map edibility to our schema
  const edibilityMap = {
    'essbar': 'edible',
    'giftig': 'poisonous',
    'ungeniessbar': 'inedible',
    'ungeniessbar/schwach giftig': 'inedible',
  };
  const edibilityValue = edibilityMap[edibility?.toLowerCase()] || 'unknown';

  try {
    // Import taxonomy hierarchy
    const divisionObj = await importDivision(client, division);
    if (!divisionObj) return;

    const classObj = await importClass(client, klasse, divisionObj.id);
    if (!classObj) return;

    const orderObj = await importOrder(client, order, classObj.id);
    if (!orderObj) return;

    const familyObj = await importFamily(client, family, orderObj.id);
    if (!familyObj) return;

    const genusObj = await importGenus(client, genus, genusGerman, familyObj.id);
    if (!genusObj) return;

    // Import species
    await importSpecies(client, {
      scientificName: `${genus} ${species}`,
      commonName: name,
      edibility: edibilityValue,
      genusId: genusObj.id,
    });
  } catch (error) {
    console.error(`Error processing row: ${genus} ${species}`, error.message);
  }
}

/**
 * Main import function
 */
async function importSpeciesData() {
  console.log('Starting species import...');

  const client = await pool.connect();

  try {
    // Clear existing data
    await clearTables();

    // Read and process CSV file
    const csvFilePath = path.join(__dirname, '../../idea/import.csv');

    if (!fs.existsSync(csvFilePath)) {
      throw new Error(`CSV file not found: ${csvFilePath}`);
    }

    const rows = [];

    // Parse CSV
    await new Promise((resolve, reject) => {
      let skipLines = 2;
      fs.createReadStream(csvFilePath)
        .pipe(csvParser({ separator: ';', headers: false }))
        .on('data', (row) => {
          if (skipLines > 0) {
            skipLines--;
            return;
          }
          // Convert object to array
          const rowArray = Object.values(row);
          rows.push(rowArray);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`Processing ${rows.length} rows...`);

    // Process each row
    for (const row of rows) {
      await processRow(client, row);
    }

    console.log('Import completed successfully!');
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the import
importSpeciesData()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
