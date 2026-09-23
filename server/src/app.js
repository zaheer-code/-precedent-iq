import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { ENV } from './config/env.js';
import { testDbConnection } from './config/db.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Import route modules
import authRoutes from './routes/authRoutes.js';
import matterRoutes from './routes/matterRoutes.js';
import { directDocumentRouter } from './routes/documentRoutes.js';
import { directResearchRouter } from './routes/researchRoutes.js';
import evidenceRoutes from './routes/evidenceRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import auditRoutes from './routes/auditRoutes.js';

const app = express();

// Security HTTP headers
app.use(helmet({
  contentSecurityPolicy: false, // Allow frontend resources in dev
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration
const configuredOrigins = (ENV.CLIENT_URL || '')
  .split(',')
  .map(url => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) {
      return callback(null, true);
    }
    const cleanOrigin = origin.replace(/\/$/, '');
    // Allow localhost and local IP addresses for development
    if (cleanOrigin.startsWith('http://localhost') || cleanOrigin.startsWith('http://127.0.0.1')) {
      return callback(null, true);
    }
    // Allow explicitly configured CLIENT_URL(s)
    if (configuredOrigins.includes(cleanOrigin)) {
      return callback(null, true);
    }
    // Allow Vercel deployment previews and production domains
    if (cleanOrigin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    if (ENV.NODE_ENV === 'development') {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy blocked access from origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Logging
if (ENV.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsing with safe size bounds
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// General Rate Limiting
app.use('/api/', generalLimiter);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const dbStatus = await testDbConnection();
  res.json({
    status: 'healthy',
    application: 'PrecedentIQ',
    version: '1.0.0',
    environment: ENV.NODE_ENV,
    timestamp: new Date().toISOString(),
    database: dbStatus.connected ? 'connected' : 'resilient/offline',
    aiEngine: ENV.GEMINI_API_KEY ? 'gemini-2.5-flash configured' : 'grounded fallback mode'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/matters', matterRoutes);
app.use('/api/documents', directDocumentRouter);
app.use('/api/research', directResearchRouter);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/audit', auditRoutes);

// 404 & Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
