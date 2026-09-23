import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPool, testDbConnection, maskConnectionString } from '../config/db.js';
import { ENV } from '../config/env.js';
import pgvector from 'pgvector/pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations() {
  const masked = maskConnectionString(ENV.DATABASE_URL);
  console.log(`[Migration] Starting PrecedentIQ database migration on ${masked}...`);
  const pool = getPool();
  const client = await pool.connect();

  try {
    const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
    const indexesPath = path.resolve(__dirname, '../../../database/indexes.sql');

    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at ${schemaPath}`);
    }

    // 1. Extensions
    console.log('[Migration] 1. Ensuring pgcrypto and vector extensions exist...');
    await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
    await client.query('CREATE EXTENSION IF NOT EXISTS vector;');
    console.log('[Migration] Extensions verified.');

    // Register vector type
    try {
      await pgvector.registerType(client);
    } catch (e) {
      // Ignored if already registered
    }

    // 2. Schema DDL
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('[Migration] 2. Executing schema.sql (tables & constraints)...');
    await client.query(schemaSql);
    console.log('[Migration] Tables and constraints created successfully.');

    // 3. Indexes
    if (fs.existsSync(indexesPath)) {
      const indexesSql = fs.readFileSync(indexesPath, 'utf8');
      console.log('[Migration] 3. Executing indexes.sql (HNSW vector index & B-trees)...');
      try {
        await client.query(indexesSql);
        console.log('[Migration] Indexes created successfully.');
      } catch (idxErr) {
        console.warn('[Migration Warning] Index creation notice:', idxErr.message);
      }
    }

    // 4. Verification
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    const tables = tablesRes.rows.map(r => r.table_name);
    console.log(`[Migration] Active public tables (${tables.length}):`, tables.join(', '));

    console.log('[Migration] ✅ All migrations completed successfully!');
    return { success: true, tables };
  } catch (error) {
    console.error('[Migration Error]:', error.message);
    if (error.detail) console.error('Detail:', error.detail);
    if (error.hint) console.error('Hint:', error.hint);
    throw error;
  } finally {
    client.release();
  }
}

// Allow direct execution from CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  (async () => {
    try {
      const conn = await testDbConnection();
      if (!conn.connected) {
        console.error('[Migration Failed] Cannot connect to database. Please check DATABASE_URL in .env');
        process.exit(1);
      }
      await runMigrations();
      process.exit(0);
    } catch (err) {
      console.error('[Fatal Migration Error]:', err.message);
      process.exit(1);
    }
  })();
}

