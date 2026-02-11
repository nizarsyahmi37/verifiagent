import { Router, Request, Response } from 'express';
import { activityService } from '../services/activity';
import { ApiResponse } from '../types';

const router = Router();

/**
 * POST /api/activity/log
 * Log a new activity
 */
router.post('/log', (req: Request, res: Response) => {
  try {
    const { agentId, actionType, actionData, signature } = req.body;

    if (!agentId || !actionType || !actionData || !signature) {
      return res.status(400).json({
        success: false,
        error: 'agentId, actionType, actionData, and signature are required',
      } as ApiResponse);
    }

    const trace = activityService.logActivity(
      agentId,
      actionType,
      actionData,
      signature
    );

    res.json({
      success: true,
      data: trace,
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    } as ApiResponse);
  }
});

/**
 * GET /api/activity/:agentId
 * Get agent activity history
 */
router.get('/:agentId', (req: Request, res: Response) => {
  try {
    const agentId = req.params.agentId as string;
    const limit = parseInt((req.query.limit as string) || '50');

    const activities = activityService.getActivities(agentId, limit);

    res.json({
      success: true,
      data: {
        agentId,
        activities,
        count: activities.length,
      },
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    } as ApiResponse);
  }
});

/**
 * GET /api/activity/verify/:hash
 * Verify an activity trace
 */
router.get('/verify/:hash', (req: Request, res: Response) => {
  try {
    const hash = req.params.hash as string;

    const result = activityService.verifyTrace(hash);

    res.json({
      success: true,
      data: result,
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    } as ApiResponse);
  }
});

/**
 * GET /api/activity/stats
 * Get global stats
 */
router.get('/stats/global', (req: Request, res: Response) => {
  try {
    const stats = activityService.getStats();

    res.json({
      success: true,
      data: stats,
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    } as ApiResponse);
  }
});

export default router;
