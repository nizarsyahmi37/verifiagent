import { PublicKey } from '@solana/web3.js';

export interface Agent {
  agentId: string;
  walletAddress: string;
  publicKey: string;
  trustLevel: TrustLevel;
  totalActivities: number;
  createdAt: number;
  lastActivity: number;
}

export enum TrustLevel {
  L0_REGISTERED = 0,
  L1_CONFIRMED = 1,
  L2_ACTIVE = 2,
  L3_TRUSTED = 3,
}

export interface Challenge {
  challengeId: string;
  agentId: string;
  nonce: string;
  message: string;
  expiresAt: number;
  createdAt: number;
}

export interface ActivityTrace {
  traceId: string;
  agentId: string;
  actionHash: string;
  actionType: string;
  timestamp: number;
  signature: string;
  onChainTxHash?: string;
}

export interface VerificationResponse {
  verified: boolean;
  credentialId: string;
  trustLevel: TrustLevel;
  message?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
