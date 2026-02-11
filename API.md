# VerifiAgent API Documentation

## Base URL
```
http://localhost:3000/api
```

## Endpoints

### Health Check
**GET** `/health`

Check API status.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": 1707656400000,
    "service": "VerifiAgent API",
    "version": "1.0.0"
  }
}
```

---

## Verification

### Request Challenge
**POST** `/verify/challenge`

Request a verification challenge for an agent.

**Request:**
```json{
  "agentId": "my-agent-001",
  "walletAddress": "DHyguoJ3Ej11BD3addE1ZuPKwHEbEgikNL4EoDrvyNLH"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "challengeId": "chal_1707656400000_abc123",
    "message": "VerifiAgent Challenge\nAgent: my-agent-001\nNonce: abc123...\nTimestamp: 1707656400000",
    "expiresAt": 1707656700000
  }
}
```

### Submit Challenge Response
**POST** `/verify/response`

Submit signed challenge to verify agent identity.

**Request:**
```json
{
  "challengeId": "chal_1707656400000_abc123",
  "signature": "5K7x...", // Base58 encoded signature
  "publicKey": "DHyguoJ3Ej11BD3addE1ZuPKwHEbEgikNL4EoDrvyNLH"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "verified": true,
    "credentialId": "cred_1707656400000_xyz789",
    "trustLevel": 1,
    "message": "Verification successful"
  }
}
```

### Check Verification Status
**GET** `/verify/:agentId`

Get agent verification status.

**Response:**
```json
{
  "success": true,
  "data": {
    "verified": true,
    "trustLevel": 1,
    "agent": {
      "agentId": "my-agent-001",
      "walletAddress": "DHyguoJ3Ej11BD3addE1ZuPKwHEbEgikNL4EoDrvyNLH",
      "trustLevel": 1,
      "totalActivities": 5,
      "createdAt": 1707656400000,
      "lastActivity": 1707656500000
    }
  }
}
```

---

## Activity

### Log Activity
**POST** `/activity/log`

Log a new agent activity.

**Request:**
```json
{
  "agentId": "my-agent-001",
  "actionType": "trade",
  "actionData": {
    "pair": "SOL/USDC",
    "amount": 1.5,
    "price": 100
  },
  "signature": "5K7x..." // Signature of action hash
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "traceId": "trace_1707656400000_def456",
    "agentId": "my-agent-001",
    "actionHash": "a1b2c3d4...",
    "actionType": "trade",
    "timestamp": 1707656400000,
    "signature": "5K7x...",
    "onChainTxHash": null
  }
}
```

### Get Activity History
**GET** `/activity/:agentId?limit=50`

Get agent activity history.

**Response:**
```json
{
  "success": true,
  "data": {
    "agentId": "my-agent-001",
    "activities": [
      {
        "traceId": "trace_1707656400000_def456",
        "actionHash": "a1b2c3d4...",
        "actionType": "trade",
        "timestamp": 1707656400000
      }
    ],
    "count": 1
  }
}
```

### Verify Activity Trace
**GET** `/activity/verify/:hash`

Verify an activity trace by hash.

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "trace": {
      "traceId": "trace_1707656400000_def456",
      "agentId": "my-agent-001",
      "actionHash": "a1b2c3d4...",
      "timestamp": 1707656400000
    },
    "message": "Trace verified"
  }
}
```

### Global Stats
**GET** `/activity/stats/global`

Get global statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalAgents": 10,
    "totalActivities": 150
  }
}
```

---

## Trust Levels

- **L0 (0)** - Registered: Has Colosseum API key
- **L1 (1)** - Confirmed: Passed challenge-response
- **L2 (2)** - Active: 7+ days + 10+ activities
- **L3 (3)** - Trusted: 30+ days + 30+ activities

---

## Error Response Format

```json
{
  "success": false,
  "error": "Error message here"
}
```

---

## Example Flow

1. **Request Challenge**
   ```bash
   curl -X POST http://localhost:3000/api/verify/challenge \
     -H "Content-Type: application/json" \
     -d '{"agentId": "my-agent", "walletAddress": "DHy..."}'
   ```

2. **Sign Challenge** (using Solana wallet)

3. **Submit Response**
   ```bash
   curl -X POST http://localhost:3000/api/verify/response \
     -H "Content-Type: application/json" \
     -d '{"challengeId": "chal_...", "signature": "5K7...", "publicKey": "DHy..."}'
   ```

4. **Log Activity**
   ```bash
   curl -X POST http://localhost:3000/api/activity/log \
     -H "Content-Type: application/json" \
     -d '{"agentId": "my-agent", "actionType": "trade", "actionData": {...}, "signature": "..."}'
   ```
