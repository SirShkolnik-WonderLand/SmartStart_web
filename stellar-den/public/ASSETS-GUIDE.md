# 🎨 Assets Guide - AliceSolutionsGroup & SmartStart

## 📁 Directory Structure

```
public/
├── logos/              # Company and product logos
├── certificates/       # Professional certifications
└── icons/             # SVG icons for UI elements
```

---

## 🦉 Logo System

### Logo Philosophy
- **🦉 Owl** = AliceSolutionsGroup (wisdom, vision, governance, long-term strategy)
- **🐇 Rabbit** = SmartStart (curiosity, agility, community builder, fast multipliers)
- **🦊 Fox** = Automation Company (cleverness, adaptability, problem-solving)

### AliceSolutionsGroup Logos

#### Main Brand Logo
- **File**: `logos/alice-logo-main.png` (1.5MB)
- **Usage**: Primary logo for header, hero sections, main branding
- **Format**: PNG (high quality)
- **Current Usage**: Header component

#### SVG Logo Variants
- **Text Only**: `logos/AliceSolutionsGroup-logo-text-only.svg` (296B)
  - Use for: Minimalist branding, small spaces, text-heavy layouts
- **Compact**: `logos/AliceSolutionsGroup-logo-compact.svg` (293B)
  - Use for: Mobile headers, favicons, compact spaces
- **With Tagline**: `logos/AliceSolutionsGroup-logo-with-tagline.svg` (471B)
  - Use for: Marketing materials, landing pages, email signatures

#### Cyber Owl Logo
- **File**: `logos/cyber-owl.png` (2.1MB)
- **Usage**: About page, cybersecurity-focused pages, branding sections
- **Represents**: Technical expertise, security focus

### SmartStart Logos

#### Rabbit Icon
- **File**: `logos/smartstart-rabbit-icon.jpg` (47KB)
- **Usage**: SmartStart product pages, community sections, incubator features
- **Represents**: Agility, innovation, community

---

## 🏆 Certificates

### Professional Certifications

Located in `public/certificates/`:

#### Core Certifications
1. **CISSP** (Certified Information Systems Security Professional)
   - Files: `CISSP.png`, `cissp-full.png`
   - Usage: About page, credentials section, trust indicators

2. **CISM** (Certified Information Security Manager)
   - Files: `CISM.png`, `cism-round.png`
   - Usage: About page, credentials section, trust indicators

3. **ISO 27001 Lead Auditor**
   - Files: `iso27001-lead-auditor.png`, `ISO27001LA_round.webp`
   - Usage: ISO Studio pages, compliance sections, expertise demonstration

#### ISC2 Certifications (Highly Valuable in Industry)
4. **ISC2 Cloud Security**
   - File: `isc2-cloud-security.png`
   - Usage: Cloud services, security expertise

5. **ISC2 Breach Response**
   - File: `isc2-breach-response.png`
   - Usage: Incident response, security services

6. **ISC2 NIST Cybersecurity Framework**
   - File: `isc2-nist-framework.png`
   - Usage: Framework expertise, compliance consulting

#### Risk Management Certifications
7. **Practical Risk Methods**
   - File: `practical-risk-methods.png`
   - Usage: Risk assessment services, advisory

8. **Practical Risk Analysis**
   - File: `practical-risk-analysis.png`
   - Usage: Risk analysis, security consulting

9. **Risk Standards**
   - File: `risk-standards.png`
   - Usage: Standards compliance, risk management

#### Healthcare Certifications
10. **Healthcare Privacy & Security**
    - File: `healthcare-privacy-security.png`
    - Usage: HIPAA compliance, healthcare services

11. **Healthcare Risk Management**
    - File: `healthcare-risk-management.png`
    - Usage: Healthcare risk assessment, PHIPA compliance

### Usage Example

```tsx
// In About or Credentials section
<div className="certificates-grid">
  <img src="/certificates/CISSP.png" alt="CISSP Certification" />
  <img src="/certificates/CISM.png" alt="CISM Certification" />
  <img src="/certificates/iso27001-lead-auditor.png" alt="ISO 27001 Lead Auditor" />
</div>
```

---

## 🎯 SVG Icons

Located in `public/icons/`:

### Service Icons

1. **cybersecurity-shield.svg** - Cybersecurity services
2. **automation-gear.svg** - Automation services
3. **automation-robot.svg** - AI/Automation features
4. **advisory-target.svg** - Advisory services
5. **analytics-chart.svg** - Analytics and reporting
6. **document-template.svg** - Documentation, templates
7. **graduation-cap.svg** - Training and education
8. **handshake.svg** - Partnership, collaboration
9. **research-lab.svg** - Research and development
10. **security-lock.svg** - Security features
11. **star-highlight.svg** - Highlights, features

### Usage Example

```tsx
// In service cards or feature sections
<img 
  src="/icons/cybersecurity-shield.svg" 
  alt="Cybersecurity" 
  className="w-12 h-12"
/>
```

---

## 📝 Usage Guidelines

### Logo Usage

1. **Always maintain aspect ratio** - Don't stretch or distort logos
2. **Minimum sizes**:
   - Main logo: 150px width minimum
   - SVG logos: 100px width minimum
   - Rabbit icon: 50px width minimum
3. **Clear space**: Maintain 20% of logo width as clear space around logo
4. **Background**: Ensure sufficient contrast on colored backgrounds

### Certificate Usage

1. **Display together** - Show all three main certifications (CISSP, CISM, ISO 27001)
2. **Grid layout** - Use responsive grid (1-3 columns)
3. **Hover effects** - Add subtle hover animations for interactivity
4. **Alt text** - Always include descriptive alt text for accessibility

### Icon Usage

1. **Consistent sizing** - Use standard sizes (16px, 24px, 32px, 48px)
2. **Color theming** - Icons should inherit text color or use primary color
3. **SVG advantages** - SVGs scale perfectly, use them over PNGs when possible
4. **Accessibility** - Include aria-labels for icon-only buttons

---

## 🎨 Color Integration

### Primary Colors (from theme)
- **Teal/Cyan**: `#0ea5e9` (primary-500)
- **Dark Background**: `#0a0a0f`
- **Glass Effect**: `rgba(255, 255, 255, 0.05)`

### Icon Colors
```css
/* Light mode */
.icon-primary { fill: #0ea5e9; }
.icon-secondary { fill: #64748b; }

/* Dark mode */
.dark .icon-primary { fill: #22d3ee; }
.dark .icon-secondary { fill: #94a3b8; }
```

---

## 📱 Responsive Considerations

### Mobile (< 640px)
- Use compact logo variant
- Stack certificates vertically
- Icons at 24px or 32px

### Tablet (640px - 1024px)
- Use text-only logo
- 2-column certificate grid
- Icons at 32px or 48px

### Desktop (> 1024px)
- Use full logo with tagline
- 3-column certificate grid
- Icons at 48px or 64px

---

## 🔄 Current Implementation

### Header Component
```tsx
// Currently using: alice-logo-main.png
<img 
  src="/logos/alice-logo-main.png" 
  alt="AliceSolutionsGroup"
  className="h-8 w-auto"
/>
```

### ISO Studio Page
```tsx
// Uses: cyber-owl.png for branding
<img 
  src="/logos/cyber-owl.png" 
  alt="Cyber Owl - ISO Studio"
  className="w-16 h-16"
/>
```

---

## 🚀 Future Enhancements

### Potential Additions
- [ ] Add SmartStart full logo variants
- [ ] Create animated logo versions
- [ ] Add dark/light mode logo variants
- [ ] Create favicon set from logos
- [ ] Add certificate badges as components
- [ ] Create icon component library

### Optimization
- [ ] Convert large PNGs to WebP
- [ ] Create sprite sheets for icons
- [ ] Lazy load images below fold
- [ ] Add image preloading for above-fold assets

---

## 📚 References

- **Brand Guidelines**: See `assets/logos/CopmaniesLogoLogic`
- **SEO Guide**: See `assets/logos/SEO-how-to-2026.txt`
- **Old Website**: `smartstart-platform/old-backup/website/`

---

**Last Updated**: October 2024
**Maintained By**: AliceSolutionsGroup Development Team

