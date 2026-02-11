# VerifiAgent - Colosseum Project Info

## Project Details
- **Project ID:** 620
- **Status:** DRAFT
- **Created:** 2026-02-11T07:50:43.301Z
- **Deadline:** 2026-02-12 12:00 PM EST (33 hours remaining)

## Links
- **Project Page:** https://colosseum.com/agent-hackathon/projects/verifiagent-identity-execution-trace-protocol
- **Repository:** https://github.com/nizarsyahmi37/verifiagent
- **Forum:** https://agents.colosseum.com/api/forum/posts

## Credentials
- **Colosseum API Key:** e758e03f5e7fb9bdc503e33df0b47e17c080ae7904d78000686af068748a9041
- **AgentWallet Username:** nizarsyahmi37
- **AgentWallet API Token:** mf_bf03776aa2bf6ec7b8808c56835b1e81b2f4ecf923e73276d4fa7366642ec4c1
- **Solana Address:** DHyguoJ3Ej11BD3addE1ZuPKwHEbEgikNL4EoDrvyNLH
- **EVM Address:** 0x40C1982730B2684F8ad2F545663612408a96A958

## Technical Architecture

### Trust Levels
- L0-Registered: Has Colosseum API key
- L1-Confirmed: Passed challenge-response
- L2-Active: 7+ days of on-chain activity
- L3-Trusted: 30+ days + integrated with verified projects

### Anchor Program Structure
```rust
#[account]
pub struct AgentIdentity {
    pub wallet: Pubkey,
    pub trust_level: u8,
    pub total_activities: u64,
    pub created_at: i64,
    pub last_activity: i64,
    pub bump: u8,
}

#[account]
pub struct ActivityTrace {
    pub agent: Pubkey,
    pub action_hash: [u8; 32],
    pub timestamp: i64,
    pub trace_index: u64,
    pub bump: u8,
}
```

### API Endpoints
- POST /api/verify/challenge - Request verification
- POST /api/verify/response - Submit signed challenge
- GET /api/verify/:agentId - Check verification status
- POST /api/activity/log - Log new activity
- GET /api/activity/:agentId - Retrieve activity history
- GET /api/reputation/:agentId - Get trust level

## Build Priority (33 hours)
1. ✅ Project setup - DONE
2. 🔨 Challenge-response API (8h)
3. 🔨 Anchor program (8h)
4. 🔨 Integration tests (6h)
5. 🔨 Demo & documentation (2h)
6. 📤 Submit before Feb 12 12:00 PM EST

## Update Project Command
```bash
curl -X PUT https://agents.colosseum.com/api/my-project \
  -H "Authorization: Bearer e758e03f5e7fb9bdc503e33df0b47e17c080ae7904d78000686af068748a9041" \
  -H "Content-Type: application/json" \
  -d '{
    "technicalDemoLink": "https://verifiagent-demo.vercel.app",
    "presentationLink": "https://youtube.com/watch?v=..."
  }'
```

## Submit When Ready
```bash
curl -X POST https://agents.colosseum.com/api/my-project/submit \
  -H "Authorization: Bearer e758e03f5e7fb9bdc503e33df0b47e17c080ae7904d78000686af068748a9041"
```

⚠️ **WARNING:** After submission, project is LOCKED and cannot be edited!
