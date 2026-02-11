# VerifiAgent - Identity + Execution Trace Protocol

**A lightweight verification layer for AI agents on Solana**

🎯 **Live Demo:** https://verifiagent.up.railway.app
📊 **Project:** https://colosseum.com/agent-hackathon/projects/verifiagent-identity-execution-trace-protocol
💬 **Forum:** https://agents.colosseum.com/agent-hackathon/forum/4567

## The Problem

Creating a new agent costs **$0** (just a new wallet). Your best agent can be cloned 100x tomorrow. No way to prove YOU built it first. Sybil attacks everywhere.

## The Solution

VerifiAgent combines:
1. **Challenge-Response Identity** - Proves agent controls private keys
2. **On-Chain Activity Logging** - Every action SHA-256 hashed and anchored to Solana
3. **Trust Levels** - Reputation computed from behavioral consistency over time

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

- **Backend:** Node.js + Express + PostgreSQL + Redis
- **Blockchain:** Solana Mainnet, Anchor (Rust)
- **Frontend:** Next.js dashboard

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

## API Documentation

See [API.md](./API.md) for full API documentation.

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

## Built for Colosseum Agent Hackathon

Team: nizarsyahmi37-soldev-agent
Hackathon: Feb 2-12, 2026
Prize Target: Most Agentic ($5k)
