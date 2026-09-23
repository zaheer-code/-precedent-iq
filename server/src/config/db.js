import pkg from 'pg';
const { Pool } = pkg;
import pgvector from 'pgvector/pg';
import { ENV } from './env.js';

let pool = null;
let isConnected = false;

export function maskConnectionString(urlStr) {
  if (!urlStr) return '(empty)';
  try {
    const parsed = new URL(urlStr);
    return `${parsed.protocol}//${parsed.username ? parsed.username + ':***@' : ''}${parsed.host}${parsed.pathname}`;
  } catch (e) {
    return 'postgresql://***:***@masked-host/masked-db';
  }
}

function getSslConfig(urlStr) {
  if (!urlStr) return false;
  const isLocal = urlStr.includes('localhost') || urlStr.includes('127.0.0.1');
  const isExplicitSsl = urlStr.includes('sslmode=require') || urlStr.includes('ssl=true');
  const isCloudHost = urlStr.includes('supabase.co') ||
                      urlStr.includes('supabase.com') ||
                      urlStr.includes('pooler.supabase.com') ||
                      urlStr.includes('neon.tech') ||
                      urlStr.includes('render.com') ||
                      urlStr.includes('railway.app');

  if (isExplicitSsl || isCloudHost || (!isLocal && ENV.NODE_ENV !== 'test')) {
    return { rejectUnauthorized: false };
  }
  return false;
}

export function getPool() {
  if (!pool) {
    const ssl = getSslConfig(ENV.DATABASE_URL);
    pool = new Pool({
      connectionString: ENV.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
      ssl
    });

    pool.on('error', (err) => {
      console.error('[Database Pool Error]:', err.message);
    });
  }
  return pool;
}

export async function testDbConnection() {
  try {
    const p = getPool();
    const client = await p.connect();
    try {
      try {
        await pgvector.registerType(client);
      } catch (vecErr) {
        // vector extension might not be enabled yet before migrations
      }
      const res = await client.query('SELECT NOW() as current_time, current_database() as db_name, version()');
      isConnected = true;
      const masked = maskConnectionString(ENV.DATABASE_URL);
      console.log(`[Database Connected]: Connected to ${masked} (DB: '${res.rows[0].db_name}') at ${res.rows[0].current_time}`);
      return { connected: true, details: res.rows[0] };
    } finally {
      client.release();
    }
  } catch (err) {
    isConnected = false;
    const masked = maskConnectionString(ENV.DATABASE_URL);
    console.warn(`[Database Warning]: Could not connect to PostgreSQL at ${masked} (${err.message}). PrecedentIQ will operate in resilient mode.`);
    return { connected: false, error: err.message };
  }
}

export async function query(text, params = []) {
  const p = getPool();
  const start = Date.now();
  try {
    const res = await p.query(text, params);
    const duration = Date.now() - start;
    if (ENV.NODE_ENV === 'development' && duration > 1000) {
      console.warn(`[Slow Query] (${duration}ms): ${text.slice(0, 100)}...`);
    }
    return res;
  } catch (error) {
    console.error(`[DB Query Error]: ${error.message} \nQuery: ${text}`);
    throw error;
  }
}

export async function getClient() {
  const p = getPool();
  const client = await p.connect();
  try {
    await pgvector.registerType(client);
  } catch (vecErr) {
    // Graceful fallback if pgvector type is registered on demand
  }
  return client;
}

export { isConnected };

