import { storage } from './storage';
import { solanaLiveService } from './solana-live';
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

    // Log activity on-chain (async, non-blocking) - LIVE ON DEVNET!
    const actionHashBuffer = Buffer.from(actionHash, 'hex');
    solanaLiveService
      .logActivity(agent.walletAddress, actionHashBuffer, actionType, agent.totalActivities)
      .then((result) => {
        if (result.success && result.txHash) {
          console.log(`[Solana LIVE] Activity logged on devnet: ${result.txHash}`);
          console.log(`[Solana LIVE] Explorer: https://explorer.solana.com/tx/${result.txHash}?cluster=devnet`);
          console.log(`[Solana LIVE] Trace PDA: ${result.tracePDA}`);
          // Update trace with on-chain info
          storage.updateActivity(trace.traceId, {
            onChainTxHash: result.txHash,
          });
        } else {
          console.error('[Solana LIVE] Failed to log activity on-chain');
        }
      })
      .catch((err) => console.error('[Solana LIVE] Error:', err));

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

    // Verify on-chain if txHash exists - LIVE ON DEVNET!
    let onChainVerified = false;
    if (trace.onChainTxHash) {
      try {
        const onChainResult = await solanaLiveService.verifyTrace(trace.onChainTxHash);
        onChainVerified = onChainResult.verified;
        if (onChainVerified) {
          console.log(`[Solana LIVE] Verified on devnet: ${trace.onChainTxHash}`);
        }
      } catch (err) {
        console.error('[Solana LIVE] Error verifying on-chain:', err);
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
