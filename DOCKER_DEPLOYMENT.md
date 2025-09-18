# SmartStart Platform - Docker Deployment Guide

## 🐳 Complete Docker Setup

This guide will help you deploy the entire SmartStart platform locally using Docker containers.

## 📋 Prerequisites

- Docker Desktop installed and running
- Docker Compose v2.0+
- At least 4GB RAM available for Docker
- Ports 3000, 3001, 5000, 5432, 6379 available

## 🚀 Quick Start

### 1. Clone and Navigate
```bash
git clone <repository-url>
cd SmartStart
```

### 2. Start Everything
```bash
./docker-start.sh start
```

This single command will:
- Build all Docker images
- Start all services (PostgreSQL, Python Brain, Node.js Proxy, Frontend, Redis)
- Initialize the database
- Show service status

### 3. Access the Platform
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **Python Brain**: http://localhost:5000
- **PostgreSQL**: localhost:5432

## 🛠️ Available Commands

```bash
# Build all services
./docker-start.sh build

# Start all services (default)
./docker-start.sh start

# Stop all services
./docker-start.sh stop

# Restart all services
./docker-start.sh restart

# View logs
./docker-start.sh logs

# Check status
./docker-start.sh status

# Initialize database
./docker-start.sh init-db

# Run tests
./docker-start.sh test

# Clean up everything
./docker-start.sh cleanup
```

## 🏗️ Architecture

### Services Overview

1. **PostgreSQL Database** (`postgres`)
   - Port: 5432
   - Database: `smartstart_db`
   - User: `smartstart_user`
   - Password: `smartstart_password`

2. **Python Brain** (`python-brain`)
   - Port: 5000
   - Flask API with RBAC
   - Direct database connection
   - JWT authentication

3. **Node.js Proxy** (`node-proxy`)
   - Port: 3001
   - WebSocket support
   - File upload handling
   - API routing

4. **Next.js Frontend** (`frontend`)
   - Port: 3000
   - React/TypeScript
   - Alice in Wonderland theme
   - Real-time updates

5. **Redis** (`redis`)
   - Port: 6379
   - Caching and sessions
   - Real-time data

6. **Nginx** (`nginx`) - Optional
   - Port: 80/443
   - Reverse proxy
   - SSL termination

## 🔧 Configuration

### Environment Variables

The services are configured via environment variables in `docker-compose.yml`:

```yaml
# Python Brain
- DATABASE_URL=postgresql://smartstart_user:smartstart_password@postgres:5432/smartstart_db
- JWT_SECRET=your-super-secret-jwt-key-change-in-production
- CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Node.js Proxy
- PYTHON_BRAIN_URL=http://python-brain:5000
- DATABASE_URL=postgresql://smartstart_user:smartstart_password@postgres:5432/smartstart_db

# Frontend
- NEXT_PUBLIC_API_URL=http://localhost:3001
- NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

### Database Schema

The database is automatically initialized with the schema from `prisma/schema.prisma`. The Python Brain service handles all database operations directly.

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :3000
   
   # Kill the process
   kill -9 <PID>
   ```

2. **Database Connection Issues**
   ```bash
   # Check PostgreSQL logs
   docker-compose logs postgres
   
   # Restart database
   docker-compose restart postgres
   ```

3. **Build Failures**
   ```bash
   # Clean build
   ./docker-start.sh cleanup
   ./docker-start.sh build
   ```

4. **Memory Issues**
   - Increase Docker Desktop memory limit
   - Close other applications
   - Use `docker system prune` to free space

### Debugging

1. **View Service Logs**
   ```bash
   # All services
   ./docker-start.sh logs
   
   # Specific service
   docker-compose logs python-brain
   docker-compose logs frontend
   ```

2. **Access Container Shell**
   ```bash
   # Python Brain
   docker-compose exec python-brain bash
   
   # Frontend
   docker-compose exec frontend sh
   ```

3. **Database Access**
   ```bash
   # Connect to PostgreSQL
   docker-compose exec postgres psql -U smartstart_user -d smartstart_db
   ```

## 🔄 Development Workflow

### Hot Reloading

For development with hot reloading:

1. **Python Brain** - Code changes require container restart
2. **Node.js Proxy** - Code changes require container restart  
3. **Frontend** - Volume mounted, changes reflect immediately

### Making Changes

1. Edit code in your local files
2. For Python/Node changes: `docker-compose restart <service>`
3. For frontend changes: Refresh browser (hot reload)

### Database Changes

1. Update `prisma/schema.prisma`
2. Restart PostgreSQL: `docker-compose restart postgres`
3. Run migrations: `./docker-start.sh init-db`

## 📊 Monitoring

### Health Checks

All services include health checks:
- **Python Brain**: `GET /health`
- **Node.js Proxy**: `GET /health`
- **PostgreSQL**: `pg_isready`

### Resource Usage

```bash
# View resource usage
docker stats

# View disk usage
docker system df
```

## 🚀 Production Considerations

For production deployment:

1. **Security**
   - Change default passwords
   - Use strong JWT secrets
   - Enable SSL/TLS
   - Configure firewall rules

2. **Performance**
   - Increase memory limits
   - Use production-grade images
   - Configure caching strategies
   - Set up monitoring

3. **Data Persistence**
   - Use named volumes
   - Regular backups
   - Database replication

## 📝 Notes

- The platform uses a single PostgreSQL database for all services
- All services communicate via Docker network
- Redis is used for caching and real-time features
- The frontend is built with Next.js standalone output for optimal Docker performance

## 🆘 Support

If you encounter issues:

1. Check the logs: `./docker-start.sh logs`
2. Verify all services are running: `./docker-start.sh status`
3. Try a clean restart: `./docker-start.sh cleanup && ./docker-start.sh start`
4. Check Docker Desktop resources and restart if needed

---

**Happy coding with SmartStart! 🚀**
