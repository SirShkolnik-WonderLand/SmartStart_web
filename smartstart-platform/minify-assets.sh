#!/bin/bash

# Minify CSS and JS for Production
# This script creates minified versions of CSS and JS files

echo "🔧 Starting asset minification..."

# Navigate to website directory
cd "$(dirname "$0")/website"

# Create minified directory if it doesn't exist
mkdir -p assets/css/minified
mkdir -p assets/js/minified

# Minify CSS files
echo "📝 Minifying CSS files..."
for css in assets/css/*.css; do
    if [ -f "$css" ]; then
        filename=$(basename "$css" .css)
        # Remove comments, whitespace, and newlines
        cat "$css" | \
            tr -d '\n' | \
            sed 's/\/\*[^*]*\*\///g' | \
            sed 's/[[:space:]]*{[[:space:]]*/{/g' | \
            sed 's/[[:space:]]*}[[:space:]]*/}/g' | \
            sed 's/[[:space:]]*:[[:space:]]*/:/g' | \
            sed 's/[[:space:]]*;[[:space:]]*/;/g' | \
            sed 's/[[:space:]]*,[[:space:]]*/,/g' | \
            sed 's/[[:space:]]+/ /g' > "assets/css/minified/${filename}.min.css"
        echo "  ✅ Minified: $filename.css → ${filename}.min.css"
    fi
done

# Minify JS files
echo "📝 Minifying JavaScript files..."
for js in assets/js/*.js; do
    if [ -f "$js" ]; then
        filename=$(basename "$js" .js)
        # Remove comments and whitespace
        cat "$js" | \
            sed 's/\/\/.*$//g' | \
            sed 's/\/\*[^*]*\*\///g' | \
            tr -d '\n' | \
            sed 's/[[:space:]]+/ /g' | \
            sed 's/[[:space:]]*{[[:space:]]*/{/g' | \
            sed 's/[[:space:]]*}[[:space:]]*/}/g' > "assets/js/minified/${filename}.min.js"
        echo "  ✅ Minified: $filename.js → ${filename}.min.js"
    fi
done

echo ""
echo "📊 Minification Summary:"
echo "  CSS files: $(ls -1 assets/css/minified/*.min.css 2>/dev/null | wc -l | tr -d ' ')"
echo "  JS files:  $(ls -1 assets/js/minified/*.min.js 2>/dev/null | wc -l | tr -d ' ')"

# Calculate size reduction
echo ""
echo "💾 Size Comparison:"
echo "  CSS:"
for css in assets/css/*.css; do
    if [ -f "$css" ]; then
        filename=$(basename "$css" .css)
        if [ -f "assets/css/minified/${filename}.min.css" ]; then
            original=$(wc -c < "$css")
            minified=$(wc -c < "assets/css/minified/${filename}.min.css")
            reduction=$((100 - (minified * 100 / original)))
            echo "    $filename: $(numfmt --to=iec-i --suffix=B $original) → $(numfmt --to=iec-i --suffix=B $minified) (-${reduction}%)"
        fi
    fi
done

echo ""
echo "✅ Minification complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Update HTML files to use .min.css and .min.js files"
echo "  2. Or use a build process to automatically switch between dev and prod"
echo "  3. Test minified files thoroughly before deploying"

