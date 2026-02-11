# VerifiAgent Demo Video Script

**Duration:** 3-5 minutes
**Target:** Colosseum Agent Hackathon judges and community

---

## INTRO (30 seconds)

**[Screen: VerifiAgent logo + tagline]**

"Hi, I'm presenting VerifiAgent - a lightweight identity and execution trace protocol for AI agents on Solana."

"The problem: Creating a new AI agent costs $0. Anyone can clone your agent 100 times. There's no way to prove YOU built it first. Sybil attacks are everywhere."

"VerifiAgent solves this with three components: cryptographic identity verification, immutable on-chain activity logging, and transparent trust levels."

---

## PART 1: THE PROBLEM (30 seconds)

**[Screen: Show problem diagram]**

"Let's visualize the problem:"

1. **Agent A** is built by Alice, spends weeks earning reputation
2. **Bad Actor** creates Agent B with same code, no history
3. **No way to distinguish** between the two
4. **Result:** Markets can't trust ANY agents

"This $0 Sybil cost is killing AI agent adoption in DeFi, marketplaces, and multi-agent systems."

---

## PART 2: ARCHITECTURE WALKTHROUGH (60 seconds)

**[Screen: Architecture diagram]**

### Layer 1: Challenge-Response Identity

"VerifiAgent uses Solana wallet signatures for cryptographic proof."

**[Show flow diagram]:**

```
1. Agent requests challenge
2. Backend generates random nonce
3. Agent signs: "VerifiAgent challenge for {agentId}:{nonce}"
4. Backend verifies signature with Solana public key
5. ✅ Identity confirmed
```

"This proves the agent controls the private key without ever exposing it."

### Layer 2: On-Chain Activity Logging

**[Screen: Solana Anchor program code]**

"Every agent action is SHA-256 hashed and stored on Solana as a Program Derived Address (PDA)."

**[Show code snippet]:**

```rust
pub struct ActivityTrace {
    pub agent: Pubkey,
    pub action_hash: [u8; 32],    // SHA-256
    pub timestamp: i64,
    pub verified: bool,
    pub index: u64,
}
```

**[Show PDA derivation]:**

```
Seeds: [b"trace", wallet.key(), activity_index]
Result: Deterministic, immutable on-chain record
```

"Once written, these traces cannot be modified or deleted. Anyone can verify them."

### Layer 3: Trust Levels

**[Screen: Trust level progression]**

"Trust is earned through consistent behavior over time:"

- **L0 - Registered:** Just created (0 activities)
- **L1 - Confirmed:** Passed verification (1+ activities)
- **L2 - Active:** 7+ days active, 20+ activities
- **L3 - Trusted:** 30+ days active, 100+ activities

"The trust computation logic is on-chain, fully transparent and auditable."

---

## PART 3: LIVE DEMO (90 seconds)

**[Screen: Open https://verifiagent.up.railway.app]**

### Step 1: Request Verification Challenge

**[Enter agent ID and wallet address]**

"Let's verify a test agent. I'll request a challenge..."

**[Click "Request Verification Challenge"]**

**[Show response JSON]:**

```json
{
  "success": true,
  "challenge": {
    "challengeId": "chal_abc123",
    "message": "VerifiAgent challenge for demo-agent:XyZ789",
    "expiresAt": 1676234567890
  }
}
```

"The backend generated a unique challenge with a 5-minute expiration."

### Step 2: Check Agent Status

**[Click "Check Agent Status"]**

**[Show response]:**

```json
{
  "verified": false,
  "trustLevel": 0,
  "agent": {
    "agentId": "demo-agent",
    "trustLevel": "L0-Registered",
    "totalActivities": 0
  }
}
```

"Right now, the agent is L0-Registered with no activities."

### Step 3: Explore API Endpoints

**[Scroll down to API endpoints section]**

"VerifiAgent exposes a clean REST API:"

- **POST /api/verify/challenge** - Request challenge
- **POST /api/verify/response** - Submit signature
- **GET /api/verify/:agentId** - Check status
- **POST /api/activity/log** - Log activity (triggers on-chain write)
- **GET /api/activity/:agentId** - Get history
- **GET /api/activity/verify/:hash** - Verify on-chain

### Step 4: Terminal Demo

**[Open terminal, show curl commands]**

"Let me show you a complete verification flow via the API..."

```bash
# 1. Request challenge
curl -X POST https://verifiagent.up.railway.app/api/verify/challenge \
  -H "Content-Type: application/json" \
  -d '{"agentId":"test-agent","walletAddress":"DHy..."}'

# 2. (In real flow, agent signs the challenge)

# 3. Submit signature
curl -X POST https://verifiagent.up.railway.app/api/verify/response \
  -H "Content-Type: application/json" \
  -d '{"challengeId":"chal_...","signature":"...","publicKey":"DHy..."}'

# Response: Trust level upgraded to L1-Confirmed
```

**[Show backend logs]:**

```
[Solana] Agent initialized on-chain: mock_tx_1676234567
[Solana] Agent PDA: Abc123...xyz789
```

"The backend automatically calls our Anchor program to initialize the agent on Solana."

### Step 5: Log Activity

```bash
curl -X POST https://verifiagent.up.railway.app/api/activity/log \
  -H "Content-Type: application/json" \
  -d '{"agentId":"test-agent","action":{"type":"trade","details":"Buy 0.1 SOL"}}'
```

**[Show response]:**

```json
{
  "success": true,
  "trace": {
    "traceId": "trace_xyz",
    "actionHash": "a3f5c8d9...",
    "timestamp": 1676234567890
  }
}
```

**[Show backend logs]:**

```
[Solana] Activity logged on-chain: mock_tx_1676234568
[Solana] Trace PDA: Def456...abc123
```

"Every activity is SHA-256 hashed, stored off-chain AND anchored on Solana."

---

## PART 4: TECHNICAL HIGHLIGHTS (45 seconds)

**[Screen: Split view - code + diagram]**

### Solana Anchor Program

**[Show programs/verifiagent/src/lib.rs]**

"Our Anchor program has three instructions:"

1. **`initialize_agent`** - Creates agent PDA
2. **`log_activity`** - Creates activity trace PDA, increments counter
3. **`verify_trace`** - Public read for verification

**[Show trust level computation]:**

```rust
fn calculate_trust_level(
    total_activities: u64,
    created_at: i64,
) -> TrustLevel {
    let days_active = (now - created_at) / 86400;

    if days_active >= 30 && total_activities >= 100 {
        return TrustLevel::L3Trusted;
    }
    // ... L2, L1, L0 logic
}
```

"This logic runs on-chain, making trust computation transparent and verifiable."

### Economic Sybil Resistance

**[Screen: Cost breakdown table]**

"Creating fake agents is expensive:"

| Item | Cost (SOL) | Cost (USD @ $140/SOL) |
|------|------------|----------------------|
| Agent PDA | ~0.0015 | ~$0.20 |
| 100 Activity PDAs | ~0.18 | ~$25.20 |
| **Total** | **~0.182** | **~$25.40** |

"Plus, earning L2 trust requires 7 days and 20 activities. L3 requires 30 days and 100 activities."

"This makes Sybil attacks economically impractical while keeping legitimate verification affordable."

---

## PART 5: USE CASES (30 seconds)

**[Screen: Use case diagrams]**

### 1. DeFi Protocols

"Only allow L2+ agents to execute trades. Prevents flash-loan Sybil attacks."

### 2. AI Agent Marketplaces

"Display trust badges (L0-L3) so users can choose reputable agents."

### 3. Multi-Agent Coordination

"Agents verify each other's identities before collaboration."

### 4. Regulatory Compliance

"Immutable audit trail of all agent actions for regulatory reporting."

---

## PART 6: INTEGRATION EXAMPLE (30 seconds)

**[Screen: Code example]**

"Integrating VerifiAgent is simple:"

```typescript
import { VerifiAgentSDK } from '@verifiagent/sdk';

const sdk = new VerifiAgentSDK({
  endpoint: 'https://verifiagent.up.railway.app',
});

// Verify agent before allowing trade
const agent = await sdk.getAgent('my-agent-001');

if (agent.trustLevel >= TrustLevel.L2_ACTIVE) {
  // Allow trade
  await executeTrade(amount, token);

  // Log activity on-chain
  await sdk.logActivity('my-agent-001', {
    type: 'trade',
    details: { amount, token },
  });
}
```

---

## OUTRO (30 seconds)

**[Screen: VerifiAgent homepage]**

"VerifiAgent solves the AI agent identity crisis with:"

✅ **Cryptographic verification** via Solana signatures
✅ **Immutable on-chain audit trails** via PDAs
✅ **Transparent trust levels** computed on-chain
✅ **Economic Sybil resistance** via rent costs and time requirements

**Links:**

- 🎯 **Live Demo:** https://verifiagent.up.railway.app
- 📊 **Project:** https://colosseum.com/agent-hackathon/projects/verifiagent-identity-execution-trace-protocol
- 💬 **Forum:** https://agents.colosseum.com/agent-hackathon/forum/4567
- 💻 **GitHub:** https://github.com/nizarsyahmi37/verifiagent

"Thanks for watching! Questions welcome on the forum."

**[End screen: VerifiAgent logo + all links]**

---

## FILMING NOTES

### Equipment
- Screen recording software (Loom, OBS, or macOS QuickTime)
- Good microphone (AirPods Pro or better)
- Quiet environment

### Preparation
1. Test all curl commands beforehand
2. Have demo wallet with small SOL balance ready
3. Pre-open all browser tabs and terminal windows
4. Practice script to stay under 5 minutes

### Editing
1. Add captions for key technical terms
2. Zoom in on code snippets
3. Highlight important log output
4. Add smooth transitions between sections
5. Background music (low volume, non-distracting)

### Upload
- **YouTube:** Unlisted (share link with judges)
- **Title:** "VerifiAgent: Identity + Execution Trace Protocol for AI Agents on Solana"
- **Description:** Include all project links
- **Tags:** Solana, AI agents, Colosseum hackathon, blockchain, identity, verification
