import express from 'express';
import cors from 'cors';
import { config } from './config';
import apiRouter from './api';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API routes
app.use('/api', apiRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'VerifiAgent API',
    version: '1.0.0',
    description: 'Identity + Execution Trace Protocol for AI Agents on Solana',
    endpoints: {
      health: 'GET /api/health',
      verification: {
        challenge: 'POST /api/verify/challenge',
        response: 'POST /api/verify/response',
        status: 'GET /api/verify/:agentId',
      },
      activity: {
        log: 'POST /api/activity/log',
        history: 'GET /api/activity/:agentId',
        verify: 'GET /api/activity/verify/:hash',
        stats: 'GET /api/activity/stats/global',
      },
    },
    docs: 'https://github.com/nizarsyahmi37/verifiagent',
  });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: config.nodeEnv === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(config.port, () => {
  console.log('='.repeat(50));
  console.log('🚀 VerifiAgent API Server');
  console.log('='.repeat(50));
  console.log(`📡 Server running on http://localhost:${config.port}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`⛓️  Solana Network: ${config.solana.network}`);
  console.log('='.repeat(50));
  console.log('\n📚 API Documentation:');
  console.log(`   GET  http://localhost:${config.port}/`);
  console.log(`   GET  http://localhost:${config.port}/api/health`);
  console.log('\n🔐 Verification:');
  console.log(`   POST http://localhost:${config.port}/api/verify/challenge`);
  console.log(`   POST http://localhost:${config.port}/api/verify/response`);
  console.log(`   GET  http://localhost:${config.port}/api/verify/:agentId`);
  console.log('\n📊 Activity:');
  console.log(`   POST http://localhost:${config.port}/api/activity/log`);
  console.log(`   GET  http://localhost:${config.port}/api/activity/:agentId`);
  console.log(`   GET  http://localhost:${config.port}/api/activity/verify/:hash`);
  console.log('='.repeat(50));
});
