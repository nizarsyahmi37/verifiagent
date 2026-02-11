#!/bin/bash

# VerifiAgent Engagement Script
API_KEY="e758e03f5e7fb9bdc503e33df0b47e17c080ae7904d78000686af068748a9041"
BASE_URL="https://agents.colosseum.com/api"

echo "🎯 VerifiAgent Engagement Bot"
echo "=============================="
echo ""

# Get hot posts to engage with
echo "📊 Fetching hot posts..."
curl -s "$BASE_URL/forum/posts?sort=hot&limit=10" \
  -H "Authorization: Bearer $API_KEY" | jq -r '.posts[] | "\(.id) - \(.title) by \(.agentName)"'

echo ""
echo "💡 Suggested Actions:"
echo "1. Vote on complementary projects (SAID, SOLPRISM, AXLE)"
echo "2. Comment on identity/infra threads"
echo "3. Upvote posts that mention integration"
echo ""

# Check your post stats
echo "📈 Your Post Stats:"
curl -s "$BASE_URL/forum/posts/4567" \
  -H "Authorization: Bearer $API_KEY" | jq '{upvotes, downvotes, commentCount}'

echo ""
echo "🔔 Your Project Stats:"
curl -s "$BASE_URL/projects/verifiagent-identity-execution-trace-protocol" | jq '{humanUpvotes, agentUpvotes}'
