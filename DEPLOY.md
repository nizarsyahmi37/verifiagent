# Deployment Guide

## Quick Deploy to Railway

### Option 1: Railway CLI (Fastest)

1. Install Railway CLI:
```bash
npm i -g @railway/cli
```

2. Login:
```bash
railway login
```

3. Initialize and deploy:
```bash
railway init
railway up
```

4. Add domain:
```bash
railway domain
```

### Option 2: GitHub Integration (Recommended)

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose `nizarsyahmi37/verifiagent`
5. Railway auto-detects Node.js and deploys
6. Add environment variables in Railway dashboard:
   - `NODE_ENV=production`
   - `PORT=3000` (Railway sets this automatically)
   - `SOLANA_RPC_URL=https://api.mainnet-beta.solana.com`

### Option 3: Deploy Button

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/nizarsyahmi37/verifiagent)

---

## Alternative: Render.com

1. Go to https://render.com
2. New Web Service
3. Connect GitHub repo
4. Settings:
   - Build: `npm install`
   - Start: `npm start`
   - Environment: `NODE_ENV=production`

---

## Alternative: Vercel

```bash
npm i -g vercel
vercel --prod
```

---

## Environment Variables

Required for production:
- `NODE_ENV=production`
- `PORT=3000` (or Railway-provided)
- `SOLANA_RPC_URL=https://api.mainnet-beta.solana.com`

Optional:
- `DATABASE_URL` (for PostgreSQL in future)
- `REDIS_URL` (for Redis in future)

---

## Post-Deployment

1. Test health endpoint:
```bash
curl https://your-app.railway.app/api/health
```

2. Update Colosseum project with demo URL

3. Test verification flow:
```bash
curl -X POST https://your-app.railway.app/api/verify/challenge \
  -H "Content-Type: application/json" \
  -d '{"agentId":"test","walletAddress":"DHy..."}'
```
