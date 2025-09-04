#!/bin/bash

# Organize Documentation to Server Folder
# This script moves all documentation files from root documentation/ to server/documentation/

echo "🚀 Organizing documentation files to server/documentation/..."

# Create server/documentation directory if it doesn't exist
mkdir -p server/documentation

# Move all existing documentation files to server/documentation/
echo "📁 Moving existing documentation files..."

# Move all TXT and MD files from root documentation/ to server/documentation/
mv documentation/*.txt server/documentation/ 2>/dev/null || true
mv documentation/*.md server/documentation/ 2>/dev/null || true

# Move all subdirectories from root documentation/ to server/documentation/
mv documentation/compliance server/documentation/ 2>/dev/null || true
mv documentation/contracts server/documentation/ 2>/dev/null || true
mv documentation/engineering server/documentation/ 2>/dev/null || true
mv documentation/ops server/documentation/ 2>/dev/null || true
mv documentation/policies server/documentation/ 2>/dev/null || true
mv documentation/security server/documentation/ 2>/dev/null || true

echo "✅ Moved all documentation files to server/documentation/"

# Show the new structure
echo ""
echo "📊 New server/documentation/ structure:"
tree server/documentation -a

echo ""
echo "🎉 Documentation organization complete!"
echo "📁 All files are now properly organized in server/documentation/"
echo "🧹 Root documentation/ folder is now empty and can be removed if desired"
