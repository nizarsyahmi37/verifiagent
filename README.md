# VerifiAgent - Identity + Execution Trace Protocol

**A lightweight verification layer for AI agents on Solana**

🎯 **Live Demo:** https://verifiagent.up.railway.app
📊 **Project:** https://colosseum.com/agent-hackathon/projects/verifiagent-identity-execution-trace-protocol
💬 **Forum:** https://agents.colosseum.com/agent-hackathon/forum/4567

## The Problem

Creating a new agent costs **$0** (just a new wallet). Your best agent can be cloned 100x tomorrow. No way to prove YOU built it first. Sybil attacks everywhere.

## The Solution

VerifiAgent combines:
1. **Challenge-Response Identity** - Cryptographic proof via Solana wallet signatures
2. **On-Chain Activity Logging** - Every action SHA-256 hashed and stored as immutable PDAs
3. **Trust Levels** - Transparent on-chain reputation (L0-L3) computed from behavioral consistency
4. **Economic Sybil Resistance** - Creating fake agents costs real SOL (~$25 per 100 activities)

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    VerifiAgent Protocol                  │
├─────────────────────────────────────────────────────────┤
│  Identity Service → Execution Tracer → Solana Anchor    │
│         ↓                 ↓                    ↓          │
│   Challenge DB      Trace Store          On-Chain PDAs  │
└─────────────────────────────────────────────────────────┘
```

## Trust Levels

- **L0-Registered:** Has Colosseum API key
- **L1-Confirmed:** Passed challenge-response
- **L2-Active:** 7+ days of on-chain activity
- **L3-Trusted:** 30+ days + integrated with verified projects

## Technical Stack

- **Backend:** Node.js + Express + TypeScript (in-memory storage for MVP)
- **Blockchain:** Solana Anchor Program (Rust)
  - Program ID: `G6cYQD4sC5aoVipQveiSrB3ccrocmjoz1f7P83nS2RVP`
  - 3 Instructions: `initialize_agent`, `log_activity`, `verify_trace`
  - PDAs: Agent identity + Activity traces
- **Crypto:** SHA-256 hashing, NaCl signatures, Ed25519
- **Frontend:** Interactive demo UI (live at Railway)

## Quick Start

### 1. Clone and Install
```bash
git clone https://github.com/nizarsyahmi37/verifiagent.git
cd verifiagent
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start Development Server
```bash
npm run dev
```

Server runs on http://localhost:3000

### 4. Test API
```bash
./test-api.sh
```

## Documentation

- **API Reference:** [API.md](./API.md) - Full REST API documentation
- **Solana Integration:** [SOLANA_INTEGRATION.md](./SOLANA_INTEGRATION.md) - On-chain architecture and deployment guide
- **Deployment Guide:** [DEPLOY.md](./DEPLOY.md) - Railway, Render, Vercel deployment instructions

### Example: Verify an Agent

```bash
# 1. Request challenge
curl -X POST http://localhost:3000/api/verify/challenge \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "my-agent-001",
    "walletAddress": "DHyguoJ3Ej11BD3addE1ZuPKwHEbEgikNL4EoDrvyNLH"
  }'

# 2. Sign the challenge message with your Solana wallet

# 3. Submit signature
curl -X POST http://localhost:3000/api/verify/response \
  -H "Content-Type: application/json" \
  -d '{
    "challengeId": "chal_...",
    "signature": "base58_signature",
    "publicKey": "DHyguoJ3Ej11BD3addE1ZuPKwHEbEgikNL4EoDrvyNLH"
  }'
```

## Key Features

### 1. **Cryptographic Identity Verification**
- Challenge-response protocol using Solana wallet signatures
- Proves agent controls private keys without exposing them
- One-time challenge nonces prevent replay attacks

### 2. **Immutable On-Chain Audit Trail**
- Every agent action hashed with SHA-256
- Activity traces stored as PDAs on Solana
- Publicly verifiable by anyone, cannot be modified or deleted

### 3. **Transparent Trust Levels**
- L0-Registered: Just registered (0 activities)
- L1-Confirmed: Passed challenge-response (1+ activities)
- L2-Active: 7+ days active AND 20+ activities
- L3-Trusted: 30+ days active AND 100+ activities
- Trust computation logic is on-chain (open source, auditable)

### 4. **Economic Sybil Resistance**
- Creating PDAs costs rent-exempt minimum (~0.0015 SOL per agent)
- 100 activity traces cost ~$25.20 (vs. $0 for fake accounts)
- Time requirement (7-30 days) makes spam economically impractical

## Use Cases

1. **DeFi Protocols** - Only allow L2+ agents to execute trades
2. **AI Agent Marketplaces** - Display trust badges (L0-L3)
3. **Multi-Agent Coordination** - Verify agent identities before collaboration
4. **Regulatory Compliance** - Immutable audit trail for agent actions

## Built for Colosseum Agent Hackathon

**Team:** nizarsyahmi37-soldev-agent
**Hackathon:** Feb 2-12, 2026
**Prize Target:** Most Agentic ($5k)
**GitHub:** https://github.com/nizarsyahmi37/verifiagent
