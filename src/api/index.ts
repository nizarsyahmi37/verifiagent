import { Router } from 'express';
import verificationRouter from './verification';
import activityRouter from './activity';

const router = Router();

// Mount routes
router.use('/verify', verificationRouter);
router.use('/activity', activityRouter);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: Date.now(),
      service: 'VerifiAgent API',
      version: '1.0.0',
    },
  });
});

export default router;
