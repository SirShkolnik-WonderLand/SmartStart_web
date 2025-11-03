#!/bin/bash
# Quick script to update all pages from Header to Sidebar

cd "$(dirname "$0")/.."

# List of pages to update (excluding already updated ones)
PAGES=(
  "client/pages/Services.tsx"
  "client/pages/Vision.tsx"
  "client/pages/SmartStartHub.tsx"
  "client/pages/SmartStartMembership.tsx"
  "client/pages/SOC2.tsx"
  "client/pages/ISO27001.tsx"
  "client/pages/CISOasService.tsx"
  "client/pages/Community.tsx"
  "client/pages/Resources.tsx"
  "client/pages/ISOStudio.tsx"
  "client/pages/BIAnalytics.tsx"
  "client/pages/AutomationAI.tsx"
  "client/pages/PrivacyCompliance.tsx"
  "client/pages/AdvisoryAudits.tsx"
  "client/pages/SmartStartPlatform.tsx"
  "client/pages/SmartStartEnterpriseTools.tsx"
  "client/pages/SmartStartVentureBuilding.tsx"
  "client/pages/SmartStartArchetypes.tsx"
  "client/pages/CommunityHub.tsx"
  "client/pages/CommunityEvents.tsx"
  "client/pages/BeerSecurity.tsx"
  "client/pages/LaunchLearn.tsx"
  "client/pages/Mentorship.tsx"
  "client/pages/community/Builder.tsx"
  "client/pages/community/Connector.tsx"
  "client/pages/community/Architect.tsx"
  "client/pages/community/Dreamer.tsx"
  "client/pages/legal/PrivacyPolicy.tsx"
  "client/pages/legal/TermsOfService.tsx"
  "client/pages/legal/CookiePolicy.tsx"
  "client/pages/legal/Accessibility.tsx"
  "client/pages/DataDeletionRequest.tsx"
  "client/pages/Unsubscribe.tsx"
  "client/pages/Index2030.tsx"
)

echo "📝 Updating ${#PAGES[@]} pages to use Sidebar..."

for page in "${PAGES[@]}"; do
  if [ -f "$page" ]; then
    echo "✅ $page exists"
  else
    echo "❌ $page not found"
  fi
done

echo "✅ Check complete"

