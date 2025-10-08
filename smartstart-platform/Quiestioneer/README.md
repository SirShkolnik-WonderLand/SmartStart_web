# SMB Cyber Health Check

A comprehensive, secure cyber security assessment tool for Ontario & GTA small businesses. Built with modern web technologies and security best practices.

## 🚀 Features

- **Interactive Assessment**: 12-question cyber security health check
- **Multiple Modes**: Lite, Standard, and Pro assessment levels
- **Real-time Scoring**: Instant results with detailed analysis
- **PDF Reports**: Downloadable comprehensive reports
- **Compliance Guidance**: PIPEDA, PHIPA, ISO 27001, SOC 2 support
- **Security First**: Rate limiting, input validation, secure headers
- **Responsive Design**: Mobile-first, accessible interface
- **Single Server**: Unified FastAPI + React deployment

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with Vite
- **Styling**: Vanilla Extract (zero-runtime CSS-in-JS)
- **Animations**: Framer Motion + GSAP
- **3D Graphics**: React Three Fiber
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation

### Backend (FastAPI + Python)
- **Framework**: FastAPI with async/await
- **Database**: SQLite with WAL mode
- **PDF Generation**: WeasyPrint
- **Security**: Rate limiting, input validation, secure headers
- **API**: RESTful endpoints with OpenAPI documentation

### Security Features
- ✅ Rate limiting (10 requests/hour per IP)
- ✅ Input validation and sanitization
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ CSRF protection
- ✅ Security headers (HSTS, CSP, etc.)
- ✅ Non-root Docker container
- ✅ Database encryption ready
- ✅ Session management
- ✅ Audit logging

## 📁 Project Structure

```
smb-cyber-health-check/
├── server/                 # Backend API server
│   ├── app.py             # Main FastAPI application
│   ├── security.py        # Security utilities
│   └── requirements.txt   # Python dependencies
├── src/                   # Frontend React application
│   ├── components/        # Reusable UI components
│   ├── features/          # Feature-specific modules
│   ├── styles/           # Design tokens and global styles
│   └── lib/              # Utility libraries
├── public/               # Static assets
├── dist/                 # Built frontend (generated)
├── Dockerfile            # Production container
├── render.yaml           # Render.com deployment config
└── env.example          # Environment configuration template
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker (optional)

### Development Setup

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd smb-cyber-health-check
   npm install
   ```

2. **Set up environment**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Run development server**
   ```bash
   # Frontend only (for development)
   npm run dev
   
   # Or run the unified server (production-like)
   cd server
   pip install -r requirements.txt
   python app.py
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

### Docker Deployment

1. **Build and run**
   ```bash
   docker build -t smb-cyber-health-check .
   docker run -p 8000:8000 smb-cyber-health-check
   ```

2. **Access the application**
   - Frontend: http://localhost:8000
   - API docs: http://localhost:8000/docs
   - Health check: http://localhost:8000/health

## 🌐 Deployment

### Render.com (Recommended)

1. **Connect your repository** to Render.com
2. **Configure environment variables** from `env.example`
3. **Deploy** - Render will automatically build and deploy using the `Dockerfile`

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to your server**
   ```bash
   # Copy files to server
   scp -r dist/ server/ user@your-server:/app/
   
   # Install Python dependencies
   pip install -r server/requirements.txt
   
   # Run the application
   python server/app.py
   ```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `8000` |
| `SECRET_KEY` | Application secret key | Generated |
| `DATABASE_URL` | Database connection string | `sqlite:///./smb_health_check.db` |
| `MAX_ASSESSMENTS_PER_IP` | Rate limit per IP | `10` |
| `RATE_LIMIT_WINDOW` | Rate limit window (seconds) | `3600` |

## 🔒 Security Considerations

### Production Checklist
- [ ] Change default `SECRET_KEY`
- [ ] Configure proper CORS origins
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging
- [ ] Regular security updates
- [ ] Database backups
- [ ] Rate limiting monitoring

### Security Features
- **Rate Limiting**: Prevents abuse with IP-based limits
- **Input Validation**: All user inputs are validated and sanitized
- **SQL Injection Protection**: Parameterized queries only
- **XSS Protection**: Content Security Policy and input sanitization
- **Secure Headers**: HSTS, CSP, X-Frame-Options, etc.
- **Session Security**: Cryptographically secure session IDs
- **Audit Logging**: Security events are logged for monitoring

## 📊 API Endpoints

### Public Endpoints
- `GET /` - Serve frontend application
- `GET /health` - Health check
- `POST /api/assess` - Submit assessment
- `GET /api/report/{session_id}` - Generate PDF report

### Admin Endpoints
- `GET /api/stats` - Basic statistics
- `GET /docs` - API documentation

## 🎨 Design System

### Color Palette
- **Background**: `#0b0f14` (Dark blue-black)
- **Surface**: `#121821` (Dark blue-gray)
- **Accent**: `#7b61ff` (Purple)
- **Text**: `#e7edf5` (Light blue-white)
- **Success**: `#31d0aa` (Teal)
- **Warning**: `#ffb020` (Orange)
- **Error**: `#ff5c5c` (Red)

### Typography
- **Font**: Inter (system fallback)
- **Sizes**: 14px, 16px, 18px, 24px, 32px, 48px
- **Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

## 🧪 Testing

```bash
# Run frontend tests
npm test

# Run backend tests
cd server
python -m pytest

# Run security tests
python server/security.py
```

## 📈 Monitoring

### Health Checks
- Application health: `GET /health`
- Database connectivity
- Rate limiting status
- Memory usage

### Logging
- Security events
- API requests
- Error tracking
- Performance metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Document new features
- Follow security guidelines
- Use semantic commit messages

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Email**: hello@alicesolutiongroup.com
- **Documentation**: [Project Wiki](link-to-wiki)
- **Issues**: [GitHub Issues](link-to-issues)

## 🔄 Changelog

### v1.0.0 (Current)
- Initial release
- 12-question assessment
- PDF report generation
- Security hardening
- Single server deployment
- Mobile-responsive design

---

**Built with ❤️ by AliceSolutionGroup**