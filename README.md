# SmartStart Database Blueprint

A clean, minimal database schema and setup for the SmartStart platform using Prisma and PostgreSQL.

## 🗄️ Database Schema

This blueprint includes a complete database schema for:

- **Users & Authentication**: User profiles, authentication, and security
- **Projects**: Project management with equity distribution
- **Contributions**: Work contributions with skill tracking
- **Equity Management**: Dynamic equity allocation and governance
- **Gamification**: Skills, badges, and achievement system
- **System Settings**: Configurable platform parameters

## 🚀 Quick Start

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment**:
   ```bash
   cp env.example .env
   # Edit .env with your database URL
   ```

3. **Initialize database**:
   ```bash
   npm run setup
   ```

4. **View database** (optional):
   ```bash
   npm run db:studio
   ```

### Render Deployment

This blueprint deploys a PostgreSQL database on Render:

1. **Connect your GitHub repository** to Render
2. **Create a new Blueprint** from this repository
3. **Deploy** - Render will automatically create the database

## 📁 Project Structure

```
SmartStart/
├── prisma/
│   ├── schema.prisma     # Complete database schema
│   ├── seed.js           # Initial data seeding
│   └── migrations/       # Database migrations
├── package.json          # Minimal dependencies
├── render.yaml           # Render blueprint config
├── setup.js              # Local setup script
└── README.md             # This file
```

## 🛠️ Available Scripts

- `npm run setup` - Complete database initialization
- `npm run build` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:seed` - Seed initial data
- `npm run db:studio` - Open Prisma Studio

## 🔧 Database Features

### Core Tables
- **users** - User profiles and authentication
- **projects** - Project management
- **contributions** - Work contributions
- **equity_allocations** - Dynamic equity tracking
- **skills** - Skill definitions and categories
- **badges** - Achievement system
- **system_settings** - Platform configuration

### Key Features
- ✅ **Equity Management** - Dynamic allocation based on contributions
- ✅ **Skill Tracking** - Demand and complexity scoring
- ✅ **Gamification** - Badge and achievement system
- ✅ **Governance** - Dispute resolution and rebalancing
- ✅ **Security** - MFA and KYC requirements

## 📊 Database Schema Overview

The schema supports:
- **Multi-tenant projects** with equity distribution
- **Contribution tracking** with skill validation
- **Dynamic equity allocation** based on work value
- **Achievement system** with badges and milestones
- **Configurable settings** for platform governance

## 🎯 Use Cases

This database blueprint is perfect for:
- **Startup equity platforms**
- **Contribution-based projects**
- **Skill-based collaboration systems**
- **Gamified work environments**
- **Dynamic equity allocation systems**

## 📝 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ by AliceSolutions**
