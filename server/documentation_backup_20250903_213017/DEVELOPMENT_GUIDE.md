# 🛠️ Development Guide - SmartStart Platform

## 📚 Overview

This guide provides comprehensive instructions for setting up and developing the SmartStart Platform locally. It covers environment setup, coding standards, testing, and contribution guidelines.

## 🚀 Quick Start

### Prerequisites
- **Node.js**: 18.0.0 or higher
- **PostgreSQL**: 14.0 or higher
- **Git**: Latest version
- **npm**: 8.0.0 or higher

### 1. Clone the Repository
```bash
git clone <repository-url>
cd SmartStart
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
# Copy environment template
cp env.example .env.local

# Edit .env.local with your local values
nano .env.local
```

### 4. Database Setup
```bash
# Create local database
createdb smartstart_local

# Run database migrations
npx prisma migrate dev

# Seed the database
npm run db:seed
```

### 5. Start Development Servers
```bash
# Terminal 1: Frontend development
npm run dev

# Terminal 2: Backend development
npm run dev:api

# Terminal 3: Database studio (optional)
npm run db:studio
```

### 6. Access Your Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Database Studio**: http://localhost:5555

## 🏗️ Project Structure

### Directory Layout
```
SmartStart/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Authentication routes
│   ├── dashboard/               # User dashboard
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── components/                   # Reusable UI components
│   ├── ui/                      # Base UI components
│   ├── forms/                   # Form components
│   └── layout/                  # Layout components
├── lib/                         # Utility libraries
│   ├── auth.ts                  # Authentication logic
│   └── utils.ts                 # Helper functions
├── prisma/                      # Database schema and migrations
│   ├── migrations/              # Database migrations
│   ├── schema.prisma            # Prisma schema
│   └── seed.js                  # Database seeding
├── server/                      # Backend server files
│   ├── api.js                   # Main API server
│   ├── consolidated-server.js   # Consolidated backend
│   ├── worker.js                # Background worker
│   ├── storage.js               # File storage service
│   └── monitor.js               # Monitoring service
├── scripts/                     # Utility scripts
│   ├── deploy-status.js         # Deployment monitoring
│   └── deploy-free-tier.js      # Free tier verification
├── documentation/               # Project documentation
├── render.yaml                  # Render.com deployment config
├── package.json                 # Dependencies and scripts
└── tailwind.config.js           # Tailwind CSS configuration
```

## 🔧 Development Environment

### Environment Variables
```bash
# .env.local
DATABASE_URL="postgresql://username:password@localhost:5432/smartstart_local"
JWT_SECRET="your-super-secret-jwt-key-here"
NEXTAUTH_SECRET="your-nextauth-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
API_PORT=3001
NODE_ENV="development"
NEXT_PUBLIC_API_URL="http://localhost:3001"

# Optional services (can be empty for local development)
WORKER_ENABLED="false"
STORAGE_ENABLED="false"
MONITOR_ENABLED="false"
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
SMTP_USER=""
SMTP_PASS=""
```

### Database Configuration
```bash
# PostgreSQL connection
DATABASE_URL="postgresql://username:password@localhost:5432/smartstart_local"

# Alternative: Use Docker for PostgreSQL
docker run --name smartstart-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=smartstart_local \
  -p 5432:5432 \
  -d postgres:14
```

## 🎨 Frontend Development

### Component Development
```typescript
// components/ui/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
          {
            'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'default',
            'bg-destructive text-destructive-foreground hover:bg-destructive/90': variant === 'destructive',
            'border border-input hover:bg-accent hover:text-accent-foreground': variant === 'outline',
            'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
            'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
            'underline-offset-4 hover:underline text-primary': variant === 'link',
          },
          {
            'h-10 py-2 px-4': size === 'default',
            'h-9 px-3': size === 'sm',
            'h-11 px-8': size === 'lg',
            'h-10 w-10': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
```

### Page Development
```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
```

### API Integration
```typescript
// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class ApiClient {
  private baseUrl: string;
  private token?: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // User endpoints
  async getCurrentUser() {
    return this.request<{ user: User }>('/api/auth/me');
  }

  async updateProfile(data: Partial<User>) {
    return this.request<User>('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Venture endpoints
  async getVentures() {
    return this.request<{ ventures: Venture[] }>('/api/ventures');
  }

  async createVenture(data: CreateVentureData) {
    return this.request<Venture>('/api/ventures', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient();
```

## 🔌 Backend Development

### API Endpoint Development
```typescript
// server/api.js - Example endpoint
app.post('/api/ventures', authenticateToken, async (req, res) => {
  try {
    const { name, description, region } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!name || !description || !region) {
      return res.status(400).json({
        error: 'Missing required fields: name, description, region'
      });
    }

    // Check if user can create ventures
    if (!req.permissions.includes('venture:create')) {
      return res.status(403).json({
        error: 'Insufficient permissions to create ventures'
      });
    }

    // Create venture
    const venture = await prisma.venture.create({
      data: {
        name,
        description,
        region,
        owner_user_id: userId,
        status: 'draft'
      },
      include: {
        owner: {
          select: {
            id: true,
            display_name: true,
            email: true
          }
        }
      }
    });

    // Log the action
    logger.info(`Venture created: ${venture.id} by user: ${userId}`);

    res.status(201).json({
      success: true,
      venture
    });

  } catch (error) {
    logger.error('Error creating venture:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});
```

### Middleware Development
```typescript
// Custom middleware example
const validateVentureAccess = (ventureIdParam: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ventureId = req.params[ventureIdParam];
      const userId = req.user.id;

      // Check if user has access to this venture
      const roleAssignment = await prisma.roleAssignment.findFirst({
        where: {
          user_id: userId,
          venture_id: ventureId,
          revoked_at: null
        }
      });

      if (!roleAssignment) {
        return res.status(403).json({
          error: 'Access denied to this venture'
        });
      }

      // Add venture context to request
      req.venture = { id: ventureId, role: roleAssignment.role };
      next();

    } catch (error) {
      logger.error('Error validating venture access:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  };
};

// Usage
app.get('/api/ventures/:ventureId/tasks', 
  authenticateToken, 
  validateVentureAccess('ventureId'),
  async (req, res) => {
    // Endpoint logic here
  }
);
```

### Background Job Processing
```typescript
// server/worker.js - Example job processor
const processEmailQueue = async (job) => {
  try {
    const { to, subject, text, html, ventureId } = job.data;
    
    // Send email
    const result = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      text,
      html
    });

    // Log success
    logger.info(`Email sent successfully to ${to}`, {
      messageId: result.messageId,
      ventureId
    });

    // Update database if needed
    await prisma.emailLog.create({
      data: {
        venture_id: ventureId,
        recipient: to,
        subject,
        message_id: result.messageId,
        status: 'sent'
      }
    });

  } catch (error) {
    logger.error('Error processing email job:', error);
    
    // Retry logic
    if (job.attemptsMade < 3) {
      throw error; // Will retry
    } else {
      // Mark as failed after max attempts
      await prisma.emailLog.create({
        data: {
          venture_id: job.data.ventureId,
          recipient: job.data.to,
          subject: job.data.subject,
          status: 'failed',
          error_message: error.message
        }
      });
    }
  }
};

// Register job processor
emailQueue.process('send-email', processEmailQueue);
```

## 🗄️ Database Development

### Prisma Schema Development
```prisma
// prisma/schema.prisma
model User {
  id            String   @id @default(cuid())
  display_name  String   @db.VarChar(80)
  email         String   @unique @db.VarChar(255)
  kyc_status    KycStatus @default(PENDING)
  trust_score   Decimal  @default(50.00) @db.Decimal(5,2)
  country_code  String?  @db.Char(2)
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt

  // Relations
  ventures      Venture[] @relation("VentureOwner")
  role_assignments RoleAssignment[]
  user_wallet   UserWallet?
  kyc_documents KycDocument[]
  
  // Indexes
  @@index([email])
  @@index([kyc_status])
  @@index([trust_score])
}

model Venture {
  id                String   @id @default(cuid())
  name              String   @unique @db.VarChar(255)
  description       String?  @db.Text
  region            Region
  status            VentureStatus @default(DRAFT)
  owner_user_id     String
  alice_equity_cap  Decimal  @default(20.000) @db.Decimal(6,3)
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt

  // Relations
  owner             User     @relation("VentureOwner", fields: [owner_user_id], references: [id])
  equity_ledger     EquityLedger[]
  role_assignments  RoleAssignment[]
  tasks             Task[]
  contracts         Contract[]
  
  // Indexes
  @@index([owner_user_id])
  @@index([status])
  @@index([region])
}

enum KycStatus {
  PENDING
  VERIFIED
  REJECTED
}

enum VentureStatus {
  DRAFT
  ACTIVE
  SUSPENDED
  ARCHIVED
}

enum Region {
  CA
  US
  EU
  ASIA
  OTHER
}
```

### Database Migrations
```bash
# Create a new migration
npx prisma migrate dev --name add_user_skills

# Apply migrations to production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate
```

### Database Seeding
```typescript
// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create skills
  const skills = await Promise.all([
    prisma.skill.upsert({
      where: { slug: 'nodejs' },
      update: {},
      create: {
        slug: 'nodejs',
        name: 'Node.js',
        category: 'ENGINEERING'
      }
    }),
    prisma.skill.upsert({
      where: { slug: 'react' },
      update: {},
      create: {
        slug: 'react',
        name: 'React',
        category: 'ENGINEERING'
      }
    }),
    // Add more skills...
  ]);

  // Create demo users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@smartstart.com' },
    update: {},
    create: {
      display_name: 'System Administrator',
      email: 'admin@smartstart.com',
      kyc_status: 'VERIFIED',
      trust_score: 100.00,
      country_code: 'US'
    }
  });

  // Create demo venture
  const demoVenture = await prisma.venture.create({
    data: {
      name: 'Demo Venture',
      description: 'A demonstration venture for testing purposes',
      region: 'US',
      owner_user_id: adminUser.id,
      status: 'ACTIVE'
    }
  });

  console.log('✅ Database seeding completed!');
  console.log(`Created ${skills.length} skills`);
  console.log(`Created user: ${adminUser.display_name}`);
  console.log(`Created venture: ${demoVenture.name}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## 🧪 Testing

### Unit Testing Setup
```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Component Testing
```typescript
// __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant classes correctly', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByText('Delete');
    
    expect(button).toHaveClass('bg-destructive');
  });
});
```

### API Testing
```typescript
// __tests__/api/ventures.test.ts
import request from 'supertest';
import { app } from '@/server/app';
import { prisma } from '@/lib/prisma';

describe('Ventures API', () => {
  let authToken: string;
  let testUser: any;

  beforeAll(async () => {
    // Create test user and get auth token
    testUser = await prisma.user.create({
      data: {
        display_name: 'Test User',
        email: 'test@example.com',
        kyc_status: 'VERIFIED'
      }
    });
    
    // Generate JWT token for testing
    authToken = generateTestToken(testUser.id);
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.user.delete({ where: { id: testUser.id } });
  });

  describe('POST /api/ventures', () => {
    it('creates a new venture with valid data', async () => {
      const ventureData = {
        name: 'Test Venture',
        description: 'A test venture',
        region: 'US'
      };

      const response = await request(app)
        .post('/api/ventures')
        .set('Authorization', `Bearer ${authToken}`)
        .send(ventureData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.venture.name).toBe(ventureData.name);
    });

    it('rejects request without authentication', async () => {
      const response = await request(app)
        .post('/api/ventures')
        .send({ name: 'Test' })
        .expect(401);

      expect(response.body.error).toBe('Access token required');
    });
  });
});
```

## 📝 Coding Standards

### TypeScript Guidelines
```typescript
// Use strict typing
interface UserProfile {
  id: string;
  display_name: string;
  email: string;
  kyc_status: 'pending' | 'verified' | 'rejected';
  trust_score: number;
}

// Prefer interfaces over types for objects
interface CreateVentureRequest {
  name: string;
  description?: string;
  region: Region;
}

// Use enums for constants
enum VentureStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  ARCHIVED = 'archived'
}

// Generic types for reusable components
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
}
```

### React Best Practices
```typescript
// Use custom hooks for logic
const useVentures = () => {
  const [ventures, setVentures] = useState<Venture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVentures = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getVentures();
        setVentures(response.ventures);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch ventures');
      } finally {
        setLoading(false);
      }
    };

    fetchVentures();
  }, []);

  return { ventures, loading, error };
};

// Use React.memo for expensive components
const VentureCard = React.memo(({ venture }: { venture: Venture }) => {
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">{venture.name}</h3>
      <p className="text-gray-600">{venture.description}</p>
    </div>
  );
});
```

### Error Handling
```typescript
// Consistent error handling
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center">
          <h2 className="text-xl font-bold text-red-600">Something went wrong</h2>
          <p className="text-gray-600 mt-2">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## 🔍 Debugging

### Frontend Debugging
```typescript
// Use React DevTools
// Install React Developer Tools browser extension

// Debug component state
const [debug, setDebug] = useState(false);

useEffect(() => {
  if (debug) {
    console.log('Component state:', { ventures, loading, error });
  }
}, [debug, ventures, loading, error]);

// Debug API calls
const apiClient = new ApiClient();
apiClient.setDebug(true); // Log all API requests
```

### Backend Debugging
```typescript
// Enhanced logging
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Request logging middleware
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });
  next();
});
```

### Database Debugging
```bash
# Enable Prisma query logging
# Add to .env.local
DEBUG="prisma:query"

# Use Prisma Studio for visual database inspection
npm run db:studio

# Check database connection
npx prisma db pull

# Validate schema
npx prisma validate
```

## 🚀 Performance Optimization

### Frontend Optimization
```typescript
// Lazy loading components
const LazyVentureList = lazy(() => import('./VentureList'));

// Memoize expensive calculations
const totalEquity = useMemo(() => {
  return ventures.reduce((sum, venture) => sum + venture.equity_percentage, 0);
}, [ventures]);

// Optimize re-renders
const handleVentureUpdate = useCallback((ventureId: string, updates: Partial<Venture>) => {
  setVentures(prev => prev.map(v => 
    v.id === ventureId ? { ...v, ...updates } : v
  ));
}, []);
```

### Backend Optimization
```typescript
// Database query optimization
const getVenturesWithDetails = async (userId: string) => {
  return prisma.venture.findMany({
    where: {
      OR: [
        { owner_user_id: userId },
        { role_assignments: { some: { user_id: userId, revoked_at: null } } }
      ]
    },
    include: {
      owner: { select: { id: true, display_name: true } },
      equity_ledger: {
        where: { effective_to: null },
        select: { holder_type: true, percent: true }
      },
      _count: { select: { tasks: true, contracts: true } }
    }
  });
};

// Caching strategy
const ventureCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCachedVenture = async (ventureId: string) => {
  const cached = ventureCache.get(ventureId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const venture = await prisma.venture.findUnique({
    where: { id: ventureId },
    include: { owner: true, equity_ledger: true }
  });

  ventureCache.set(ventureId, {
    data: venture,
    timestamp: Date.now()
  });

  return venture;
};
```

## 📚 Documentation

### Code Documentation
```typescript
/**
 * Creates a new venture with the specified details
 * @param data - Venture creation data
 * @param userId - ID of the user creating the venture
 * @returns Promise resolving to the created venture
 * @throws {ApiError} If validation fails or user lacks permissions
 * 
 * @example
 * ```typescript
 * const venture = await createVenture({
 *   name: 'My Startup',
 *   description: 'A revolutionary platform',
 *   region: 'US'
 * }, 'user-123');
 * ```
 */
async function createVenture(
  data: CreateVentureData, 
  userId: string
): Promise<Venture> {
  // Implementation...
}
```

### API Documentation
```typescript
/**
 * @api {post} /api/ventures Create Venture
 * @apiName CreateVenture
 * @apiGroup Ventures
 * @apiVersion 1.0.0
 * 
 * @apiHeader {String} Authorization Bearer token for authentication
 * 
 * @apiBody {String} name Venture name (required)
 * @apiBody {String} [description] Venture description
 * @apiBody {String} region Venture region (CA|US|EU|ASIA|OTHER)
 * 
 * @apiSuccess {Boolean} success Success indicator
 * @apiSuccess {Object} venture Created venture object
 * 
 * @apiError {String} error Error message
 * @apiError {Number} status HTTP status code
 */
```

## 🤝 Contributing

### Pull Request Process
1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** following coding standards
4. **Add tests** for new functionality
5. **Update documentation** as needed
6. **Commit your changes**: `git commit -m 'Add amazing feature'`
7. **Push to the branch**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

### Commit Message Format
```
type(scope): description

feat(auth): add multi-factor authentication
fix(api): resolve venture creation validation issue
docs(readme): update installation instructions
style(ui): improve button component styling
refactor(database): optimize equity calculation queries
test(api): add comprehensive venture API tests
```

### Code Review Checklist
- [ ] Code follows project style guidelines
- [ ] Tests pass and cover new functionality
- [ ] Documentation is updated
- [ ] No console.log statements in production code
- [ ] Error handling is comprehensive
- [ ] Performance considerations addressed
- [ ] Security implications reviewed

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check PostgreSQL status
brew services list | grep postgresql

# Restart PostgreSQL
brew services restart postgresql

# Check connection
psql -h localhost -U username -d smartstart_local
```

#### Port Conflicts
```bash
# Check what's using port 3000
lsof -i :3000

# Kill process using port
kill -9 <PID>

# Use different port
PORT=3001 npm run dev
```

#### Dependency Issues
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for outdated packages
npm outdated
```

#### Prisma Issues
```bash
# Reset Prisma
npx prisma migrate reset
npx prisma generate

# Check Prisma status
npx prisma status

# Validate schema
npx prisma validate
```

## 📞 Getting Help

### Resources
- **Documentation**: Check this guide and other docs in `/documentation`
- **Issues**: Create an issue on GitHub for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Code Review**: Request code review from maintainers

### Support Channels
- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and community support
- **Email**: For security issues or private matters

---

**Happy coding! Remember to follow the coding standards and contribute to making SmartStart Platform even better!** 🚀
