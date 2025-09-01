# SmartStart Database

A clean, production-ready database schema for the SmartStart platform with comprehensive equity management, governance, and compliance features.

## Features

- **Complete Equity Management**: Cap table tracking, vesting schedules, BUZ token system
- **Governance & Compliance**: Legal entities, cooperative structures, dispute resolution
- **Smart Contracts**: Automated contract offers, signatures, and legal compliance
- **Gamification**: Skills, badges, reputation system, and community insights
- **Security**: KYC/KYB integration, device posture, audit logging
- **Analytics**: Real-time portfolio tracking and performance metrics

## Database Schema

The schema includes 50+ models covering:

- **Core Entities**: Users, Projects, Tasks, Contributions
- **Equity System**: Cap tables, vesting, BUZ transactions, conversions
- **Legal & Compliance**: Contracts, legal entities, cooperative governance
- **Community**: Mesh items, polls, ideas, kudos system
- **Security**: Audit logs, device posture, KYC/KYB documents
- **Analytics**: Portfolio tracking, performance metrics, insights

## Quick Start

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

3. **Set up database**:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

4. **View database** (optional):
   ```bash
   npx prisma studio
   ```

### Production Deployment

The project is configured for deployment on Render with:

- **Database**: PostgreSQL with automatic migrations
- **Environment**: Production-ready with all security settings
- **Seeding**: Automatic initial data population

## Key Business Rules

- **Owner Minimum**: 35% equity required for project owners
- **Alice Cap**: Maximum 25% equity for AliceSolutions
- **Contribution Range**: 0.5% - 5.0% equity per contribution
- **KYC Required**: For equity participation and legal compliance
- **Audit Trail**: Immutable audit logs for all equity transactions

## Schema Highlights

### Equity Management
- Dynamic cap table with real-time updates
- Vesting schedules (immediate, monthly, quarterly, milestone-based)
- BUZ token system for contribution tracking
- Quarterly equity rebalancing based on performance

### Legal Compliance
- Contract offer/acceptance workflow
- Legal entity management (corporations, cooperatives, LLCs)
- KYC/KYB document verification
- Dispute resolution system

### Community Features
- Skill-based matching and verification
- Badge system with rarity levels
- Community insights and analytics
- Mesh network for collaboration

## Environment Variables

Required environment variables:

```env
DATABASE_URL="postgresql://username:password@host:port/database"
NODE_ENV="production"
```

## Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio

# Reset database
npm run db:reset
```

## Production Deployment

This repository is configured for automatic deployment on Render:

1. Connect your GitHub repository to Render
2. Render will automatically:
   - Create a PostgreSQL database
   - Deploy the database service
   - Run migrations and seed data
   - Set up all environment variables

The deployment includes:
- Automatic database migrations
- Initial data seeding
- Production security settings
- Health monitoring

## License

MIT License - see LICENSE file for details.
