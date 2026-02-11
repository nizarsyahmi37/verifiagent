import { Router, Request, Response } from 'express';
import { verificationService } from '../services/verification';
import { ApiResponse } from '../types';

const router = Router();

/**
 * POST /api/verify/challenge
 * Request a verification challenge
 */
router.post('/challenge', (req: Request, res: Response) => {
  try {
    const { agentId, walletAddress } = req.body;

    if (!agentId || !walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'agentId and walletAddress are required',
      } as ApiResponse);
    }

    const challenge = verificationService.createChallenge(agentId, walletAddress);

    res.json({
      success: true,
      data: {
        challengeId: challenge.challengeId,
        message: challenge.message,
        expiresAt: challenge.expiresAt,
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
 * POST /api/verify/response
 * Submit signed challenge response
 */
router.post('/response', (req: Request, res: Response) => {
  try {
    const { challengeId, signature, publicKey } = req.body;

    if (!challengeId || !signature || !publicKey) {
      return res.status(400).json({
        success: false,
        error: 'challengeId, signature, and publicKey are required',
      } as ApiResponse);
    }

    const result = verificationService.verifyChallenge(
      challengeId,
      signature,
      publicKey
    );

    if (!result.verified) {
      return res.status(401).json({
        success: false,
        error: result.message,
      } as ApiResponse);
    }

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
 * GET /api/verify/:agentId
 * Check verification status
 */
router.get('/:agentId', (req: Request, res: Response) => {
  try {
    const agentId = req.params.agentId as string;

    const status = verificationService.getVerificationStatus(agentId);

    res.json({
      success: true,
      data: status,
    } as ApiResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    } as ApiResponse);
  }
});

export default router;
