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

async function checkOrphanedFindings() {
  const client = await pool.connect();

  try {
    console.log('Checking for findings with missing species...\n');

    // Find findings where species doesn't exist
    const result = await client.query(`
      SELECT f.id, f."speciesId", f.location, f."foundAt"
      FROM "Findings" f
      LEFT JOIN "Species" s ON f."speciesId" = s.id
      WHERE s.id IS NULL
    `);

    if (result.rows.length === 0) {
      console.log('✅ No orphaned findings found. All findings have valid species.');
    } else {
      console.log(`❌ Found ${result.rows.length} findings with missing species:\n`);
      result.rows.forEach((row, index) => {
        console.log(`${index + 1}. Finding ID: ${row.id}`);
        console.log(`   Species ID: ${row.speciesId} (MISSING)`);
        console.log(`   Location: ${row.location || 'N/A'}`);
        console.log(`   Found at: ${row.foundAt}`);
        console.log('');
      });

      console.log('\nTo fix this, you can:');
      console.log('1. Delete these findings:');
      console.log('   DELETE FROM "Findings" WHERE "speciesId" NOT IN (SELECT id FROM "Species");');
      console.log('2. Or update them to use a valid species ID');
    }

  } catch (error) {
    console.error('Error checking orphaned findings:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
checkOrphanedFindings().catch(console.error);
