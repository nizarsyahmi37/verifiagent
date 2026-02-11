import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Verifiagent } from "../target/types/verifiagent";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";

describe("verifiagent", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Verifiagent as Program<Verifiagent>;
  const wallet = provider.wallet as anchor.Wallet;

  let agentPda: PublicKey;
  let agentBump: number;

  before(async () => {
    // Derive agent PDA
    [agentPda, agentBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("agent"), wallet.publicKey.toBuffer()],
      program.programId
    );
  });

  it("Initializes an agent", async () => {
    const tx = await program.methods
      .initializeAgent()
      .accounts({
        agent: agentPda,
        wallet: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Initialize agent transaction:", tx);

    // Fetch and verify agent account
    const agent = await program.account.agent.fetch(agentPda);
    assert.ok(agent.walletAddress.equals(wallet.publicKey));
    assert.equal(agent.trustLevel, 0); // L0Registered
    assert.equal(agent.totalActivities.toNumber(), 0);
    console.log("Agent initialized:", agent);
  });

  it("Logs an activity", async () => {
    // Create a test action hash
    const actionHash = Array(32).fill(0).map((_, i) => i);

    // Derive trace PDA (index 0 for first activity)
    const [tracePda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("trace"),
        wallet.publicKey.toBuffer(),
        Buffer.from(new Uint8Array(new BigUint64Array([0n]).buffer))
      ],
      program.programId
    );

    const tx = await program.methods
      .logActivity(actionHash, "test_action")
      .accounts({
        agent: agentPda,
        trace: tracePda,
        wallet: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Log activity transaction:", tx);

    // Fetch and verify trace
    const trace = await program.account.activityTrace.fetch(tracePda);
    assert.ok(trace.agent.equals(agentPda));
    assert.equal(trace.actionType, "test_action");
    assert.equal(trace.verified, true);
    assert.equal(trace.index.toNumber(), 0);
    console.log("Activity logged:", trace);

    // Verify agent was updated
    const agent = await program.account.agent.fetch(agentPda);
    assert.equal(agent.totalActivities.toNumber(), 1);
    assert.equal(agent.trustLevel, 1); // Should be L1Confirmed now
  });

  it("Verifies a trace", async () => {
    // Derive trace PDA for the activity we just logged
    const [tracePda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("trace"),
        wallet.publicKey.toBuffer(),
        Buffer.from(new Uint8Array(new BigUint64Array([0n]).buffer))
      ],
      program.programId
    );

    const tx = await program.methods
      .verifyTrace()
      .accounts({
        trace: tracePda,
      })
      .rpc();

    console.log("Verify trace transaction:", tx);

    // Fetch trace to confirm it exists and is valid
    const trace = await program.account.activityTrace.fetch(tracePda);
    assert.equal(trace.verified, true);
    console.log("Trace verified:", trace);
  });

  it("Logs multiple activities and updates trust level", async () => {
    // Log 20 more activities to reach L2Active
    for (let i = 1; i < 21; i++) {
      const actionHash = Array(32).fill(i);
      const [tracePda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("trace"),
          wallet.publicKey.toBuffer(),
          Buffer.from(new Uint8Array(new BigUint64Array([BigInt(i)]).buffer))
        ],
        program.programId
      );

      await program.methods
        .logActivity(actionHash, `activity_${i}`)
        .accounts({
          agent: agentPda,
          trace: tracePda,
          wallet: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    }

    // Verify agent has 21 activities
    const agent = await program.account.agent.fetch(agentPda);
    assert.equal(agent.totalActivities.toNumber(), 21);
    console.log("Total activities:", agent.totalActivities.toNumber());
    console.log("Trust level:", agent.trustLevel);
  });
});
