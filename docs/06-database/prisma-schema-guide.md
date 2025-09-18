# 🗄️ Prisma Schema Guide - SmartStart Platform

## 📚 Overview

This document provides a comprehensive guide to our Prisma schema, including all models, relationships, and how to work with them in our SmartStart Platform.

**Last Updated:** September 18, 2025  
**Prisma Version:** 5.x  
**Database:** PostgreSQL 15  
**Status:** ✅ **FULLY OPERATIONAL** - Complete schema with RBAC system  

---

## 🏗️ Schema Architecture

### **Core Models (8 Primary Models)**
```prisma
model User {
  // User management and authentication
}

model Role {
  // Role-based access control
}

model Permission {
  // Granular permissions
}

model RolePermission {
  // Role-permission mappings
}

model UserRole {
  // User-role assignments
}

model JourneyStage {
  // Onboarding journey stages
}

model UserJourneyState {
  // Individual user progress
}

model BillingPlan {
  // Subscription plans
}

model Subscription {
  // User subscriptions
}
```

---

## 📊 Complete Schema Definition

### **User Model**
```prisma
model User {
  id                    String    @id @default(cuid())
  email                 String    @unique
  username              String?
  name                  String?
  firstName             String?
  lastName              String?
  password              String?   // bcrypt hashed
  role                  String    @default("MEMBER") // SUPER_ADMIN, ADMIN, MANAGER, MEMBER, GUEST
  level                 String    @default("OWLET")  // DRAGON, PHOENIX, OWLET
  status                String    @default("ACTIVE") // ACTIVE, INACTIVE, SUSPENDED
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  tenantId              String?
  xp                    Int       @default(0)
  reputation            Int       @default(0)
  lastActive            DateTime?
  totalPortfolioValue   Float     @default(0.0)
  activeProjectsCount   Int       @default(0)
  totalContributions    Int       @default(0)
  totalEquityOwned      Float     @default(0.0)
  averageEquityPerProject Float  @default(0.0)
  portfolioDiversity    Float     @default(0.0)

  // Relationships
  userRoles             UserRole[]
  journeyStates         UserJourneyState[]
  subscriptions         Subscription[]

  @@map("User")
}
```

### **Role Model**
```prisma
model Role {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relationships
  rolePermissions RolePermission[]
  userRoles       UserRole[]

  @@map("Role")
}
```

### **Permission Model**
```prisma
model Permission {
  id          String   @id @default(cuid())
  name        String   @unique
  resource    String   // user, venture, legal, system, etc.
  action      String   // read, write, delete, admin
  description String?
  createdAt   DateTime @default(now())

  // Relationships
  rolePermissions RolePermission[]

  @@map("Permission")
}
```

### **RolePermission Model**
```prisma
model RolePermission {
  id           String @id @default(cuid())
  roleId       String
  permissionId String

  // Relationships
  role       Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@unique([roleId, permissionId])
  @@map("RolePermission")
}
```

### **UserRole Model**
```prisma
model UserRole {
  id         String    @id @default(cuid())
  userId     String
  roleId     String
  assignedAt DateTime  @default(now())
  assignedBy String?

  // Relationships
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  role Role @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@unique([userId, roleId])
  @@map("UserRole")
}
```

### **JourneyStage Model**
```prisma
model JourneyStage {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  order       Int      @unique
  isRequired  Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relationships
  userJourneyStates UserJourneyState[]

  @@map("JourneyStage")
}
```

### **UserJourneyState Model**
```prisma
model UserJourneyState {
  id        String    @id @default(cuid())
  userId    String
  stageId   String
  status    String    @default("PENDING") // PENDING, IN_PROGRESS, COMPLETED, SKIPPED
  startedAt DateTime?
  completedAt DateTime?
  metadata  Json?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  // Relationships
  user  User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  stage JourneyStage @relation(fields: [stageId], references: [id], onDelete: Cascade)

  @@unique([userId, stageId])
  @@map("UserJourneyState")
}
```

### **BillingPlan Model**
```prisma
model BillingPlan {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  price       Float
  currency    String   @default("USD")
  interval    String   @default("monthly") // monthly, yearly
  buzTokens   Int      @default(0)
  features    Json?    // Array of features
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relationships
  subscriptions Subscription[]

  @@map("BillingPlan")
}
```

### **Subscription Model**
```prisma
model Subscription {
  id        String    @id @default(cuid())
  userId    String
  planId    String
  status    String    @default("ACTIVE") // ACTIVE, CANCELLED, EXPIRED, PAUSED
  startDate DateTime  @default(now())
  endDate   DateTime?
  autoRenew Boolean   @default(true)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  // Relationships
  user User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  plan BillingPlan @relation(fields: [planId], references: [id], onDelete: Cascade)

  @@map("Subscription")
}
```

---

## 🔧 Working with Prisma

### **1. Prisma Client Generation**
```bash
# Generate Prisma client
npx prisma generate

# Generate and sync with database
npx prisma db push

# Pull schema from database
npx prisma db pull
```

### **2. Database Operations**
```bash
# Open Prisma Studio (Visual Database Browser)
npx prisma studio

# Reset database (careful!)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name add_new_field

# Deploy migrations to production
npx prisma migrate deploy
```

### **3. Schema Management**
```bash
# Format schema file
npx prisma format

# Validate schema
npx prisma validate

# Introspect existing database
npx prisma db pull
```

---

## 💻 Code Examples

### **User Operations**
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Create user
const user = await prisma.user.create({
  data: {
    email: 'test@example.com',
    name: 'Test User',
    firstName: 'Test',
    lastName: 'User',
    role: 'MEMBER',
    level: 'OWLET'
  }
})

// Get user with roles
const userWithRoles = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    userRoles: {
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    }
  }
})

// Update user
const updatedUser = await prisma.user.update({
  where: { id: userId },
  data: {
    xp: 1000,
    reputation: 100
  }
})
```

### **RBAC Operations**
```typescript
// Check user permissions
const userPermissions = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    userRoles: {
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    }
  }
})

// Check if user has specific permission
const hasPermission = userPermissions?.userRoles.some(
  userRole => userRole.role.rolePermissions.some(
    rp => rp.permission.name === 'user:read'
  )
)
```

### **Journey Operations**
```typescript
// Get user journey progress
const journeyProgress = await prisma.userJourneyState.findMany({
  where: { userId },
  include: {
    stage: true
  },
  orderBy: {
    stage: { order: 'asc' }
  }
})

// Update journey stage
await prisma.userJourneyState.upsert({
  where: {
    userId_stageId: {
      userId,
      stageId: stageId
    }
  },
  update: {
    status: 'COMPLETED',
    completedAt: new Date()
  },
  create: {
    userId,
    stageId,
    status: 'COMPLETED',
    completedAt: new Date()
  }
})
```

---

## 🔐 RBAC Implementation

### **Permission Checking**
```typescript
// Check if user can perform action
async function hasPermission(userId: string, resource: string, action: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true
                }
              }
            }
          }
        }
      }
    }
  })

  if (!user) return false

  // Check for SUPER_ADMIN role
  if (user.role === 'SUPER_ADMIN') return true

  // Check specific permissions
  return user.userRoles.some(userRole =>
    userRole.role.rolePermissions.some(rp =>
      rp.permission.resource === resource && rp.permission.action === action
    )
  )
}
```

### **Role Assignment**
```typescript
// Assign role to user
async function assignRole(userId: string, roleId: string, assignedBy?: string) {
  return await prisma.userRole.create({
    data: {
      userId,
      roleId,
      assignedBy
    }
  })
}

// Remove role from user
async function removeRole(userId: string, roleId: string) {
  return await prisma.userRole.delete({
    where: {
      userId_roleId: {
        userId,
        roleId
      }
    }
  })
}
```

---

## 📊 Database Seeding

### **Seed Script Example**
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create roles
  const superAdminRole = await prisma.role.create({
    data: {
      name: 'SUPER_ADMIN',
      description: 'Full system access'
    }
  })

  // Create permissions
  const userReadPermission = await prisma.permission.create({
    data: {
      name: 'user:read',
      resource: 'user',
      action: 'read',
      description: 'Read user data'
    }
  })

  // Create role-permission mappings
  await prisma.rolePermission.create({
    data: {
      roleId: superAdminRole.id,
      permissionId: userReadPermission.id
    }
  })

  // Create journey stages
  const stages = [
    { name: 'Account Creation', order: 1, description: 'Create user account' },
    { name: 'Profile Setup', order: 2, description: 'Complete user profile' },
    { name: 'Legal Pack', order: 3, description: 'Sign legal documents' },
    { name: 'Subscription', order: 4, description: 'Choose subscription plan' },
    { name: 'Orientation', order: 5, description: 'Platform orientation' },
    { name: 'Welcome', order: 6, description: 'Welcome to platform' }
  ]

  for (const stage of stages) {
    await prisma.journeyStage.create({
      data: stage
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

---

## 🚀 Performance Optimization

### **Indexing Strategy**
```sql
-- Add indexes for performance
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_user_role ON "User"(role);
CREATE INDEX idx_user_journey_user_id ON "UserJourneyState"("userId");
CREATE INDEX idx_user_journey_stage_id ON "UserJourneyState"("stageId");
CREATE INDEX idx_subscription_user_id ON "Subscription"("userId");
CREATE INDEX idx_subscription_status ON "Subscription"(status);
```

### **Query Optimization**
```typescript
// Use select to limit fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true,
    role: true
  }
})

// Use pagination
const users = await prisma.user.findMany({
  skip: 0,
  take: 20,
  orderBy: {
    createdAt: 'desc'
  }
})
```

---

## 🔧 Troubleshooting

### **Common Issues**

#### **1. Connection Issues**
```bash
# Check database connection
npx prisma db pull

# Reset connection
npx prisma generate
```

#### **2. Schema Sync Issues**
```bash
# Force sync with database
npx prisma db push --force-reset

# Pull schema from database
npx prisma db pull
```

#### **3. Migration Issues**
```bash
# Reset migrations
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name fix_schema
```

---

## 📚 Related Documentation

- **Current Database Status:** `docs/06-database/current-database-status.md`
- **Database Architecture:** `docs/02-architecture/database-architecture.md`
- **API Reference:** `docs/05-api/api-reference.md`
- **RBAC Guide:** `docs/07-security/security-overview.md`

---

**🎉 This Prisma schema is fully operational and ready for development!**

**Last Updated:** September 18, 2025  
**Maintained by:** Udi Shkolnik  
**Status:** ✅ Production Ready
