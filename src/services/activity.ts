import { storage } from './storage';
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
  verifyTrace(actionHash: string): {
    valid: boolean;
    trace?: ActivityTrace;
    message: string;
  } {
    const trace = storage.getActivityByHash(actionHash);

    if (!trace) {
      return {
        valid: false,
        message: 'Trace not found',
      };
    }

    // TODO: Verify on-chain hash matches

    return {
      valid: true,
      trace,
      message: 'Trace verified',
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
