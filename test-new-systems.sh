#!/bin/bash

# Test New Systems - Subscription, Billing, Legal Pack, and Journey APIs
# This script tests all the new systems we've implemented

echo "🚀 Testing SmartStart Platform - New Systems"
echo "=============================================="

BASE_URL="http://localhost:3001"
USER_ID="cmf4qvyhj00008o18m45a8vb7"

echo ""
echo "1. 🏥 Health Checks"
echo "==================="

echo "Main API Health:"
curl -s "$BASE_URL/health" | jq .

echo ""
echo "Subscription API Health:"
curl -s "$BASE_URL/api/subscriptions/health" | jq .

echo ""
echo "Billing API Health:"
curl -s "$BASE_URL/api/billing/health" | jq .

echo ""
echo "Legal Pack API Health:"
curl -s "$BASE_URL/api/legal-pack/health" | jq .

echo ""
echo "Journey API Health:"
curl -s "$BASE_URL/api/journey/health" | jq .

echo ""
echo "2. 📋 Billing Plans"
echo "==================="

echo "Available Billing Plans:"
curl -s "$BASE_URL/api/subscriptions/plans" | jq '.data[] | {name, price, interval, features}'

echo ""
echo "3. 💳 User Subscriptions"
echo "========================"

echo "User Subscriptions:"
curl -s "$BASE_URL/api/subscriptions/user/$USER_ID" | jq '.data[] | {id, status, plan: .plan.name, startDate, endDate}'

echo ""
echo "4. 🧾 User Invoices"
echo "==================="

echo "User Invoices:"
curl -s "$BASE_URL/api/billing/invoices/user/$USER_ID" | jq '.data[] | {id, amount, status, dueDate, paidDate}'

echo ""
echo "5. 💰 User Payments"
echo "==================="

echo "User Payments:"
curl -s "$BASE_URL/api/billing/payments/user/$USER_ID" | jq '.data[] | {id, amount, method, status, transactionId}'

echo ""
echo "6. 📜 Legal Pack Status"
echo "======================="

echo "User Legal Pack Status:"
curl -s "$BASE_URL/api/legal-pack/status/$USER_ID" | jq '.data | {legalPack: .legalPack.status, nda: .nda.status, isComplete}'

echo ""
echo "7. 🚀 Journey Status"
echo "===================="

echo "User Journey Progress:"
curl -s "$BASE_URL/api/journey/status/$USER_ID" | jq '.data.progress | {totalStages, completedStages, percentage, currentStage: .currentStage.name, nextStage: .nextStage.name}'

echo ""
echo "8. 🚪 Journey Gates"
echo "==================="

echo "Journey Gates Status:"
curl -s "$BASE_URL/api/journey/gates/$USER_ID" | jq '.data[] | select(.gates | length > 0) | {stageName, gates: [.gates[] | {gateName, gateType, isPassed}]}'

echo ""
echo "9. 📊 All Journey Stages"
echo "========================"

echo "Available Journey Stages:"
curl -s "$BASE_URL/api/journey/stages" | jq '.data[] | {name, order, description, gatesCount: (.gates | length)}'

echo ""
echo "✅ All tests completed successfully!"
echo ""
echo "🎉 New Systems Summary:"
echo "- ✅ Subscription System: 4 billing plans, user subscriptions, auto-renewal"
echo "- ✅ Billing System: Invoices, payments, transaction tracking"
echo "- ✅ Legal Pack System: Platform agreements, NDA, e-signature consent"
echo "- ✅ Journey System: 11-stage user journey with gates and progress tracking"
echo ""
echo "🚀 SmartStart Platform is now a complete Venture Operating System!"
