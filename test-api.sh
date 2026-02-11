#!/bin/bash

# VerifiAgent API Test Script
API_URL="http://localhost:3000"

echo "========================================="
echo "🧪 Testing VerifiAgent API"
echo "========================================="
echo ""

# Test 1: Health Check
echo "1️⃣  Testing Health Check..."
curl -s "$API_URL/api/health" | jq .
echo ""
echo ""

# Test 2: Request Challenge
echo "2️⃣  Requesting Verification Challenge..."
CHALLENGE_RESPONSE=$(curl -s -X POST "$API_URL/api/verify/challenge" \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "test-agent-001",
    "walletAddress": "DHyguoJ3Ej11BD3addE1ZuPKwHEbEgikNL4EoDrvyNLH"
  }')
echo "$CHALLENGE_RESPONSE" | jq .
CHALLENGE_ID=$(echo "$CHALLENGE_RESPONSE" | jq -r '.data.challengeId')
echo ""
echo "✅ Challenge ID: $CHALLENGE_ID"
echo ""
echo ""

# Test 3: Check Verification Status
echo "3️⃣  Checking Verification Status..."
curl -s "$API_URL/api/verify/test-agent-001" | jq .
echo ""
echo ""

# Test 4: Get Global Stats
echo "4️⃣  Getting Global Stats..."
curl -s "$API_URL/api/activity/stats/global" | jq .
echo ""
echo ""

echo "========================================="
echo "✅ API Tests Complete!"
echo "========================================="
echo ""
echo "📝 Next Steps:"
echo "   1. Sign the challenge message with your Solana wallet"
echo "   2. Submit signature via POST /api/verify/response"
echo "   3. Log activities via POST /api/activity/log"
echo ""
