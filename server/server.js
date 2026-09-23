import app from './src/app.js';
import { ENV } from './src/config/env.js';
import { testDbConnection } from './src/config/db.js';
import { runMigrations } from './src/db/migrate.js';

const PORT = ENV.PORT || 5000;

async function startServer() {
  console.log('----------------------------------------------------');
  console.log(' Starting PrecedentIQ Legal Intelligence Server...   ');
  console.log('----------------------------------------------------');

  // Test database connection
  const dbStatus = await testDbConnection();
  if (dbStatus.connected) {
    try {
      await runMigrations();
    } catch (migErr) {
      console.warn('[Auto-Migration Warning]:', migErr.message);
    }
  }

  const server = app.listen(PORT, () => {
    console.log(`[PrecedentIQ Server] Running at: http://localhost:${PORT}`);
    console.log(`[PrecedentIQ Health] Health check at: http://localhost:${PORT}/api/health`);
    console.log(`[Environment] Mode: ${ENV.NODE_ENV}`);
  });

  // Graceful shutdown handling
  const handleShutdown = () => {
    console.log('\n[PrecedentIQ Server] Gracefully shutting down...');
    server.close(() => {
      console.log('[PrecedentIQ Server] Closed out remaining connections.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', handleShutdown);
  process.on('SIGINT', handleShutdown);
}

startServer();
