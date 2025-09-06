import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Wonderland Theme Colors
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        "foreground-body": "hsl(var(--foreground-body))",
        "foreground-muted": "hsl(var(--foreground-muted))",
        
        // Glass Surfaces
        glass: {
          surface: "var(--glass-surface)",
          border: "var(--glass-border)",
        },
        
        // Wonderland Brand Colors
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        highlight: {
          DEFAULT: "hsl(var(--highlight))",
          foreground: "hsl(var(--highlight-foreground))",
        },
        
        // Interactive States
        hover: "var(--hover)",
        active: "var(--active)",
        focus: "hsl(var(--focus))",
        
        // Borders & Dividers
        border: "var(--border)",
        "border-light": "var(--border-light)",
        
        // Status Colors
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        error: "hsl(var(--error))",
        info: "hsl(var(--info))",
        
        // Legacy shadcn/ui compatibility
        card: {
          DEFAULT: "hsl(var(--background))",
          foreground: "hsl(var(--foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--background))",
          foreground: "hsl(var(--foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--foreground-muted))",
          foreground: "hsl(var(--foreground-muted))",
        },
        destructive: {
          DEFAULT: "hsl(var(--error))",
          foreground: "hsl(var(--primary-foreground))",
        },
        input: "var(--border)",
        ring: "hsl(var(--focus))",
        chart: {
          "1": "hsl(var(--primary))",
          "2": "hsl(var(--accent))",
          "3": "hsl(var(--highlight))",
          "4": "hsl(var(--foreground-muted))",
          "5": "hsl(var(--foreground-body))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-in": "slideIn 0.6s ease-out",
        "shimmer": "shimmer 2s infinite",
        "glow": "glow 2s ease-in-out infinite",
        "door-open": "door-open 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
        "key-glint": "key-glint 0.6s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        glow: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        "door-open": {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
        "key-glint": {
          "0%": { transform: "scale(1) rotate(0deg)" },
          "50%": { transform: "scale(1.1) rotate(180deg)" },
          "100%": { transform: "scale(1) rotate(360deg)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        "glass": "var(--glass-shadow)",
        "glass-lg": "var(--glass-shadow-lg)",
        "glow": "0 0 20px rgba(59, 130, 246, 0.3)",
        "glow-lg": "0 0 30px rgba(59, 130, 246, 0.6)",
      },
    },
  },
  plugins: [],
}

export default config

