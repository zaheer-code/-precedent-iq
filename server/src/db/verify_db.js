import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;
import pgvector from 'pgvector/pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
const envPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });

const rawDbUrl = process.env.DATABASE_URL;

if (!rawDbUrl) {
  console.error('ERROR: DATABASE_URL is not defined in .env');
  process.exit(1);
}

// Function to safely mask the connection string (prevent revealing passwords)
function maskUrl(urlStr) {
  try {
    const parsed = new URL(urlStr);
    return `${parsed.protocol}//${parsed.username ? parsed.username + ':***@' : ''}${parsed.host}${parsed.pathname}`;
  } catch (e) {
    return 'postgresql://***:***@masked-host/masked-db';
  }
}

console.log(`[Verification] Connecting to: ${maskUrl(rawDbUrl)}`);

const isRemote = !rawDbUrl.includes('localhost') && !rawDbUrl.includes('127.0.0.1');
const pool = new Pool({
  connectionString: rawDbUrl,
  ssl: isRemote ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 15000
});

async function run() {
  const client = await pool.connect();
  try {
    console.log('[Verification] 1. Connected to PostgreSQL successfully!');
    
    // Check version
    const verRes = await client.query('SELECT version();');
    console.log('[Verification] PostgreSQL version:', verRes.rows[0].version.split(',')[0]);

    // Check / enable extensions
    console.log('[Verification] 2. Verifying extensions (pgcrypto, vector)...');
    await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
    console.log(' - Extension pgcrypto: OK');
    
    await client.query('CREATE EXTENSION IF NOT EXISTS vector;');
    console.log(' - Extension vector: OK');

    const extRes = await client.query("SELECT extname, extversion FROM pg_extension WHERE extname IN ('pgcrypto', 'vector');");
    console.log(' - Active extensions:', extRes.rows.map(r => `${r.extname} (v${r.extversion})`).join(', '));

    // Register vector type
    try {
      await pgvector.registerType(client);
      console.log(' - pgvector type registered with pg client: OK');
    } catch (err) {
      console.warn(' - pgvector type registration warning:', err.message);
    }

    // Apply schema
    console.log('\n[Verification] 3. Applying database schema...');
    const schemaFile = path.resolve(__dirname, '../../../database/schema.sql');
    const schemaSql = fs.readFileSync(schemaFile, 'utf8');
    await client.query(schemaSql);
    console.log(' - database/schema.sql executed successfully.');

    // Apply indexes
    console.log('\n[Verification] 4. Applying database indexes...');
    const indexesFile = path.resolve(__dirname, '../../../database/indexes.sql');
    const indexesSql = fs.readFileSync(indexesFile, 'utf8');
    await client.query(indexesSql);
    console.log(' - database/indexes.sql executed successfully.');

    // Verify tables
    console.log('\n[Verification] 5. Verifying created tables...');
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    const tables = tablesRes.rows.map(r => r.table_name);
    console.log(' Tables in database:', tables.join(', '));

    // Verify indexes
    console.log('\n[Verification] 6. Verifying created indexes...');
    const indexRes = await client.query(`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      ORDER BY tablename, indexname;
    `);
    console.log(` Found ${indexRes.rowCount} indexes in public schema:`);
    for (const row of indexRes.rows) {
      console.log(`  - [${row.tablename}] ${row.indexname}`);
    }

    // Test vector operations (insert and query cosine distance)
    console.log('\n[Verification] 7. Testing pgvector similarity query (768 dimensions)...');
    const testVec = Array.from({ length: 768 }, (_, i) => Math.sin(i + 1) * 0.05);
    const testVecStr = `[${testVec.join(',')}]`;
    const vectorTestRes = await client.query(
      `SELECT ($1::vector <=> $1::vector) AS cosine_distance;`,
      [testVecStr]
    );
    console.log(' - pgvector cosine distance calculation (self-distance, 0):', vectorTestRes.rows[0].cosine_distance);

    console.log('\n=============================================================');
    console.log('✅ ALL DATABASE VERIFICATIONS & MIGRATIONS PASSED SUCCESSFULLY');
    console.log('=============================================================');
  } catch (err) {
    console.error('\n❌ ERROR during database verification:', err.message);
    if (err.detail) console.error('Detail:', err.detail);
    if (err.hint) console.error('Hint:', err.hint);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
