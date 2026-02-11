import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import { config } from '../config';

/**
 * Solana On-Chain Integration Service
 *
 * This service handles interaction with the VerifiAgent Anchor program on Solana.
 * It provides methods to:
 * 1. Initialize agent identities on-chain
 * 2. Log activity traces immutably
 * 3. Verify traces from the blockchain
 */

export class SolanaService {
  private connection: Connection;
  private programId: PublicKey;

  constructor() {
    this.connection = new Connection(config.solana.rpcUrl, 'confirmed');
    this.programId = new PublicKey(config.solana.programId);
  }

  /**
   * Derive agent PDA address
   * Seeds: [b"agent", wallet_pubkey]
   */
  async getAgentPDA(walletAddress: string): Promise<PublicKey> {
    const walletPubkey = new PublicKey(walletAddress);
    const [agentPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('agent'), walletPubkey.toBuffer()],
      this.programId
    );
    return agentPDA;
  }

  /**
   * Derive activity trace PDA address
   * Seeds: [b"trace", wallet_pubkey, activity_index]
   */
  async getTracePDA(walletAddress: string, activityIndex: number): Promise<PublicKey> {
    const walletPubkey = new PublicKey(walletAddress);
    const indexBuffer = Buffer.alloc(8);
    indexBuffer.writeBigUInt64LE(BigInt(activityIndex));

    const [tracePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('trace'), walletPubkey.toBuffer(), indexBuffer],
      this.programId
    );
    return tracePDA;
  }

  /**
   * Check if agent PDA exists on-chain
   */
  async agentExists(walletAddress: string): Promise<boolean> {
    try {
      const agentPDA = await this.getAgentPDA(walletAddress);
      const accountInfo = await this.connection.getAccountInfo(agentPDA);
      return accountInfo !== null;
    } catch (error) {
      console.error('Error checking agent existence:', error);
      return false;
    }
  }

  /**
   * Initialize agent on-chain (call Anchor program)
   *
   * NOTE: This requires the Anchor program to be deployed and the wallet to sign.
   * For now, this is a stub that logs the intent.
   */
  async initializeAgent(walletAddress: string): Promise<{ success: boolean; txHash?: string }> {
    try {
      const agentPDA = await this.getAgentPDA(walletAddress);

      console.log(`[Solana] Would initialize agent on-chain:`);
      console.log(`  Wallet: ${walletAddress}`);
      console.log(`  Agent PDA: ${agentPDA.toBase58()}`);
      console.log(`  Program: ${this.programId.toBase58()}`);

      // TODO: Uncomment when Anchor program is deployed
      /*
      const provider = new AnchorProvider(this.connection, wallet, {});
      const program = new Program(IDL, this.programId, provider);

      const tx = await program.methods
        .initializeAgent()
        .accounts({
          agent: agentPDA,
          wallet: new PublicKey(walletAddress),
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return { success: true, txHash: tx };
      */

      return {
        success: true,
        txHash: 'mock_tx_' + Date.now() // Mock transaction hash for demo
      };
    } catch (error: any) {
      console.error('Error initializing agent:', error);
      return { success: false };
    }
  }

  /**
   * Log activity on-chain (call Anchor program)
   *
   * @param walletAddress - Agent's wallet address
   * @param actionHash - SHA-256 hash of the action (32 bytes)
   * @param actionType - Type of action (e.g., "trade", "message", "vote")
   * @param activityIndex - Current activity count for PDA derivation
   */
  async logActivity(
    walletAddress: string,
    actionHash: Buffer,
    actionType: string,
    activityIndex: number
  ): Promise<{ success: boolean; txHash?: string; tracePDA?: string }> {
    try {
      const agentPDA = await this.getAgentPDA(walletAddress);
      const tracePDA = await this.getTracePDA(walletAddress, activityIndex);

      console.log(`[Solana] Would log activity on-chain:`);
      console.log(`  Agent PDA: ${agentPDA.toBase58()}`);
      console.log(`  Trace PDA: ${tracePDA.toBase58()}`);
      console.log(`  Action Hash: ${actionHash.toString('hex')}`);
      console.log(`  Action Type: ${actionType}`);
      console.log(`  Index: ${activityIndex}`);

      // TODO: Uncomment when Anchor program is deployed
      /*
      const provider = new AnchorProvider(this.connection, wallet, {});
      const program = new Program(IDL, this.programId, provider);

      const tx = await program.methods
        .logActivity(Array.from(actionHash), actionType)
        .accounts({
          agent: agentPDA,
          trace: tracePDA,
          wallet: new PublicKey(walletAddress),
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return { success: true, txHash: tx, tracePDA: tracePDA.toBase58() };
      */

      return {
        success: true,
        txHash: 'mock_tx_' + Date.now(),
        tracePDA: tracePDA.toBase58(),
      };
    } catch (error: any) {
      console.error('Error logging activity:', error);
      return { success: false };
    }
  }

  /**
   * Verify activity trace from on-chain data
   */
  async verifyTrace(tracePDA: string): Promise<{
    success: boolean;
    verified: boolean;
    data?: any;
  }> {
    try {
      const tracePubkey = new PublicKey(tracePDA);
      const accountInfo = await this.connection.getAccountInfo(tracePubkey);

      if (!accountInfo) {
        return { success: true, verified: false };
      }

      console.log(`[Solana] Trace found on-chain:`);
      console.log(`  PDA: ${tracePDA}`);
      console.log(`  Data length: ${accountInfo.data.length} bytes`);

      // TODO: Deserialize account data using Anchor IDL
      /*
      const provider = new AnchorProvider(this.connection, wallet, {});
      const program = new Program(IDL, this.programId, provider);
      const traceAccount = await program.account.activityTrace.fetch(tracePubkey);

      return {
        success: true,
        verified: traceAccount.verified,
        data: {
          agent: traceAccount.agent.toBase58(),
          actionHash: Buffer.from(traceAccount.actionHash).toString('hex'),
          actionType: traceAccount.actionType,
          timestamp: traceAccount.timestamp.toNumber(),
          index: traceAccount.index.toNumber(),
        },
      };
      */

      return {
        success: true,
        verified: true, // Mock verification for demo
        data: {
          tracePDA,
          onChain: true,
        },
      };
    } catch (error: any) {
      console.error('Error verifying trace:', error);
      return { success: false, verified: false };
    }
  }

  /**
   * Get agent's on-chain data
   */
  async getAgentData(walletAddress: string): Promise<{
    success: boolean;
    data?: any;
  }> {
    try {
      const agentPDA = await this.getAgentPDA(walletAddress);
      const accountInfo = await this.connection.getAccountInfo(agentPDA);

      if (!accountInfo) {
        return { success: true, data: null };
      }

      console.log(`[Solana] Agent found on-chain:`);
      console.log(`  PDA: ${agentPDA.toBase58()}`);

      // TODO: Deserialize using Anchor IDL
      return {
        success: true,
        data: {
          agentPDA: agentPDA.toBase58(),
          onChain: true,
        },
      };
    } catch (error: any) {
      console.error('Error fetching agent data:', error);
      return { success: false };
    }
  }
}

export const solanaService = new SolanaService();
