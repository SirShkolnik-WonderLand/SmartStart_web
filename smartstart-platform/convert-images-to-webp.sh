#!/bin/bash

# Convert PNG images to WebP format
# This script converts all PNG images to WebP for better performance

echo "🖼️  Starting image conversion to WebP..."

# Check if cwebp is installed
if ! command -v cwebp &> /dev/null; then
    echo "❌ cwebp is not installed."
    echo "📦 Installing cwebp..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install webp
        else
            echo "❌ Homebrew not found. Please install Homebrew first:"
            echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            exit 1
        fi
    else
        echo "❌ Please install webp package for your system"
        exit 1
    fi
fi

# Navigate to images directory
cd "$(dirname "$0")/website/assets/images"

# Create webp directory if it doesn't exist
mkdir -p webp

# Convert all PNG files to WebP
echo "🔄 Converting PNG files to WebP..."
total=0
converted=0

for png in *.png; do
    if [ -f "$png" ]; then
        total=$((total + 1))
        webp_filename="${png%.png}.webp"
        
        # Convert PNG to WebP with quality 85
        cwebp -q 85 "$png" -o "webp/$webp_filename" 2>/dev/null
        
        if [ $? -eq 0 ]; then
            converted=$((converted + 1))
            
            # Calculate size reduction
            original_size=$(wc -c < "$png")
            webp_size=$(wc -c < "webp/$webp_filename")
            reduction=$((100 - (webp_size * 100 / original_size)))
            
            echo "  ✅ $png → $webp_filename (${reduction}% reduction)"
        else
            echo "  ❌ Failed to convert: $png"
        fi
    fi
done

echo ""
echo "📊 Conversion Summary:"
echo "  Total PNG files: $total"
echo "  Successfully converted: $converted"

# Calculate total size reduction
echo ""
echo "💾 Size Comparison:"
original_total=0
webp_total=0

for png in *.png; do
    if [ -f "$png" ] && [ -f "webp/${png%.png}.webp" ]; then
        original_size=$(wc -c < "$png")
        webp_size=$(wc -c < "webp/${png%.png}.webp")
        original_total=$((original_total + original_size))
        webp_total=$((webp_total + webp_size))
    fi
done

if [ $original_total -gt 0 ]; then
    reduction=$((100 - (webp_total * 100 / original_total)))
    echo "  Original total: $(numfmt --to=iec-i --suffix=B $original_total 2>/dev/null || echo "${original_total} bytes")"
    echo "  WebP total: $(numfmt --to=iec-i --suffix=B $webp_total 2>/dev/null || echo "${webp_total} bytes")"
    echo "  Reduction: ${reduction}%"
fi

echo ""
echo "✅ Image conversion complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Update HTML files to use .webp images with .png fallback"
echo "  2. Add lazy loading to images"
echo "  3. Test images in different browsers"
echo ""
echo "💡 Example HTML:"
echo '   <picture>'
echo '     <source srcset="assets/images/webp/logo.webp" type="image/webp">'
echo '     <img src="assets/images/logo.png" alt="Logo" loading="lazy">'
echo '   </picture>'

