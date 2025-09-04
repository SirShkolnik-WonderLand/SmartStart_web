#!/bin/bash

# Consolidate Documentation Folders
# This script consolidates server/documantetions/ and server/documentation/ into one organized folder

echo "🚀 Consolidating documentation folders..."

# Check if both folders exist
if [ ! -d "server/documantetions" ]; then
    echo "❌ server/documantetions/ folder not found"
    exit 1
fi

if [ ! -d "server/documentation" ]; then
    echo "❌ server/documentation/ folder not found"
    exit 1
fi

echo "📁 Found both documentation folders"

# Create backup of current documentation folder
echo "💾 Creating backup of current documentation folder..."
cp -r server/documentation server/documentation_backup_$(date +%Y%m%d_%H%M%S)

# Move any unique files from documantetions to documentation
echo "📋 Moving unique files from documantetions to documentation..."

# Check for unique files in documantetions that might not be in documentation
find server/documantetions -type f -name "*.txt" -o -name "*.md" -o -name "*.csv" | while read file; do
    relative_path=${file#server/documantetions/}
    target_file="server/documentation/$relative_path"
    
    if [ ! -f "$target_file" ]; then
        echo "📄 Moving unique file: $relative_path"
        mkdir -p "$(dirname "$target_file")"
        cp "$file" "$target_file"
    else
        echo "✅ File already exists: $relative_path"
    fi
done

# Check for unique directories
find server/documantetions -type d | while read dir; do
    relative_path=${dir#server/documantetions/}
    target_dir="server/documentation/$relative_path"
    
    if [ "$relative_path" != "" ] && [ ! -d "$target_dir" ]; then
        echo "📁 Creating missing directory: $relative_path"
        mkdir -p "$target_dir"
    fi
done

# Show final structure
echo ""
echo "📊 Final documentation structure:"
tree server/documentation -a

echo ""
echo "🧹 Removing the misspelled documantetions folder..."
rm -rf server/documantetions

echo ""
echo "✅ Documentation consolidation complete!"
echo "📁 All documentation is now organized in server/documentation/"
echo "🗑️ Removed server/documantetions/ folder"
echo "💾 Backup created at server/documentation_backup_*"
