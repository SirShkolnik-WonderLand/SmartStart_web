# SmartStart Platform - Complete Deployment Guide

## 🚀 Render.com Deployment

This repository is configured for automatic deployment on Render with a complete full-stack web application including a dedicated API server.

### What's Included

- ✅ **Dedicated API Server**: Express.js with comprehensive business logic
- ✅ **Web Service**: Next.js 14 frontend application
- ✅ **Advanced Authentication**: JWT-based with RBAC
- ✅ **Dark Theme UI**: Beautiful, responsive design
- ✅ **Comprehensive Database**: 50+ models with RBAC
- ✅ **Production Ready**: Environment variables and security
- ✅ **Auto Deployment**: Automatic builds and deployments

### Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Server    │    │   Database      │
│   (Next.js)     │◄──►│   (Express.js)  │◄──►│   (PostgreSQL)  │
│   Port: 3000    │    │   Port: 3001    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Deployment Steps

1. **Connect to Render**:
   - Go to [render.com](https://render.com)
   - Sign up/login with your GitHub account
   - Click "New +" → "Blueprint"

2. **Select Repository**:
   - Choose this repository: `udishkolnik/SmartStart`
   - Render will detect the `render.yaml` configuration

3. **Review Configuration**:
   - **API Service**: `smartstart-api` (Express.js server)
   - **Web Service**: `smartstart-platform` (Next.js frontend)
   - **Database**: `smartstart-db` (PostgreSQL)
   - **Environment**: Production-ready with security

4. **Deploy**:
   - Click "Apply" to start deployment
   - Render will automatically:
     - Create PostgreSQL database
     - Deploy the API server
     - Deploy the web service
     - Run database migrations
     - Seed initial data
     - Configure environment variables

### What Happens During Deployment

1. **Database Creation**: PostgreSQL database with connection string
2. **API Server Deployment**: Express.js server with business logic
3. **Web Service Deployment**: Next.js frontend application
4. **Dependencies**: Install Node.js dependencies for both services
5. **Database Migration**: Push Prisma schema to database
6. **Data Seeding**: Create roles, permissions, and demo users
7. **Build Process**: Build Next.js application
8. **Health Check**: Verify deployment success

### Environment Variables (Auto-configured)

#### API Server (`smartstart-api`)
```env
DATABASE_URL=postgresql://... (from Render database)
JWT_SECRET=auto-generated-secure-secret
NEXTAUTH_SECRET=auto-generated-secure-secret
API_PORT=3001
NODE_ENV=production
STRIPE_SECRET_KEY=sk_test_... (add your key)
GITHUB_CLIENT_ID= (add your GitHub OAuth app ID)
GITHUB_CLIENT_SECRET= (add your GitHub OAuth secret)
M365_CLIENT_ID= (add your Microsoft 365 app ID)
M365_CLIENT_SECRET= (add your Microsoft 365 secret)
```

#### Web Service (`smartstart-platform`)
```env
DATABASE_URL=postgresql://... (from Render database)
JWT_SECRET=auto-generated-secure-secret
NEXTAUTH_SECRET=auto-generated-secure-secret
NEXTAUTH_URL=https://smartstart-platform.onrender.com
NEXT_PUBLIC_API_URL=https://smartstart-api.onrender.com
NODE_ENV=production
STRIPE_PUBLISHABLE_KEY=pk_test_... (add your key)
```

### Verification

After deployment, you can verify the setup:

1. **Check Service Status**: Green status in Render dashboard
2. **API Server**: Health check at `/api/health`
3. **Database Connection**: Service logs should show successful connection
4. **Data Seeding**: Logs should show "Database seed completed successfully"
5. **Web Application**: Access your platform at the provided URL

### Accessing the Platform

- **Web Application**: `https://smartstart-platform.onrender.com`
- **API Server**: `https://smartstart-api.onrender.com`
- **API Health Check**: `https://smartstart-api.onrender.com/api/health`
- **Database**: Use Render database connection string

### Demo Credentials

The platform comes with pre-seeded demo accounts:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Super Admin** | admin@smartstart.com | admin123 | All permissions |
| **Regular User** | user@smartstart.com | user123 | Basic member permissions |
| **Project Owner** | owner@demo.local | owner123 | Project management |
| **Contributor** | contrib@demo.local | contrib123 | Contribution permissions |

### API Server Features

#### 🔐 Authentication & RBAC
- **JWT-based authentication** with secure session management
- **Role-Based Access Control** with hierarchical permissions
- **Account lockout protection** after failed login attempts
- **Session timeout** and automatic logout

#### 🗄️ Business Logic
- **User management** with role assignments
- **Project management** with equity tracking
- **Task management** with assignment and tracking
- **Equity management** with cap table operations
- **System settings** with configuration management

#### 🔧 External Integrations
- **Stripe integration** for payment processing
- **GitHub OAuth** for developer authentication
- **Microsoft 365** for enterprise features
- **Background jobs** for quarterly rebalancing

#### 📊 API Endpoints

##### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user session

##### User Management
- `GET /api/users` - List all users (requires `user:read`)

##### Project Management
- `GET /api/projects` - List all projects (requires `project:read`)
- `POST /api/projects` - Create new project (requires `project:write`)

##### Equity Management
- `GET /api/equity/:ventureId` - Get cap table (requires `equity:read`)

##### Task Management
- `GET /api/tasks` - List tasks (requires `project:read`)

##### System Management
- `GET /api/system/settings` - Get system settings (requires `system:read`)

##### Skills & Badges
- `GET /api/skills` - List all skills
- `GET /api/badges` - List all badges

### Web Service Features

#### 🎨 Modern Dark UI
- **Beautiful dark theme** with glass morphism effects
- **Responsive design** for all devices
- **Smooth animations** with Framer Motion
- **Real-time feedback** and loading states

#### 🔗 Frontend-Backend Integration
- **API communication** with dedicated server
- **Token management** with localStorage
- **Error handling** with user-friendly messages
- **Loading states** for better UX

### Security Features

#### Authentication Security
- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Session Management**: Automatic token refresh
- **Account Lockout**: Protection against brute force
- **CSRF Protection**: Built-in Next.js protection

#### Data Security
- **SQL Injection Protection**: Prisma ORM
- **XSS Protection**: React's built-in protection
- **HTTPS Only**: In production
- **Secure Headers**: Automatic security headers
- **Rate Limiting**: API request throttling

### Monitoring

#### Render Dashboard
- **Service Health**: Monitor both API and web service status
- **Build Logs**: Review deployment process for both services
- **Runtime Logs**: Monitor application performance
- **Database Metrics**: Track database usage

#### Application Monitoring
- **API Health**: Monitor API server health
- **Error Tracking**: Monitor application errors
- **Performance**: Track response times
- **User Activity**: Monitor user interactions

### Scaling

#### Horizontal Scaling
- **Multiple Instances**: Render supports multiple instances for both services
- **Load Balancing**: Automatic load distribution
- **Database Scaling**: Upgrade database plan as needed

#### Performance Optimization
- **API Caching**: Implement Redis for API caching
- **CDN**: Use CDN for static assets
- **Database Optimization**: Query optimization and indexing
- **Image Optimization**: Next.js automatic image optimization

### Troubleshooting

**Deployment Fails**:
- Check Render logs for error messages
- Verify database connection string
- Ensure all dependencies are installed
- Check build process logs for both services

**Database Issues**:
- Check PostgreSQL service status
- Verify environment variables
- Review Prisma migration logs
- Check seed script execution

**API Server Issues**:
- Check API server logs
- Verify JWT_SECRET is set
- Test API health endpoint
- Review authentication logs

**Web Service Issues**:
- Check Next.js build logs
- Verify environment variables
- Review application logs
- Test API communication

**Authentication Issues**:
- Verify JWT_SECRET is set
- Check token storage in localStorage
- Review authentication logs
- Test with demo credentials

### Support

For deployment issues:
- Check Render documentation
- Review service logs in Render dashboard
- Verify `render.yaml` configuration
- Test locally before deployment

The SmartStart Platform is now ready for production use with a dedicated API server, comprehensive business logic, and a beautiful dark UI!
