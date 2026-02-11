import { Agent, Challenge, ActivityTrace, TrustLevel } from '../types';

/**
 * In-memory storage for MVP
 * For production, replace with PostgreSQL + Redis
 */
class StorageService {
  private agents: Map<string, Agent> = new Map();
  private challenges: Map<string, Challenge> = new Map();
  private activities: Map<string, ActivityTrace[]> = new Map();

  // Agent operations
  createAgent(agent: Agent): void {
    this.agents.set(agent.agentId, agent);
  }

  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  getAgentByWallet(walletAddress: string): Agent | undefined {
    return Array.from(this.agents.values()).find(
      (agent) => agent.walletAddress === walletAddress
    );
  }

  updateAgent(agentId: string, updates: Partial<Agent>): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      this.agents.set(agentId, { ...agent, ...updates });
    }
  }

  // Challenge operations
  createChallenge(challenge: Challenge): void {
    this.challenges.set(challenge.challengeId, challenge);
  }

  getChallenge(challengeId: string): Challenge | undefined {
    return this.challenges.get(challengeId);
  }

  deleteChallenge(challengeId: string): void {
    this.challenges.delete(challengeId);
  }

  getChallengeByAgentId(agentId: string): Challenge | undefined {
    return Array.from(this.challenges.values()).find(
      (challenge) => challenge.agentId === agentId
    );
  }

  // Activity operations
  addActivity(activity: ActivityTrace): void {
    const agentActivities = this.activities.get(activity.agentId) || [];
    agentActivities.push(activity);
    this.activities.set(activity.agentId, agentActivities);
  }

  getActivities(agentId: string, limit: number = 50): ActivityTrace[] {
    const activities = this.activities.get(agentId) || [];
    return activities.slice(-limit).reverse();
  }

  getActivityByHash(actionHash: string): ActivityTrace | undefined {
    for (const activities of this.activities.values()) {
      const activity = activities.find((a) => a.actionHash === actionHash);
      if (activity) return activity;
    }
    return undefined;
  }

  // Stats
  getTotalAgents(): number {
    return this.agents.size;
  }

  getTotalActivities(): number {
    let total = 0;
    for (const activities of this.activities.values()) {
      total += activities.length;
    }
    return total;
  }

  // Cleanup expired challenges
  cleanupExpiredChallenges(): void {
    const now = Date.now();
    for (const [id, challenge] of this.challenges.entries()) {
      if (challenge.expiresAt < now) {
        this.challenges.delete(id);
      }
    }
  }
}

export const storage = new StorageService();

// Cleanup expired challenges every minute
setInterval(() => {
  storage.cleanupExpiredChallenges();
}, 60 * 1000);
