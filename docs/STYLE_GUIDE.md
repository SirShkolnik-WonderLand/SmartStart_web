# SmartStart Design System & Style Guide

## Overview

SmartStart uses a modern, professional design system built with custom CSS and a dark theme optimized for enterprise dashboards. The design emphasizes clarity, functionality, and visual appeal suitable for high-value business applications.

## Design Philosophy

- **Professional & Enterprise-Grade**: Suitable for serious business applications
- **Dark Theme First**: Modern dark interface with excellent contrast
- **Data-Driven**: Clear presentation of complex financial and project data
- **Responsive**: Works seamlessly across all device sizes
- **Accessible**: High contrast ratios and semantic HTML structure

## Color Palette

### Primary Colors
```css
--primary-50: #eff6ff;
--primary-100: #dbeafe;
--primary-200: #bfdbfe;
--primary-300: #93c5fd;
--primary-400: #60a5fa;
--primary-500: #3b82f6;
--primary-600: #2563eb;
--primary-700: #1d4ed8;
--primary-800: #1e40af;
--primary-900: #1e3a8a;
```

### Success Colors
```css
--success-50: #f0fdf4;
--success-100: #dcfce7;
--success-200: #bbf7d0;
--success-300: #86efac;
--success-400: #4ade80;
--success-500: #22c55e;
--success-600: #16a34a;
--success-700: #15803d;
--success-800: #166534;
--success-900: #14532d;
```

### Warning Colors
```css
--warning-50: #fffbeb;
--warning-100: #fef3c7;
--warning-200: #fde68a;
--warning-300: #fcd34d;
--warning-400: #fbbf24;
--warning-500: #f59e0b;
--warning-600: #d97706;
--warning-700: #b45309;
--warning-800: #92400e;
--warning-900: #78350f;
```

### Error Colors
```css
--error-50: #fef2f2;
--error-100: #fee2e2;
--error-200: #fecaca;
--error-300: #fca5a5;
--error-400: #f87171;
--error-500: #ef4444;
--error-600: #dc2626;
--error-700: #b91c1c;
--error-800: #991b1b;
--error-900: #7f1d1d;
```

### Neutral Colors
```css
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;
```

## Typography

### Font Families
- **Primary**: Inter (Google Fonts)
- **Monospace**: JetBrains Mono (for code/technical content)

### Font Sizes
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

### Font Weights
- **Light**: 300
- **Normal**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700
- **Extrabold**: 800

## Component Library

### Cards
Cards are the primary content containers with subtle shadows and hover effects.

```css
.card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
}
```

### Stat Cards
Special cards for displaying key metrics with colored top borders.

```css
.stat-card {
  /* Base card styles */
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-500), var(--primary-600));
}
```

### Buttons
Professional buttons with gradient backgrounds and hover effects.

```css
.btn-primary {
  background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
  color: white;
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--primary-700), var(--primary-800));
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}
```

### Status Indicators
Animated dots and badges for system status.

```css
.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: var(--radius-full);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

## Layout System

### Container
```css
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}
```

### Grid System
```css
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-6);
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--space-6);
}
```

## Spacing System

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

## Border Radius

```css
--radius-sm: 0.25rem;   /* 4px */
--radius-md: 0.375rem;  /* 6px */
--radius-lg: 0.5rem;    /* 8px */
--radius-xl: 0.75rem;   /* 12px */
--radius-2xl: 1rem;     /* 16px */
--radius-full: 9999px;  /* Full circle */
```

## Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
```

## Transitions

```css
--transition-fast: 150ms ease-in-out;
--transition-normal: 250ms ease-in-out;
--transition-slow: 350ms ease-in-out;
```

## Dark Theme

The application uses a dark theme by default with proper contrast ratios:

```css
:root {
  --text-primary: var(--gray-900);
  --text-secondary: var(--gray-600);
  --text-tertiary: var(--gray-500);
  --bg-primary: white;
  --bg-secondary: var(--gray-50);
  --bg-tertiary: var(--gray-100);
  --bg-elevated: white;
}

@media (prefers-color-scheme: dark) {
  :root {
    --text-primary: white;
    --text-secondary: var(--gray-300);
    --text-tertiary: var(--gray-400);
    --bg-primary: var(--gray-900);
    --bg-secondary: var(--gray-800);
    --bg-tertiary: var(--gray-700);
    --bg-elevated: var(--gray-800);
  }
}
```

## Icons

SmartStart uses Lucide React icons for consistency and scalability. All icons should be sized appropriately:

- **Small**: 16px (status indicators, inline)
- **Medium**: 20px (buttons, cards)
- **Large**: 24px (headers, main content)
- **Extra Large**: 32px (hero sections)

## Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Adaptations
- Single column layouts
- Stacked navigation
- Reduced padding and margins
- Touch-friendly button sizes

## Accessibility

- **Contrast Ratios**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Focus States**: Visible focus indicators on all interactive elements
- **Semantic HTML**: Proper heading hierarchy and ARIA labels
- **Keyboard Navigation**: All interactive elements accessible via keyboard

## Performance

- **CSS Variables**: Efficient theming and customization
- **Optimized Animations**: Hardware-accelerated transforms
- **Minimal Dependencies**: Custom CSS reduces bundle size
- **Efficient Selectors**: Optimized CSS selectors for performance

## Usage Guidelines

### When to Use Cards
- Displaying related information
- Grouping content sections
- Creating visual hierarchy
- Interactive elements

### When to Use Stat Cards
- Key performance indicators
- Financial metrics
- System status information
- Important numbers

### When to Use Buttons
- Primary actions (btn-primary)
- Secondary actions (btn-secondary)
- Ghost actions (btn-ghost)
- Destructive actions (btn-destructive)

### Color Usage
- **Primary Blue**: Main actions, links, highlights
- **Success Green**: Positive states, completions
- **Warning Orange**: Caution states, pending items
- **Error Red**: Error states, destructive actions
- **Neutral Gray**: Text, borders, backgrounds

This design system ensures consistency, professionalism, and excellent user experience across the SmartStart platform.
