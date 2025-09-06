# SmartStart Backend API

A comprehensive backend API server for the SmartStart platform, built with Express.js, PostgreSQL, and Prisma ORM.

## 🏗️ Architecture

- **Backend**: Express.js API server
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based with role-based access control
- **Deployment**: Production-ready on Render.com

## 🚀 Features

### Core Systems
- **User Management**: Complete user lifecycle with roles and permissions
- **Gamification**: XP, levels, badges, and reputation system
- **Legal Foundation**: Contract management and platform legal pack
- **Venture Management**: Venture lifecycle and equity distribution
- **Document System**: 14+ legal document types with templates
- **KYC/Identity Verification**: Multi-factor authentication and document upload
- **Portfolio Management**: User portfolio tracking and analytics

### API Endpoints
- **150+ API endpoints** covering all business functionality
- **JWT Authentication** with automatic token management
- **Role-based permissions** (SUPER_ADMIN → ADMIN → OWNER → CONTRIBUTOR → MEMBER → VIEWER → GUEST)
- **Comprehensive error handling** with proper HTTP status codes
- **Rate limiting** and security middleware

## 📁 Project Structure

```
SmartStart/
├── server/                 # Backend API server
│   ├── api.js             # Main API routes
│   ├── consolidated-server.js  # Production server
│   ├── routes/            # API route handlers
│   ├── services/          # Business logic services
│   ├── middleware/        # Express middleware
│   └── utils/             # Utility functions
├── prisma/                # Database schema and migrations
│   ├── schema.prisma      # Main database schema
│   ├── schema-extensions.prisma  # Extended schemas
│   └── seed.js           # Database seeding
├── package.json           # Backend dependencies
└── README.md             # This file
```

## 🛠️ Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SmartStart
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp env.example .env
   # Edit .env with your database credentials
   ```

4. **Database setup**
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

5. **Start the server**
   ```bash
   npm start
   ```

## 🔧 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with initial data
- `npm run lint` - Run ESLint

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### User Management
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Ventures
- `GET /api/ventures` - List ventures
- `POST /api/ventures` - Create venture
- `GET /api/ventures/:id` - Get venture by ID
- `PUT /api/ventures/:id` - Update venture
- `DELETE /api/ventures/:id` - Delete venture

### Gamification
- `GET /api/gamification/xp/:userId` - Get user XP
- `POST /api/gamification/xp/add` - Add XP
- `GET /api/gamification/badges/:userId` - Get user badges
- `GET /api/gamification/leaderboard` - Get leaderboard

### Legal & Contracts
- `GET /api/legal-pack/packs` - Get legal packs
- `POST /api/legal-pack/sign` - Sign legal pack
- `GET /api/legal-pack/status/:userId` - Get legal pack status

### Documents
- `GET /api/documents/templates` - Get document templates
- `GET /api/documents/templates/:id` - Get specific template
- `POST /api/documents/search` - Search documents

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🗄️ Database

The database uses PostgreSQL with Prisma ORM. Key tables include:

- **Users**: User accounts and profiles
- **Companies**: Company/venture information
- **Contracts**: Legal contracts and agreements
- **Gamification**: XP, badges, and achievements
- **Documents**: Document templates and metadata
- **Journey State**: User onboarding progress

## 🚀 Deployment

The backend is deployed on Render.com with:

- **Automatic deployments** from main branch
- **PostgreSQL database** with connection pooling
- **Environment variables** for configuration
- **Health checks** and monitoring

## 📊 Monitoring

- **Health endpoint**: `/api/simple-auth/health`
- **System status**: `/api/system-instructions/status`
- **Error logging** with proper error handling
- **Rate limiting** to prevent abuse

## 🔧 Development

### Adding New Features

1. **Database**: Update Prisma schema
2. **API Routes**: Add routes in `server/routes/`
3. **Services**: Add business logic in `server/services/`
4. **Middleware**: Add middleware in `server/middleware/`
5. **Testing**: Add tests for new functionality

### Code Style

- **ESLint** for code linting
- **TypeScript** for type safety
- **Consistent naming** conventions
- **Proper error handling**
- **Comprehensive documentation**

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For support and questions, please contact the development team.

---

**SmartStart Backend API** - Built with ❤️ by AliceSolutions

# Deployment trigger - Sat Sep  6 17:48:30 EDT 2025
