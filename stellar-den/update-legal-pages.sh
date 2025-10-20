#!/bin/bash

# Update Cookie Policy
sed -i '' 's/from-slate-900 via-slate-800 to-slate-900/bg-background/g' client/pages/legal/CookiePolicy.tsx
sed -i '' 's/bg-slate-800\/50 backdrop-blur-xl rounded-2xl border border-slate-700\/50/bg-card\/50 backdrop-blur-xl rounded-2xl border border-border\/50/g' client/pages/legal/CookiePolicy.tsx
sed -i '' 's/text-slate-300/text-muted-foreground/g' client/pages/legal/CookiePolicy.tsx
sed -i '' 's/text-white/text-foreground/g' client/pages/legal/CookiePolicy.tsx
sed -i '' 's/text-teal-400/text-primary/g' client/pages/legal/CookiePolicy.tsx
sed -i '' 's/bg-teal-500\/10 border border-teal-500\/20/bg-primary\/10 border border-primary\/20/g' client/pages/legal/CookiePolicy.tsx
sed -i '' 's/bg-slate-900\/50 rounded-lg p-6 border border-slate-700/bg-muted\/50 rounded-lg p-6 border border-border/g' client/pages/legal/CookiePolicy.tsx
sed -i '' 's/bg-teal-500\/10 border border-teal-500\/20 rounded-lg p-6/bg-primary\/10 border border-primary\/20 rounded-lg p-6/g' client/pages/legal/CookiePolicy.tsx

# Update Accessibility
sed -i '' 's/from-slate-900 via-slate-800 to-slate-900/bg-background/g' client/pages/legal/Accessibility.tsx
sed -i '' 's/bg-slate-800\/50 backdrop-blur-xl rounded-2xl border border-slate-700\/50/bg-card\/50 backdrop-blur-xl rounded-2xl border border-border\/50/g' client/pages/legal/Accessibility.tsx
sed -i '' 's/text-slate-300/text-muted-foreground/g' client/pages/legal/Accessibility.tsx
sed -i '' 's/text-white/text-foreground/g' client/pages/legal/Accessibility.tsx
sed -i '' 's/text-teal-400/text-primary/g' client/pages/legal/Accessibility.tsx
sed -i '' 's/bg-teal-500\/10 border border-teal-500\/20/bg-primary\/10 border border-primary\/20/g' client/pages/legal/Accessibility.tsx
sed -i '' 's/bg-slate-900\/50 rounded-lg p-6 border border-slate-700/bg-muted\/50 rounded-lg p-6 border border-border/g' client/pages/legal/Accessibility.tsx
sed -i '' 's/bg-teal-500\/10 border border-teal-500\/20 rounded-lg p-6/bg-primary\/10 border border-primary\/20 rounded-lg p-6/g' client/pages/legal/Accessibility.tsx

echo "✅ Legal pages updated with design system!"
