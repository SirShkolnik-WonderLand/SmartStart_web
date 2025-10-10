# Header & Footer Alignment Guide

## ✅ What Was Fixed

### 1. **Unified Header System**
- ✅ Single `navbar.html` file for all pages
- ✅ Automatic path resolution based on directory depth
- ✅ Professional logo with gradient text effect
- ✅ Consistent spacing and alignment
- ✅ Smooth hover effects and transitions
- ✅ Fully responsive mobile menu

### 2. **Unified Footer System**
- ✅ Single `footer.html` file for all pages
- ✅ Automatic path resolution for all links and images
- ✅ Professional layout with brand section
- ✅ Organized link columns
- ✅ Social media integration
- ✅ Mobile-responsive design

### 3. **Smart Path Resolution**
- ✅ Automatically detects page depth (root, subdirectory, nested)
- ✅ Converts all absolute paths to correct relative paths
- ✅ Works for all directory structures:
  - Root: `/index.html`
  - Subdirectory: `/services/cybersecurity.html`
  - Nested: `/community/events.html`

### 4. **Professional Styling**
- ✅ Created dedicated `header-footer.css` file
- ✅ Consistent colors, spacing, and typography
- ✅ Smooth animations and transitions
- ✅ Glass morphism effects
- ✅ Gradient text for branding
- ✅ Professional hover states

## 📁 Files Modified

### Core Files
1. **`includes/navbar.html`** - Unified navigation
2. **`includes/footer.html`** - Unified footer
3. **`assets/js/load-components.js`** - Smart path resolution
4. **`assets/css/header-footer.css`** - Dedicated styles (NEW)
5. **`assets/css/footer-lean.css`** - Updated footer styles
6. **`assets/css/styles.css`** - Updated header styles

### Removed Files
- ❌ `includes/navbar-subdir.html` (no longer needed)
- ❌ `includes/navbar-community.html` (no longer needed)

## 🎨 Design Features

### Header
- **Fixed positioning** - Always visible at top
- **Glass morphism** - Translucent background with blur
- **Gradient logo text** - Professional brand appearance
- **Dropdown menus** - Organized navigation
- **Mobile hamburger menu** - Touch-friendly
- **Smooth scrolling effects** - Enhanced on scroll

### Footer
- **Grid layout** - Organized columns
- **Brand section** - Logo, mission, tagline
- **Link sections** - Services, Company, Contact
- **Social media** - LinkedIn integration
- **Legal links** - Privacy, Terms, Disclaimer
- **Mobile locations** - GTA cities on mobile

## 🔧 How It Works

### Path Resolution Algorithm
```javascript
1. Detect current page depth
   - Root (/) = 0
   - Subdirectory (/services/) = 1
   - Nested (/community/events/) = 2

2. Calculate base path
   - Depth 0: ""
   - Depth 1: "../"
   - Depth 2: "../../"

3. Update all links
   - Convert /about.html → ../about.html (if depth = 1)
   - Convert /assets/logo.png → ../../assets/logo.png (if depth = 2)
```

### Mobile Menu
- Hamburger icon toggles menu
- Full-screen overlay
- Smooth slide-in animation
- Close on link click
- Close on outside click
- Close on ESC key

## 📱 Responsive Breakpoints

- **Desktop**: > 1024px - Full navigation bar
- **Tablet**: 768px - 1024px - Compact navigation
- **Mobile**: < 768px - Hamburger menu
- **Small Mobile**: < 480px - Optimized spacing

## 🎯 Key Features

### Accessibility
- ✅ ARIA labels on buttons
- ✅ Keyboard navigation support
- ✅ Focus management
- ✅ Semantic HTML structure
- ✅ Alt text on images

### Performance
- ✅ Lazy loading of components
- ✅ Optimized CSS with minimal specificity
- ✅ Hardware-accelerated animations
- ✅ Efficient event listeners
- ✅ Minimal reflows/repaints

### SEO
- ✅ Semantic HTML5 elements
- ✅ Proper heading hierarchy
- ✅ Descriptive link text
- ✅ Structured navigation
- ✅ Mobile-friendly design

## 🚀 Usage

### In HTML Pages
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Your head content -->
    <link rel="stylesheet" href="assets/css/styles.css">
    <link rel="stylesheet" href="assets/css/header-footer.css">
    <link rel="stylesheet" href="assets/css/footer-lean.css">
</head>
<body>
    <!-- Header -->
    <div id="header"></div>
    
    <!-- Your content -->
    <main>
        <!-- Page content -->
    </main>
    
    <!-- Footer -->
    <div id="footer"></div>
    
    <!-- Scripts -->
    <script src="assets/js/load-components.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            loadNavbar();
            loadFooter();
        });
    </script>
</body>
</html>
```

### CSS Import Order
```html
1. styles.css (base styles)
2. header-footer.css (header/footer specific)
3. footer-lean.css (footer enhancements)
4. page-specific.css (if any)
```

## 🎨 Customization

### Colors
All colors use CSS variables defined in `styles.css`:
- `--text-primary` - Main text color
- `--text-secondary` - Secondary text
- `--accent-primary` - Brand blue
- `--accent-secondary` - Brand cyan
- `--glass-bg` - Translucent backgrounds
- `--glass-border` - Border colors

### Spacing
Consistent spacing using:
- `0.5rem` - Tight spacing
- `1rem` - Normal spacing
- `2rem` - Section spacing
- `4rem` - Large gaps

### Typography
- **Logo**: 1.25rem, bold (700)
- **Nav links**: 0.9rem, medium (500)
- **Footer headings**: 1rem, semibold (600)
- **Footer links**: 0.9rem, normal (400)

## 🐛 Troubleshooting

### Header not showing?
1. Check `<div id="header"></div>` exists
2. Verify `load-components.js` is loaded
3. Check browser console for errors
4. Ensure `includes/navbar.html` exists

### Footer not showing?
1. Check `<div id="footer"></div>` exists
2. Verify `load-components.js` is loaded
3. Check browser console for errors
4. Ensure `includes/footer.html` exists

### Links not working?
1. Check path resolution in console
2. Verify file structure matches expectations
3. Test with different directory depths
4. Check for typos in file paths

### Mobile menu not working?
1. Check JavaScript console for errors
2. Verify event listeners are attached
3. Test touch events on actual device
4. Check z-index conflicts

## 📊 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ iOS Safari 14+
- ✅ Chrome Android 90+

## 🔄 Maintenance

### Adding New Pages
1. Copy HTML structure from existing page
2. Include header/footer divs
3. Load components in script
4. No path adjustments needed!

### Updating Navigation
1. Edit `includes/navbar.html`
2. Changes apply to all pages automatically
3. Test on different directory levels

### Updating Footer
1. Edit `includes/footer.html`
2. Changes apply to all pages automatically
3. Update social links as needed

## ✨ Best Practices

1. **Always use the component loader** - Don't hardcode header/footer
2. **Test on multiple pages** - Root, subdirectory, and nested
3. **Check mobile responsiveness** - Use browser dev tools
4. **Validate HTML** - Ensure semantic structure
5. **Test accessibility** - Use screen reader
6. **Optimize images** - Compress logo and icons
7. **Monitor performance** - Check load times

## 📞 Support

For issues or questions:
- Check browser console for errors
- Review this guide
- Test in different browsers
- Verify file paths and structure

---

**Last Updated**: 2025
**Version**: 2.0
**Status**: ✅ Production Ready