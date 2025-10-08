# AliceSolutionsGroup Design System

**Version:** 1.0  
**Last Updated:** October 8, 2025  
**Status:** ✅ Active Standard

---

## 🎨 Color Palette

### Primary Colors
```css
--bg-primary: #0a0e1a;           /* Main background - dark navy */
--text-primary: #f8fafc;         /* Primary text - near white */
--text-secondary: #94a3b8;       /* Secondary text - cool gray */
--accent-primary: #3b82f6;       /* Primary accent - vibrant blue */
--accent-secondary: #06b6d4;     /* Secondary accent - cyan */
--accent-tertiary: #8b5cf6;      /* Tertiary accent - purple */
```

### Glass Morphism
```css
--glass-bg: rgba(15, 23, 42, 0.6);              /* Glass card background */
--glass-border: rgba(59, 130, 246, 0.2);        /* Glass card border */
--glass-hover: rgba(59, 130, 246, 0.1);         /* Glass hover state */
```

### Gradient Combinations
```css
/* Primary Gradient (Blue to Cyan) */
background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);

/* Secondary Gradient (Cyan to Purple) */
background: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%);

/* Tertiary Gradient (Purple to Blue) */
background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);

/* Text Gradient (White to Gray) */
background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;
```

---

## 🏗️ Layout Structure

### Page Anatomy
Every page should follow this structure:

1. **Header** - `<div id="header"></div>` (dynamically loaded)
2. **Hero Section** - Full viewport height with animated background
3. **Content Sections** - Alternating backgrounds
4. **Footer** - `<div id="footer"></div>` (dynamically loaded)

### Container Widths
```css
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
}

.container-narrow {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 2rem;
}
```

### Section Spacing
```css
.section {
    padding: 5rem 0;  /* Standard section */
}

.section-compact {
    padding: 4rem 0;  /* Compact section */
}

.section-large {
    padding: 6rem 0;  /* Large section */
}
```

---

## 🎭 Hero Section

### Structure
```html
<section class="hero" style="padding-top: 120px; min-height: 80vh; display: flex; align-items: center; position: relative;">
    <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 0 2rem; position: relative; z-index: 2;">
        <div class="hero-content" style="text-align: center; max-width: 900px; margin: 0 auto;">
            <!-- Hero Badge -->
            <div class="hero-badge">Page Category</div>
            
            <!-- Hero Title -->
            <h1 class="hero-title">
                Main Title <span class="gradient-text">Highlighted Text</span>
            </h1>
            
            <!-- Hero Tagline -->
            <p class="hero-tagline">Compelling subtitle with emotional hook.</p>
            
            <!-- Hero Description -->
            <p style="...">Supporting description with context.</p>
            
            <!-- Hero Buttons -->
            <div class="hero-buttons">
                <a href="#" class="cta-button primary">Primary Action</a>
                <a href="#" class="cta-button secondary">Secondary Action</a>
            </div>
        </div>
    </div>
</section>
```

### Hero Components

#### Badge
```css
.hero-badge {
    display: inline-block;
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.3);
    padding: 0.5rem 1.5rem;
    border-radius: 50px;
    color: #3b82f6;
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 2rem;
}
```

#### Title
```css
.hero-title {
    font-size: clamp(2.5rem, 6vw, 4rem);
    font-weight: 700;
    line-height: 1.1;
    margin-bottom: 1.5rem;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.hero-title .gradient-text {
    background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}
```

#### Tagline
```css
.hero-tagline {
    font-size: clamp(1.2rem, 3vw, 1.8rem);
    font-weight: 500;
    color: #cbd5e1;
    margin-bottom: 2rem;
    line-height: 1.4;
}
```

---

## 🃏 Card Components

### Glass Card (Basic)
```html
<div class="glass-card" style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 16px; padding: 2rem;">
    <h3>Card Title</h3>
    <p>Card content goes here...</p>
</div>
```

### Service/Feature Card
```html
<div class="card" style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 16px; padding: 2rem; position: relative; overflow: hidden;">
    <!-- Decorative gradient circle -->
    <div style="position: absolute; top: -50px; right: -50px; width: 100px; height: 100px; background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); border-radius: 50%; opacity: 0.1;"></div>
    
    <h3 style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin-bottom: 1rem;">Card Title</h3>
    <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.5rem;">Card description text.</p>
    
    <!-- Highlight Tags -->
    <div style="margin-bottom: 1.5rem;">
        <span class="highlight-tag">Feature 1</span>
        <span class="highlight-tag">Feature 2</span>
        <span class="highlight-tag">Feature 3</span>
    </div>
    
    <!-- CTA Button -->
    <a href="#" class="cta-button primary">Take Action</a>
</div>
```

### Highlight Tags
```css
.highlight-tag {
    display: inline-block;
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.85rem;
    margin-right: 0.5rem;
    margin-bottom: 0.5rem;
}

/* Color Variations */
.highlight-tag.cyan {
    background: rgba(6, 182, 212, 0.1);
    color: #06b6d4;
}

.highlight-tag.purple {
    background: rgba(139, 92, 246, 0.1);
    color: #8b5cf6;
}
```

---

## 🔘 Buttons & CTAs

### Primary Button
```css
.cta-button.primary {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
}

.cta-button.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 40px rgba(59, 130, 246, 0.4);
}
```

### Secondary Button
```css
.cta-button.secondary {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background: transparent;
    color: #3b82f6;
    text-decoration: none;
    border: 2px solid #3b82f6;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.3s ease;
}

.cta-button.secondary:hover {
    background: rgba(59, 130, 246, 0.1);
    transform: translateY(-2px);
}
```

### Button Group
```css
.hero-buttons {
    display: flex;
    gap: 1.5rem;
    justify-content: center;
    flex-wrap: wrap;
}
```

---

## 📐 Grid Layouts

### Card Grid (Responsive)
```css
.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
}
```

### Compact Grid
```css
.compact-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
}
```

### 4-Column Grid
```css
.approach-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
}
```

### 3-Column Tools/Metrics
```css
.tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}
```

---

## 🎯 Section Backgrounds

### Alternating Pattern
```css
/* Pattern 1: Primary Background */
background: var(--bg-primary);

/* Pattern 2: Subtle Blue Tint */
background: rgba(59, 130, 246, 0.05);

/* Pattern 3: Dark Gradient (for special sections) */
background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
```

### Animated Background (Hero)
All hero sections should use `position: relative` and include:
```html
<script src="../assets/js/animated-background.js"></script>
<script src="../assets/js/scroll-animations.js"></script>
```

---

## 📊 Typography

### Font Stack
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Heading Sizes
```css
h1 { font-size: clamp(2.5rem, 6vw, 4rem); }      /* Hero titles */
h2 { font-size: 2.5rem; }                          /* Section titles */
h3 { font-size: 1.5rem; }                          /* Card titles */
h4 { font-size: 1.3rem; }                          /* Subsection titles */
```

### Body Text
```css
p {
    font-size: 1.1rem;
    line-height: 1.6;
    color: var(--text-secondary);
}

.large-text {
    font-size: 1.2rem;
}

.small-text {
    font-size: 0.9rem;
}
```

### Font Weights
```css
.light { font-weight: 300; }
.regular { font-weight: 400; }
.medium { font-weight: 500; }
.semibold { font-weight: 600; }
.bold { font-weight: 700; }
.extrabold { font-weight: 800; }
```

---

## 🎨 Visual Effects

### Text Gradients
```css
/* Blue-Cyan Gradient */
background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;

/* White-Gray Gradient */
background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;
```

### Box Shadows
```css
/* Subtle shadow */
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

/* Medium shadow */
box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);

/* Strong shadow */
box-shadow: 0 20px 60px rgba(59, 130, 246, 0.4);
```

### Border Radius
```css
.radius-sm { border-radius: 8px; }    /* Buttons */
.radius-md { border-radius: 12px; }   /* Small cards */
.radius-lg { border-radius: 16px; }   /* Standard cards */
.radius-xl { border-radius: 20px; }   /* Large cards */
.radius-pill { border-radius: 50px; } /* Badges */
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile First Approach */
@media (min-width: 640px) {  /* Small tablets */
    /* Styles */
}

@media (min-width: 768px) {  /* Tablets */
    /* Styles */
}

@media (min-width: 1024px) { /* Desktops */
    /* Styles */
}

@media (min-width: 1280px) { /* Large desktops */
    /* Styles */
}
```

---

## 🎭 Impact Metrics Section

### Dark Background with Large Numbers
```html
<section style="padding: 4rem 0; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);">
    <div class="container">
        <h2 style="font-size: 2rem; font-weight: 700; color: #f8fafc; margin-bottom: 2rem; text-align: center;">
            Measurable Impact
        </h2>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 3rem; text-align: center;">
            <div>
                <div style="font-size: 3.5rem; font-weight: 800; background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 0.5rem;">
                    +20%
                </div>
                <p style="color: #cbd5e1; font-size: 1.1rem;">Metric description</p>
            </div>
            <!-- Repeat for other metrics -->
        </div>
    </div>
</section>
```

---

## ✅ Required Scripts

### Every Page Must Include
```html
<!-- CSS -->
<link rel="stylesheet" href="../assets/css/styles.css">
<link rel="stylesheet" href="../assets/css/footer-lean.css">
<link rel="stylesheet" href="../assets/css/main-pages.css">

<!-- JavaScript -->
<script src="../assets/js/animated-background.js"></script>
<script src="../assets/js/scroll-animations.js"></script>
<script src="../assets/js/load-components.js"></script>
<script src="../assets/js/script.js"></script>

<!-- Initialize -->
<script>
    document.addEventListener('DOMContentLoaded', () => {
        loadNavbar();
        loadFooter();
    });
</script>
```

---

## 🎯 Design Principles

### 1. **Glass Morphism First**
- Use semi-transparent backgrounds with blur effects
- Add subtle borders with low opacity
- Layer content with proper z-index

### 2. **Gradient Consistency**
- Always use the three gradient combinations defined above
- Rotate gradients between cards for visual interest
- Apply gradients to text for emphasis

### 3. **Spacing Harmony**
- Use consistent padding (2rem, 3rem for cards)
- Maintain 2rem gap between grid items
- Keep section padding at 4-5rem vertical

### 4. **Typography Hierarchy**
- Hero titles: clamp(2.5rem, 6vw, 4rem)
- Section titles: 2.5rem
- Card titles: 1.5rem
- Body text: 1.1rem

### 5. **Interactive Elements**
- All buttons should have hover states
- Use transform: translateY(-2px) for lift effect
- Add box-shadow transitions for depth

### 6. **Color Accessibility**
- Primary text (#f8fafc) on dark backgrounds
- Secondary text (#94a3b8) for descriptions
- Accent colors for interactive elements only

### 7. **Mobile-First Responsive**
- Use `clamp()` for fluid typography
- Grid auto-fit with sensible minimums
- Stack elements vertically on mobile

---

## 🚀 Page Templates

### Service Page Template
```
1. Hero (with animated background)
2. Main Content Grid (white/light background)
3. Callout Section (subtle blue tint)
4. Features/Benefits (white/light background)
5. CTA Section (dark gradient)
```

### Case Study Pattern
```
1. Client name + Industry badge
2. Brief description (2-3 lines)
3. Bulleted results (3-5 items)
4. Decorative gradient circle (top-right corner)
```

---

## 📋 Quality Checklist

Before publishing any page, verify:

- [ ] Hero has animated background (not solid color)
- [ ] All cards use glass morphism styles
- [ ] Gradients are consistent with design system
- [ ] Typography uses clamp() for responsiveness
- [ ] Buttons have primary/secondary variants
- [ ] Proper z-index layering (content above background)
- [ ] All scripts are loaded (animated-background.js, etc.)
- [ ] Mobile responsive (test at 375px, 768px, 1024px)
- [ ] Accessibility: sufficient color contrast
- [ ] No emoji icons (clean, professional appearance)

---

## 🎨 Color Usage Guide

### When to Use Each Color

**Primary Blue (#3b82f6)**
- Primary buttons and CTAs
- Interactive elements
- Badges and tags
- Link hover states

**Cyan (#06b6d4)**
- Gradient endpoints
- Alternate badges
- Secondary accents

**Purple (#8b5cf6)**
- Tertiary gradient color
- Special callouts
- Variety in card decorations

**White/Gray Text (#f8fafc / #94a3b8)**
- Primary content
- Secondary descriptions
- Always maintain contrast

---

## 🔄 Version History

- **v1.0** (Oct 8, 2025) - Initial design system documentation
  - Established color palette
  - Defined component patterns
  - Created typography system
  - Set responsive guidelines

---

## 📞 Questions?

This design system represents the **official standard** for AliceSolutionsGroup web properties. All new pages should follow these patterns for consistency and professional appearance.

**Key Philosophy:** Clean, modern, glass morphism aesthetic with animated backgrounds, gradient accents, and crystal-clear content hierarchy.

