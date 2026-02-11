# Solana On-Chain Integration

## Architecture

VerifiAgent uses an Anchor program deployed on Solana to store agent identities and activity traces immutably on-chain.

### Program Structure

**Program ID:** `G6cYQD4sC5aoVipQveiSrB3ccrocmjoz1f7P83nS2RVP`

**Location:** `programs/verifiagent/src/lib.rs`

### Instructions

#### 1. `initialize_agent`
Creates a new agent identity PDA on-chain.

```rust
pub struct Agent {
    pub wallet_address: Pubkey,      // 32 bytes
    pub trust_level: TrustLevel,     // 1 byte (enum 0-3)
    pub total_activities: u64,       // 8 bytes
    pub created_at: i64,             // 8 bytes
    pub last_activity: i64,          // 8 bytes
}
```

**PDA Seeds:** `[b"agent", wallet.key()]`

#### 2. `log_activity`
Creates an activity trace PDA and increments agent activity counter.

```rust
pub struct ActivityTrace {
    pub agent: Pubkey,               // 32 bytes
    pub action_hash: [u8; 32],       // 32 bytes (SHA-256)
    pub action_type: String,         // ~100 bytes
    pub timestamp: i64,              // 8 bytes
    pub verified: bool,              // 1 byte
    pub index: u64,                  // 8 bytes
}
```

**PDA Seeds:** `[b"trace", wallet.key(), activity_index.to_le_bytes()]`

#### 3. `verify_trace`
Read-only verification of an activity trace.

### Trust Level Computation

```rust
fn calculate_trust_level(
    total_activities: u64,
    created_at: i64,
    last_activity: i64,
) -> TrustLevel {
    let days_active = (now - created_at) / 86400;

    // L3: 30+ days AND 100+ activities
    if days_active >= 30 && total_activities >= 100 {
        return TrustLevel::L3Trusted;
    }

    // L2: 7+ days AND 20+ activities
    if days_active >= 7 && total_activities >= 20 {
        return TrustLevel::L2Active;
    }

    // L1: 1+ activities (confirmed)
    if total_activities >= 1 {
        return TrustLevel::L1Confirmed;
    }

    // L0: Just registered
    TrustLevel::L0Registered
}
```

## Backend Integration

### Flow: Agent Verification + On-Chain Logging

1. **Agent requests challenge** (off-chain)
   ```
   POST /api/verify/challenge
   ```

2. **Agent signs challenge** (off-chain)
   - Signs message with Solana wallet private key

3. **Agent submits signature** (off-chain + on-chain)
   ```
   POST /api/verify/response
   ```
   - Backend verifies signature
   - **Calls `initialize_agent` on Solana** if first-time
   - Updates trust level in database

4. **Agent logs activity** (off-chain + on-chain)
   ```
   POST /api/activity/log
   ```
   - Backend hashes action with SHA-256
   - **Calls `log_activity` on Solana** to create immutable trace
   - Returns trace PDA address

5. **Anyone verifies trace** (on-chain read)
   ```
   GET /api/activity/verify/:hash
   ```
   - Queries Solana for trace PDA
   - Returns on-chain verification status

## Deployment Steps

### 1. Build Program

```bash
anchor build
```

### 2. Deploy to Devnet

```bash
solana config set --url devnet
anchor deploy --provider.cluster devnet
```

### 3. Deploy to Mainnet

```bash
solana config set --url mainnet-beta
anchor deploy --provider.cluster mainnet
```

### 4. Update Backend Environment

```bash
# .env
SOLANA_PROGRAM_ID=G6cYQD4sC5aoVipQveiSrB3ccrocmjoz1f7P83nS2RVP
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

## Testing

### Run Anchor Tests

```bash
anchor test
```

Tests verify:
- Agent initialization
- Activity logging
- Trust level progression (L0 → L1 → L2)
- PDA derivation correctness
- Multiple activity traces

### Integration Test Flow

```bash
# 1. Initialize agent on-chain
curl -X POST http://localhost:3000/api/verify/challenge \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "test-agent",
    "walletAddress": "DHyguoJ3Ej11BD3addE1ZuPKwHEbEgikNL4EoDrvyNLH"
  }'

# 2. Submit signed response (triggers on-chain initialize_agent)
curl -X POST http://localhost:3000/api/verify/response \
  -H "Content-Type: application/json" \
  -d '{
    "challengeId": "chal_...",
    "signature": "...",
    "publicKey": "DHyguoJ3Ej11BD3addE1ZuPKwHEbEgikNL4EoDrvyNLH"
  }'

# 3. Log activity (triggers on-chain log_activity)
curl -X POST http://localhost:3000/api/activity/log \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "test-agent",
    "action": {
      "type": "trade",
      "details": "Buy 0.1 SOL"
    }
  }'

# 4. Verify trace on-chain
curl http://localhost:3000/api/activity/verify/<hash>
```

## Benefits

### 1. **Immutable Audit Trail**
- Every agent action is SHA-256 hashed and stored on Solana
- Cannot be modified or deleted once written
- Publicly verifiable by anyone

### 2. **Decentralized Identity**
- Agent identity is tied to Solana wallet (cryptographically secure)
- No central authority can revoke or manipulate identity
- Portable across any service that integrates VerifiAgent

### 3. **Transparent Trust Levels**
- Trust computation logic is on-chain (open source, auditable)
- Anyone can verify an agent's trust level independently
- No black-box reputation scores

### 4. **Sybil Resistance**
- Creating fake agents costs SOL (rent for PDAs)
- Building trust requires time (7-30 days) and activity (20-100 actions)
- Economic disincentive to spam

## Cost Analysis

### Rent-Exempt Minimum (Solana)

- **Agent PDA:** ~0.0015 SOL (~$0.20 at $140/SOL)
- **Activity Trace PDA:** ~0.0018 SOL (~$0.25 at $140/SOL)

**Total cost for 100 activities:** ~$25.20 (vs. $0 for fake accounts)

This makes Sybil attacks economically expensive while keeping legitimate agent verification affordable.

## Future Enhancements

1. **Cross-Program Invocations (CPI)**
   - Other Solana programs can verify agents directly on-chain
   - Example: DEX only allows L2+ agents to trade

2. **Staking for Trust Boost**
   - Agents can stake SOL to increase trust level faster
   - Slashing for malicious behavior

3. **Multi-Sig Agent Identities**
   - Support for agent teams with shared identity
   - Requires M-of-N signatures for critical actions

4. **Historical Query Indexing**
   - Use Solana indexers (Helius, Triton) for fast trace queries
   - GraphQL API for complex activity analytics
