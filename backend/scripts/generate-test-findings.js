import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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

// Swiss locations with coordinates (latitude, longitude)
const swissLocations = [
  { name: 'Zürich', lat: 47.3769, lon: 8.5417 },
  { name: 'Geneva', lat: 46.2044, lon: 6.1432 },
  { name: 'Basel', lat: 47.5596, lon: 7.5886 },
  { name: 'Bern', lat: 46.9480, lon: 7.4474 },
  { name: 'Lausanne', lat: 46.5197, lon: 6.6323 },
  { name: 'Lucerne', lat: 47.0502, lon: 8.3093 },
  { name: 'Lugano', lat: 46.0037, lon: 8.9511 },
  { name: 'St. Gallen', lat: 47.4239, lon: 9.3745 },
  { name: 'Interlaken', lat: 46.6863, lon: 7.8632 },
  { name: 'Zermatt', lat: 46.0207, lon: 7.7491 },
  { name: 'Grindelwald', lat: 46.6247, lon: 8.0412 },
  { name: 'Davos', lat: 46.8008, lon: 9.8355 },
  { name: 'Thun', lat: 46.7583, lon: 7.6278 },
  { name: 'Montreux', lat: 46.4312, lon: 6.9107 },
  { name: 'Neuchâtel', lat: 46.9893, lon: 6.9298 },
];

const weatherConditions = ['sunny', 'cloudy', 'rainy', 'foggy'];

const notes = [
  'Found near a large oak tree',
  'Growing in a cluster',
  'Spotted after recent rainfall',
  'Located in shaded area',
  'Found near hiking trail',
  'Growing on dead wood',
  'In mixed forest area',
  'Near a small stream',
  'Under pine trees',
  'In mossy area',
];

// Helper to get random item from array
function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper to get random integer between min and max
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper to get random float between min and max
function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

// Helper to get random date in the last 90 days
function randomRecentDate() {
  const now = new Date();
  const daysAgo = randomInt(0, 90);
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return date.toISOString();
}

// Add small random offset to coordinates to vary exact location
function addLocationJitter(lat, lon) {
  return {
    lat: lat + randomFloat(-0.05, 0.05),
    lon: lon + randomFloat(-0.05, 0.05),
  };
}

async function generateTestFindings() {
  const client = await pool.connect();

  try {
    console.log('Generating test findings for user "testuser"...\n');

    // Get testuser ID
    const userResult = await client.query(
      'SELECT id FROM "Users" WHERE username = $1',
      ['testuser']
    );

    if (userResult.rows.length === 0) {
      console.error('Error: User "testuser" not found. Please create this user first.');
      return;
    }

    const userId = userResult.rows[0].id;
    console.log(`Found user "testuser" with ID: ${userId}`);

    // Get random species (limit to 20 for variety)
    const speciesResult = await client.query(
      'SELECT id, "scientificName", edibility FROM "Species" ORDER BY RANDOM() LIMIT 20'
    );

    if (speciesResult.rows.length === 0) {
      console.error('Error: No species found in database. Please import species first.');
      return;
    }

    console.log(`Found ${speciesResult.rows.length} species to use for test findings\n`);

    // Generate 30 test findings
    const numberOfFindings = 30;
    let created = 0;

    for (let i = 0; i < numberOfFindings; i++) {
      const species = random(speciesResult.rows);
      const location = random(swissLocations);
      const coords = addLocationJitter(location.lat, location.lon);
      const weather = random(weatherConditions);
      const quantity = randomInt(1, 15);
      const temperature = randomFloat(5, 25).toFixed(1);
      const foundAt = randomRecentDate();
      const note = random(notes);

      await client.query(
        `INSERT INTO "Findings"
        (id, "userId", "speciesId", latitude, longitude, location, "foundAt", quantity, weather, temperature, notes, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
        [
          userId,
          species.id,
          coords.lat,
          coords.lon,
          `Near ${location.name}`,
          foundAt,
          quantity,
          weather,
          parseFloat(temperature),
          note,
        ]
      );

      created++;
      console.log(`Created finding ${created}/${numberOfFindings}: ${species.scientificName} near ${location.name}`);
    }

    console.log(`\n✅ Successfully created ${created} test findings for user "testuser"`);

  } catch (error) {
    console.error('Error generating test findings:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
generateTestFindings().catch(console.error);
