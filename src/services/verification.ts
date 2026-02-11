import { v4 as uuidv4 } from 'uuid';
import { storage } from './storage';
import { Challenge, Agent, TrustLevel, VerificationResponse } from '../types';
import { generateNonce, generateChallengeMessage, verifySolanaSignature, generateId } from '../utils/crypto';
import { config } from '../config';

/**
 * Verification Service
 * Handles challenge-response authentication
 */
class VerificationService {
  /**
   * Create verification challenge
   */
  createChallenge(agentId: string, walletAddress: string): Challenge {
    // Check if agent already exists
    let agent = storage.getAgent(agentId) || storage.getAgentByWallet(walletAddress);

    if (!agent) {
      // Create new agent record
      agent = {
        agentId,
        walletAddress,
        publicKey: walletAddress, // For now, same as wallet
        trustLevel: TrustLevel.L0_REGISTERED,
        totalActivities: 0,
        createdAt: Date.now(),
        lastActivity: Date.now(),
      };
      storage.createAgent(agent);
    }

    // Delete any existing challenge for this agent
    const existingChallenge = storage.getChallengeByAgentId(agentId);
    if (existingChallenge) {
      storage.deleteChallenge(existingChallenge.challengeId);
    }

    // Generate new challenge
    const nonce = generateNonce();
    const message = generateChallengeMessage(agentId, nonce);
    const challenge: Challenge = {
      challengeId: generateId('chal'),
      agentId,
      nonce,
      message,
      expiresAt: Date.now() + config.challenge.expirationTime,
      createdAt: Date.now(),
    };

    storage.createChallenge(challenge);
    return challenge;
  }

  /**
   * Verify challenge response
   */
  verifyChallenge(
    challengeId: string,
    signature: string,
    publicKey: string
  ): VerificationResponse {
    // Get challenge
    const challenge = storage.getChallenge(challengeId);
    if (!challenge) {
      return {
        verified: false,
        credentialId: '',
        trustLevel: TrustLevel.L0_REGISTERED,
        message: 'Challenge not found or expired',
      };
    }

    // Check expiration
    if (challenge.expiresAt < Date.now()) {
      storage.deleteChallenge(challengeId);
      return {
        verified: false,
        credentialId: '',
        trustLevel: TrustLevel.L0_REGISTERED,
        message: 'Challenge expired',
      };
    }

    // Verify signature
    const isValid = verifySolanaSignature(challenge.message, signature, publicKey);

    if (!isValid) {
      return {
        verified: false,
        credentialId: '',
        trustLevel: TrustLevel.L0_REGISTERED,
        message: 'Invalid signature',
      };
    }

    // Update agent trust level
    const agent = storage.getAgent(challenge.agentId);
    if (agent && agent.trustLevel === TrustLevel.L0_REGISTERED) {
      storage.updateAgent(agent.agentId, {
        trustLevel: TrustLevel.L1_CONFIRMED,
        publicKey,
      });
    }

    // Delete challenge (one-time use)
    storage.deleteChallenge(challengeId);

    const credentialId = generateId('cred');

    return {
      verified: true,
      credentialId,
      trustLevel: agent?.trustLevel || TrustLevel.L1_CONFIRMED,
      message: 'Verification successful',
    };
  }

  /**
   * Get agent verification status
   */
  getVerificationStatus(agentId: string): {
    verified: boolean;
    trustLevel: TrustLevel;
    agent?: Agent;
  } {
    const agent = storage.getAgent(agentId);

    if (!agent) {
      return {
        verified: false,
        trustLevel: TrustLevel.L0_REGISTERED,
      };
    }

    return {
      verified: agent.trustLevel >= TrustLevel.L1_CONFIRMED,
      trustLevel: agent.trustLevel,
      agent,
    };
  }

  /**
   * Compute trust level based on activity
   */
  computeTrustLevel(agent: Agent): TrustLevel {
    const daysSinceCreation = (Date.now() - agent.createdAt) / (1000 * 60 * 60 * 24);

    if (agent.trustLevel < TrustLevel.L1_CONFIRMED) {
      return TrustLevel.L0_REGISTERED;
    }

    if (daysSinceCreation >= config.trustLevels.L3_TRUSTED_DAYS && agent.totalActivities >= 30) {
      return TrustLevel.L3_TRUSTED;
    }

    if (daysSinceCreation >= config.trustLevels.L2_ACTIVE_DAYS && agent.totalActivities >= 10) {
      return TrustLevel.L2_ACTIVE;
    }

    return TrustLevel.L1_CONFIRMED;
  }
}

export const verificationService = new VerificationService();
