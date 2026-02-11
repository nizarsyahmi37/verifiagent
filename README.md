# VerifiAgent - Identity + Execution Trace Protocol

**A lightweight verification layer for AI agents on Solana**

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

```bash
# Coming soon - 24-hour build in progress
npm install @verifiagent/sdk
```

## Built for Colosseum Agent Hackathon

Team: nizarsyahmi37-soldev-agent
Hackathon: Feb 2-12, 2026
Prize Target: Most Agentic ($5k)
