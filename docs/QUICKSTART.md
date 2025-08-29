# SmartStart Quick Start Guide 🚀

> **Get SmartStart running in 5 minutes!**

This guide will help you get SmartStart up and running locally for development and testing.

## 🎯 **What You'll Get**

By the end of this guide, you'll have:
- ✅ **SmartStart Web App** running on http://localhost:3000
- ✅ **SmartStart API** running on http://localhost:3001
- ✅ **PostgreSQL Database** with sample data
- ✅ **Demo accounts** ready for testing
- ✅ **Complete platform** with all features working

## 🛠️ **Prerequisites**

### **Required Software**
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **pnpm 8+** - Install with `npm install -g pnpm`
- **PostgreSQL 15+** - [Download here](https://www.postgresql.org/download/)

### **System Requirements**
- **RAM**: 4GB+ available
- **Storage**: 2GB+ free space
- **OS**: macOS, Windows, or Linux

## 🚀 **Quick Start (5 Minutes)**

### **1. Clone & Install**
```bash
# Clone the repository
git clone <your-repo-url>
cd SmartStart

# Install all dependencies
pnpm install
```

### **2. Database Setup**
```bash
# Create PostgreSQL database
createdb smartstart_dev

# Copy environment file
cp env.example .env

# Edit .env with your database credentials
# DATABASE_URL=postgresql://username:password@localhost:5432/smartstart_dev
```

### **3. Initialize Database**
```bash
# Navigate to API directory
cd apps/api

# Run database migrations
pnpm prisma migrate dev

# Seed with sample data
pnpm prisma db seed
```

### **4. Start Development Servers**
```bash
# Terminal 1 - Start API Server
cd apps/api
pnpm dev
# API will be available at http://localhost:3001

# Terminal 2 - Start Web Server
cd apps/web
pnpm dev
# Web app will be available at http://localhost:3000
```

### **5. Access SmartStart**
- 🌐 **Web App**: http://localhost:3000
- 🔌 **API**: http://localhost:3001
- 📊 **Database**: localhost:5432

## 🔐 **Demo Accounts**

Use these accounts to test different user roles:

| Email | Password | Role | Access Level |
|-------|----------|------|--------------|
| `admin@smartstart.com` | `admin123` | ADMIN | Full system access |
| `owner@demo.local` | `owner123` | OWNER | Project management |
| `contrib@demo.local` | `contrib123` | CONTRIBUTOR | Limited access |

## 🎨 **Explore the Platform**

### **🏠 Dashboard & Navigation**
- **Header**: SmartStart branding and system status
- **Sidebar**: Navigation between all platform sections
- **User Info**: Your role and account information

### **📊 Portfolio Management**
- **Your Portfolio**: View your project ownership and contributions
- **Project Stats**: Performance metrics and equity distribution
- **Activity Timeline**: Recent contributions and updates

### **🗳️ Community Polls**
- **Active Polls**: Vote on community decisions
- **Create Polls**: Start new community discussions
- **Vote History**: Track your participation

### **💬 Team Communication**
- **Channels**: Join project and community discussions
- **Real-time Chat**: Instant messaging with team members
- **Message Reactions**: React to important messages

### **👥 Community Members**
- **Member Directory**: Browse community profiles
- **Skills & Expertise**: Find team members for projects
- **Portfolio Values**: See community contributions

### **💡 Innovation Hub**
- **Submit Ideas**: Share your vision with the community
- **Vote on Ideas**: Support promising concepts
- **Track Progress**: Monitor idea development

### **⚙️ Admin Dashboard** (Admin users only)
- **RBAC Overview**: System roles and permissions
- **User Management**: Manage community members
- **System Statistics**: Platform usage metrics

## 🔧 **Development Workflow**

### **Making Changes**
```bash
# The platform uses hot reloading
# Changes to frontend files will automatically refresh the browser
# Changes to backend files will restart the API server
```

### **Database Changes**
```bash
# After modifying Prisma schema
cd apps/api
pnpm prisma generate
pnpm prisma migrate dev --name your_migration_name
```

### **Adding New Features**
1. **Frontend**: Add new pages in `apps/web/app/`
2. **Backend**: Add new endpoints in `apps/api/src/`
3. **Database**: Update schema in `prisma/schema.prisma`
4. **Styling**: Add CSS in `apps/web/app/styles/`

## 🧪 **Testing Features**

### **Authentication Flow**
1. Visit http://localhost:3000
2. You'll be redirected to login
3. Use demo account credentials
4. Access your role-appropriate dashboard

### **Community Features**
1. **Create a Poll**: Test community decision-making
2. **Submit an Idea**: Test innovation hub workflow
3. **Send Messages**: Test team communication
4. **Browse Members**: Test community directory

### **Portfolio Features**
1. **View Portfolio**: See your project ownership
2. **Project Details**: Explore project information
3. **Contribution History**: Track your work

## 🐛 **Troubleshooting**

### **Common Issues**

#### **Port Already in Use**
```bash
# Kill existing processes
pkill -f "tsx watch"  # API server
pkill -f "next dev"    # Web server

# Or use different ports
cd apps/api && pnpm dev --port 3002
cd apps/web && pnpm dev --port 3001
```

#### **Database Connection Issues**
```bash
# Check PostgreSQL is running
brew services list | grep postgresql  # macOS
sudo systemctl status postgresql      # Linux

# Test connection
psql -h localhost -U username -d smartstart_dev
```

#### **Dependencies Issues**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
pnpm install

# Clear Next.js cache
cd apps/web
rm -rf .next
pnpm dev
```

### **Getting Help**
- **Check logs** in terminal output
- **Verify environment variables** in `.env` file
- **Ensure database is running** and accessible
- **Check port availability** for both servers

## 📚 **Next Steps**

### **Learn More**
- **API Documentation**: See `docs/API_DOCS.md`
- **RBAC System**: See `docs/RBAC_SYSTEM.md`
- **Deployment**: See `docs/DEPLOYMENT.md`

### **Customize Platform**
- **Branding**: Update colors and logos in CSS variables
- **Features**: Add new functionality to the platform
- **Styling**: Customize the design system
- **Database**: Extend the data model

### **Deploy to Production**
- **Environment Setup**: Configure production database and secrets
- **Build Process**: Create optimized production builds
- **Deployment**: Deploy to your preferred hosting platform
- **Monitoring**: Set up logging and performance monitoring

## 🎉 **You're Ready!**

Congratulations! You now have a fully functional SmartStart platform running locally. The system includes:

- ✅ **Complete authentication** with role-based access
- ✅ **Professional UI** with SmartStart branding
- ✅ **All core features** working and tested
- ✅ **Sample data** for immediate exploration
- ✅ **Development environment** ready for customization

**Start building your community-driven future with SmartStart! 🚀**

---

**Need help?** Check the documentation or reach out to the SmartStart team.

*Built with ❤️ by AliceSolutions Ventures*
