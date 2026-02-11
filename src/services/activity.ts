import { storage } from './storage';
import { solanaService } from './solana';
import { ActivityTrace } from '../types';
import { hashAction, generateId } from '../utils/crypto';
import { verificationService } from './verification';

/**
 * Activity Service
 * Handles activity logging and on-chain anchoring
 */
class ActivityService {
  /**
   * Log agent activity
   */
  logActivity(
    agentId: string,
    actionType: string,
    actionData: any,
    signature: string
  ): ActivityTrace {
    const agent = storage.getAgent(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    // Hash the action
    const actionHash = hashAction({
      agentId,
      actionType,
      actionData,
      timestamp: Date.now(),
    });

    // Create activity trace
    const trace: ActivityTrace = {
      traceId: generateId('trace'),
      agentId,
      actionHash,
      actionType,
      timestamp: Date.now(),
      signature,
      // TODO: Anchor to Solana and add txHash
      onChainTxHash: undefined,
    };

    // Store activity
    storage.addActivity(trace);

    // Update agent stats
    const totalActivities = agent.totalActivities + 1;
    const newTrustLevel = verificationService.computeTrustLevel({
      ...agent,
      totalActivities,
    });

    storage.updateAgent(agentId, {
      totalActivities,
      lastActivity: Date.now(),
      trustLevel: newTrustLevel,
    });

    // Log activity on-chain (async, non-blocking)
    const actionHashBuffer = Buffer.from(actionHash, 'hex');
    solanaService
      .logActivity(agent.walletAddress, actionHashBuffer, actionType, agent.totalActivities)
      .then((result) => {
        if (result.success) {
          console.log(`[Solana] Activity logged on-chain: ${result.txHash}`);
          console.log(`[Solana] Trace PDA: ${result.tracePDA}`);
          // Update trace with on-chain info
          storage.updateActivity(trace.traceId, {
            onChainTxHash: result.txHash,
          });
        } else {
          console.error('[Solana] Failed to log activity on-chain');
        }
      })
      .catch((err) => console.error('[Solana] Error:', err));

    return trace;
  }

  /**
   * Get agent activities
   */
  getActivities(agentId: string, limit: number = 50): ActivityTrace[] {
    return storage.getActivities(agentId, limit);
  }

  /**
   * Verify activity trace
   */
  async verifyTrace(actionHash: string): Promise<{
    valid: boolean;
    trace?: ActivityTrace;
    onChain?: boolean;
    message: string;
  }> {
    const trace = storage.getActivityByHash(actionHash);

    if (!trace) {
      return {
        valid: false,
        message: 'Trace not found',
      };
    }

    // Verify on-chain if txHash exists
    let onChainVerified = false;
    if (trace.onChainTxHash) {
      try {
        const agent = storage.getAgent(trace.agentId);
        if (agent) {
          const tracePDA = await solanaService.getTracePDA(agent.walletAddress, agent.totalActivities - 1);
          const onChainResult = await solanaService.verifyTrace(tracePDA.toBase58());
          onChainVerified = onChainResult.verified;
        }
      } catch (err) {
        console.error('[Solana] Error verifying on-chain:', err);
      }
    }

    return {
      valid: true,
      trace,
      onChain: onChainVerified,
      message: onChainVerified ? 'Trace verified on-chain' : 'Trace verified off-chain',
    };
  }

  /**
   * Get activity stats
   */
  getStats() {
    return {
      totalAgents: storage.getTotalAgents(),
      totalActivities: storage.getTotalActivities(),
    };
  }
}

export const activityService = new ActivityService();
