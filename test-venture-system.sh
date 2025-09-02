#!/bin/bash

# 🚀 Test Venture Management System
# Simple test to verify the system is working

echo "🧪 Testing Venture Management System..."
echo "======================================"

API_BASE="https://smartstart-api.onrender.com"
TEST_USER_ID="cmf1r92vo0001s8299wr0vh66"

echo "1️⃣ Testing Health Check..."
HEALTH=$(curl -s "$API_BASE/api/ventures/health")
echo "Health: $HEALTH"
echo ""

echo "2️⃣ Testing Migration Endpoint..."
MIGRATION=$(curl -s -X POST "$API_BASE/api/ventures/migrate")
echo "Migration: $MIGRATION"
echo ""

echo "3️⃣ Testing Venture Creation..."
VENTURE_DATA='{
  "name": "Test Venture Alpha",
  "purpose": "Building the future of venture management",
  "region": "US",
  "ownerUserId": "'$TEST_USER_ID'",
  "legalEntity": {
    "name": "Test Venture Alpha LLC",
    "type": "LLC",
    "jurisdiction": "US"
  }
}'

VENTURE_CREATE=$(curl -s -X POST "$API_BASE/api/ventures/create" \
  -H "Content-Type: application/json" \
  -d "$VENTURE_DATA")

echo "Venture Creation: $VENTURE_CREATE"
echo ""

echo "4️⃣ Testing Venture List..."
VENTURE_LIST=$(curl -s "$API_BASE/api/ventures/list/all?limit=5")
echo "Venture List: $VENTURE_LIST"
echo ""

echo "🎯 Test Complete!"
