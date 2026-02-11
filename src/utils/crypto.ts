import crypto from 'crypto';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { PublicKey } from '@solana/web3.js';

/**
 * Generate a random challenge nonce
 */
export function generateNonce(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate challenge message for signing
 */
export function generateChallengeMessage(agentId: string, nonce: string): string {
  return `VerifiAgent Challenge\nAgent: ${agentId}\nNonce: ${nonce}\nTimestamp: ${Date.now()}`;
}

/**
 * Verify Solana signature
 */
export function verifySolanaSignature(
  message: string,
  signature: string,
  publicKey: string
): boolean {
  try {
    const messageBytes = Buffer.from(message, 'utf8');
    const signatureBytes = bs58.decode(signature);
    const publicKeyBytes = new PublicKey(publicKey).toBytes();

    return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Hash action data for on-chain storage
 */
export function hashAction(action: any): string {
  const jsonString = JSON.stringify(action);
  return crypto.createHash('sha256').update(jsonString).digest('hex');
}

/**
 * Generate unique ID
 */
export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
}
