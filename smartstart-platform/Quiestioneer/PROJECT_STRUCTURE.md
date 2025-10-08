# 📁 SMB Cyber Health Check - Project Structure

## 🏗️ **Final Clean Architecture**

```
smb-cyber-health-check/
├── 📁 server/                    # Backend API & Static Serving
│   ├── 📄 app.py                 # Main FastAPI application (unified)
│   ├── 📄 security.py            # Security utilities & rate limiting  
│   └── 📄 requirements.txt       # Python dependencies
│
├── 📁 src/                       # Frontend React Application
│   ├── 📁 components/            # Reusable UI Components
│   │   ├── 📄 AliceSolutionGroup.tsx/css.ts  # Animated branding
│   │   ├── 📄 Button.tsx/css.ts              # Button component
│   │   ├── 📄 Card.tsx/css.ts                # Glass morphism cards
│   │   ├── 📄 EmailModal.tsx/css.ts          # Email capture modal
│   │   ├── 📄 ProgressBar.tsx/css.ts         # Progress indicator
│   │   └── 📄 ResultGauge3D.tsx              # 3D shield gauge
│   │
│   ├── 📁 features/              # Feature-Specific Modules
│   │   └── 📁 assessment/        # Assessment Feature
│   │       ├── 📄 AssessmentView.tsx/css.ts  # Main assessment UI
│   │       ├── 📄 HeroView.tsx/css.ts        # Landing page
│   │       ├── 📄 ResultView.tsx/css.ts      # Results display
│   │       ├── 📄 ThankYouView.tsx/css.ts    # Thank you page
│   │       ├── 📄 content.ts                 # Questions & data
│   │       ├── 📄 ScoreEngine.ts             # Scoring logic
│   │       └── 📄 useAssessmentStore.ts      # State management
│   │
│   ├── 📁 lib/                   # Utility Libraries
│   │   ├── 📄 a11y.ts           # Accessibility utilities
│   │   └── 📄 api.ts            # API client
│   │
│   ├── 📁 styles/               # Design System
│   │   ├── 📄 tokens.css.ts     # Design tokens (colors, spacing)
│   │   └── 📄 globals.css       # Global styles & resets
│   │
│   ├── 📄 App.tsx               # Main application component
│   └── 📄 main.tsx              # Application entry point
│
├── 📁 public/                   # Static Assets
│   ├── 📄 manifest.json         # PWA manifest
│   ├── 📄 robots.txt           # SEO robots file
│   └── 📄 sitemap.xml          # SEO sitemap
│
├── 📄 index.html               # HTML template
├── 📄 vite.config.ts           # Vite configuration
├── 📄 tsconfig.json            # TypeScript configuration
├── 📄 package.json             # Node.js dependencies & scripts
├── 📄 Dockerfile               # Production container
├── 📄 render.yaml              # Render.com deployment config
├── 📄 deploy.sh                # Automated deployment script
├── 📄 env.example              # Environment configuration template
├── 📄 .gitignore               # Git ignore rules
├── 📄 README.md                # Project documentation
└── 📄 DEPLOYMENT_GUIDE.md      # Deployment instructions
```

## 🎯 **Key Features**

### ✅ **Security First**
- Rate limiting (10 requests/hour per IP)
- Input validation & sanitization
- SQL injection prevention
- XSS protection with CSP headers
- Secure session management
- Audit logging

### ✅ **Modern Tech Stack**
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Vanilla Extract (zero-runtime CSS-in-JS)
- **Animations**: Framer Motion + GSAP
- **3D Graphics**: React Three Fiber
- **Backend**: FastAPI + Python 3.11
- **Database**: SQLite with WAL mode
- **PDF**: WeasyPrint generation

### ✅ **Production Ready**
- Single server deployment
- Docker containerization
- Render.com configuration
- Automated deployment scripts
- Health checks & monitoring
- Environment configuration

### ✅ **Beautiful Design**
- Dark theme with glass morphism
- Animated AliceSolutionGroup branding
- Mobile-first responsive design
- Accessibility compliant
- Smooth micro-interactions

## 🚀 **Quick Commands**

```bash
# Development
npm run dev              # Start frontend dev server
npm run server           # Start unified server
npm run build            # Build for production

# Docker
npm run docker:build     # Build Docker image
npm run docker:run       # Run Docker container

# Deployment
npm run deploy           # Run deployment script
./deploy.sh --docker     # Docker deployment
./deploy.sh --target user@server.com  # Remote deployment

# Maintenance
npm run clean            # Clean build artifacts
npm run type-check       # TypeScript validation
```

## 🔒 **Security Features**

- **Rate Limiting**: Prevents abuse
- **Input Validation**: All user inputs sanitized
- **Security Headers**: HSTS, CSP, X-Frame-Options
- **Session Security**: Cryptographically secure IDs
- **Database Security**: Parameterized queries only
- **Audit Logging**: Security events tracked

## 📊 **API Endpoints**

| Method | Endpoint | Description | Security |
|--------|----------|-------------|----------|
| GET | `/` | Frontend app | Rate limited |
| GET | `/health` | Health check | Public |
| POST | `/api/assess` | Submit assessment | Rate limited |
| GET | `/api/report/{id}` | Generate PDF | Session-based |
| GET | `/api/stats` | Statistics | Admin |
| GET | `/docs` | API docs | Public |

## 🎨 **Design System**

- **Colors**: Dark theme with purple accents
- **Typography**: Inter font family
- **Spacing**: Consistent token-based system
- **Animations**: Smooth micro-interactions
- **Components**: Reusable glass morphism cards

---

**This structure provides maximum security, maintainability, and deployment simplicity!** 🚀
