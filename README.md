# SmartStart Platform

🚀 **Community-driven development platform with transparent equity tracking, smart contracts, and collaborative project management.**

## ✨ Features

### 🔐 Advanced Authentication & RBAC
- **JWT-based authentication** with secure session management
- **Role-Based Access Control (RBAC)** with hierarchical permissions
- **Account lockout protection** after failed login attempts
- **Multi-factor authentication** ready framework
- **Session timeout** and automatic logout

### 🎨 Modern Dark UI
- **Beautiful dark theme** with glass morphism effects
- **Responsive design** for all devices
- **Smooth animations** with Framer Motion
- **Accessible components** with proper ARIA labels
- **Real-time feedback** and loading states

### 🗄️ Comprehensive Database Schema
- **50+ models** covering all aspects of startup collaboration
- **Equity management** with cap table tracking
- **Smart contracts** and legal compliance
- **Project management** with tasks and contributions
- **Gamification** with badges and user levels
- **Cooperative governance** for startup coops

### 🔧 Technical Stack
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Prisma ORM** with PostgreSQL
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SmartStart
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your database URL and secrets
   ```

4. **Set up the database**
   ```bash
   # Create database
   createdb smartstart_local
   
   # Run migrations
   npx prisma migrate dev
   
   # Seed the database
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔑 Demo Credentials

The platform comes with pre-seeded demo accounts:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Super Admin** | admin@smartstart.com | admin123 | All permissions |
| **Regular User** | user@smartstart.com | user123 | Basic member permissions |
| **Project Owner** | owner@demo.local | owner123 | Project management |
| **Contributor** | contrib@demo.local | contrib123 | Contribution permissions |

## 🏗️ Architecture

### Database Schema Overview

```
📊 Core Models
├── User (with enhanced profile and gamification)
├── Project (with equity and contract management)
├── Task & Contribution (with effort tracking)
└── CapTableEntry (equity distribution)

🔐 Authentication & RBAC
├── Account (with security features)
├── Session (JWT token management)
├── Role (hierarchical roles)
├── Permission (granular permissions)
└── RolePermission (role-permission mapping)

📋 Project Management
├── Sprint (agile development)
├── Task (with assignment and tracking)
├── Contribution (with equity proposals)
└── ProjectMember (team management)

💰 Equity & Contracts
├── ContractOffer (smart contract offers)
├── ContractSignature (legal compliance)
├── EquityVesting (vesting schedules)
└── LegalEntity (legal structure)

🏛️ Cooperative Features
├── StartupCoop (cooperative governance)
├── CoopMember (membership management)
├── CoopGovernance (decision making)
└── LegalDocument (compliance tracking)

🎮 Gamification
├── Badge (achievement system)
├── UserBadge (earned badges)
├── Skill (skill tracking)
└── UserSkill (user expertise)
```

### RBAC Permission System

The platform implements a comprehensive permission system:

**Permission Format**: `resource:action`

**Resources**:
- `user` - User management
- `project` - Project operations
- `equity` - Equity management
- `contract` - Contract operations
- `system` - System administration

**Actions**:
- `read` - View access
- `write` - Edit access
- `delete` - Delete access
- `admin` - Full administrative access
- `sign` - Contract signing (special)

**Role Hierarchy**:
1. **SUPER_ADMIN** (Level 100) - All permissions
2. **ADMIN** (Level 80) - Administrative access
3. **OWNER** (Level 60) - Project ownership
4. **CONTRIBUTOR** (Level 40) - Active contribution
5. **MEMBER** (Level 20) - Regular membership
6. **VIEWER** (Level 10) - Read-only access
7. **GUEST** (Level 5) - Limited access

## 🌐 Deployment

### Render.com Deployment

The platform is configured for automatic deployment on Render.com:

1. **Connect to Render**
   - Go to [render.com](https://render.com)
   - Sign up/login with your GitHub account
   - Click "New +" → "Blueprint"

2. **Select Repository**
   - Choose this repository
   - Render will detect the `render.yaml` configuration

3. **Automatic Setup**
   - PostgreSQL database will be created
   - Web service will be deployed
   - Environment variables will be configured
   - Database migrations will run automatically
   - Seed data will be populated

4. **Access Your Platform**
   - Your platform will be available at: `https://smartstart-platform.onrender.com`

### Environment Variables

The following environment variables are automatically configured:

```env
DATABASE_URL=postgresql://... (from Render database)
JWT_SECRET=auto-generated-secure-secret
NEXTAUTH_SECRET=auto-generated-secure-secret
NEXTAUTH_URL=https://smartstart-platform.onrender.com
NODE_ENV=production
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user session

### Response Format
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": {
      "id": "role_id",
      "name": "MEMBER",
      "level": 20
    },
    "permissions": ["user:read", "project:read"]
  }
}
```

## 🎨 UI Components

### Design System
- **Color Palette**: Dark theme with primary blue accents
- **Typography**: Inter font family
- **Spacing**: Consistent 4px grid system
- **Animations**: Smooth transitions with Framer Motion

### Key Components
- **Glass Morphism Cards**: Semi-transparent with backdrop blur
- **Gradient Text**: Eye-catching headings
- **Interactive Buttons**: Hover effects and loading states
- **Form Elements**: Consistent styling with validation
- **Navigation**: Responsive header with user menu

## 🔒 Security Features

### Authentication Security
- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Session Management**: Automatic token refresh
- **Account Lockout**: Protection against brute force
- **CSRF Protection**: Built-in Next.js protection

### Data Security
- **SQL Injection Protection**: Prisma ORM
- **XSS Protection**: React's built-in protection
- **HTTPS Only**: In production
- **Secure Headers**: Automatic security headers

## 📊 Database Features

### Smart Computed Fields
- **Portfolio Value**: Automatic calculation from projects
- **Active Projects**: Real-time count of active memberships
- **Equity Ownership**: Total percentage across all projects
- **Completion Rates**: Task and project completion tracking

### Advanced Relationships
- **Many-to-Many**: Users ↔ Projects, Skills ↔ Users
- **Hierarchical**: Role permissions, Project ownership
- **Temporal**: Session tracking, Activity logs
- **Audit Trail**: Complete change tracking

## 🚀 Future Enhancements

### Planned Features
- **Real-time Collaboration**: WebSocket integration
- **File Management**: Document upload and sharing
- **Payment Processing**: Stripe integration
- **Email Notifications**: Automated alerts
- **Mobile App**: React Native companion app
- **API Documentation**: Swagger/OpenAPI specs

### Scalability
- **Database Optimization**: Query optimization and indexing
- **Caching**: Redis for session and data caching
- **CDN**: Static asset delivery
- **Load Balancing**: Multiple instance support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the deployment logs

---

**Built with ❤️ by AliceSolutions**
