#!/usr/bin/env bash
# Unified Dashboard end-to-end API smoke test
# Usage:
#   EMAIL or USERNAME and PASSWORD can be provided via env vars
#   BASE defaults to SmartStart production API
# Example:
#   USERNAME=admin PASSWORD='password123' bash scripts/test-unified-dashboard.sh

set -euo pipefail

BASE="${BASE:-https://smartstart-api.onrender.com}"
COOKIE_JAR="/tmp/smartstart_cookies.txt"
rm -f "$COOKIE_JAR"

jq_bin=$(command -v jq || true)
if [ -z "$jq_bin" ]; then
  echo "jq is required. Install with: brew install jq" >&2
  exit 1
fi

say() { echo -e "\n=== $*"; }

say "Health"
curl -sS "$BASE/health" | jq . | sed 's/^/  /'

say "Get CSRF (optional)"
CSRF=$(curl -sS -c "$COOKIE_JAR" -b "$COOKIE_JAR" "$BASE/api/auth/csrf" | jq -r '.csrf // empty' || true)
[ -n "${CSRF:-}" ] && echo "  CSRF=$CSRF" || echo "  CSRF not needed"

LOGIN_PAYLOAD="{}"
if [ -n "${EMAIL:-}" ]; then
  LOGIN_PAYLOAD=$(jq -n --arg email "$EMAIL" --arg pw "${PASSWORD:-}" '{email:$email,password:$pw}')
elif [ -n "${USERNAME:-}" ]; then
  LOGIN_PAYLOAD=$(jq -n --arg username "$USERNAME" --arg pw "${PASSWORD:-}" '{username:$username,password:$pw}')
else
  echo "Provide EMAIL or USERNAME and PASSWORD env vars" >&2
  exit 1
fi

say "Login"
curl -sS -c "$COOKIE_JAR" -b "$COOKIE_JAR" -H "Content-Type: application/json" -d "$LOGIN_PAYLOAD" \
  -X POST "$BASE/api/auth/login" | jq . | sed 's/^/  /'

say "Profile"
PROFILE_JSON=$(curl -sS -c "$COOKIE_JAR" -b "$COOKIE_JAR" "$BASE/api/auth/profile")
echo "$PROFILE_JSON" | jq . | sed 's/^/  /'
USER_ID=$(echo "$PROFILE_JSON" | jq -r '.id // .userId')
if [ -z "$USER_ID" ] || [ "$USER_ID" = "null" ]; then
  echo "Could not resolve user id from /api/auth/profile" >&2
  exit 1
fi

say "Role Dashboard"
curl -sS -c "$COOKIE_JAR" -b "$COOKIE_JAR" "$BASE/api/role-dashboard/dashboard" | jq . | sed 's/^/  /'

say "Tasks (all)"
curl -sS -c "$COOKIE_JAR" -b "$COOKIE_JAR" "$BASE/api/tasks/tasks" | jq . | sed 's/^/  /'

say "Tasks (today)"
curl -sS -c "$COOKIE_JAR" -b "$COOKIE_JAR" "$BASE/api/tasks/today" | jq . | sed 's/^/  /'

say "Gamification"
curl -sS -c "$COOKIE_JAR" -b "$COOKIE_JAR" "$BASE/api/user-gamification/dashboard/$USER_ID" | jq . | sed 's/^/  /'

say "Portfolio Analytics"
curl -sS -c "$COOKIE_JAR" -b "$COOKIE_JAR" "$BASE/api/user-portfolio/analytics" | jq . | sed 's/^/  /'

say "Profile Detail"
curl -sS -c "$COOKIE_JAR" -b "$COOKIE_JAR" "$BASE/api/user-profile/profile/$USER_ID" | jq . | sed 's/^/  /'

say "DONE ✅"
