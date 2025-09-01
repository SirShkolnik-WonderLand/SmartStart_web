# 🔧 Troubleshooting Guide - SmartStart Platform

## 📚 Overview

This guide provides solutions for common issues you may encounter while developing, deploying, or using the SmartStart Platform. Each section includes problem descriptions, diagnostic steps, and solutions.

## 🚀 Quick Diagnosis

### Health Check Commands
```bash
# Check deployment status
npm run deploy:check

# Check API health
curl https://your-api.onrender.com/api/health

# Check platform status
curl https://your-platform.onrender.com/

# Check deployment status
npm run deploy:status
```

## 🔍 Common Issues by Category

### 1. Development Environment Issues

#### Problem: Node.js Version Incompatibility
**Symptoms:**
- Build failures with version errors
- Package installation issues
- Runtime errors

**Diagnosis:**
```bash
# Check Node.js version
node --version

# Check npm version
npm --version
```

**Solution:**
```bash
# Install correct Node.js version (18+)
nvm install 18
nvm use 18

# Or use npx to run with specific version
npx node@18 --version
```

#### Problem: Database Connection Issues
**Symptoms:**
- Prisma connection errors
- Database timeout errors
- Migration failures

**Diagnosis:**
```bash
# Check PostgreSQL status
brew services list | grep postgresql

# Test connection
psql -h localhost -U username -d smartstart_local

# Check Prisma status
npx prisma status
```

**Solution:**
```bash
# Restart PostgreSQL
brew services restart postgresql

# Reset Prisma
npx prisma migrate reset
npx prisma generate

# Check environment variables
cat .env.local | grep DATABASE_URL
```

#### Problem: Port Conflicts
**Symptoms:**
- "Port already in use" errors
- Services won't start
- Connection refused errors

**Diagnosis:**
```bash
# Check what's using port 3000
lsof -i :3000

# Check what's using port 3001
lsof -i :3001
```

**Solution:**
```bash
# Kill process using port
kill -9 <PID>

# Use different ports
PORT=3002 npm run dev
API_PORT=3003 npm run dev:api
```

### 2. Build & Deployment Issues

#### Problem: Build Failures
**Symptoms:**
- Render.com build errors
- Missing dependencies
- Prisma generation failures

**Diagnosis:**
```bash
# Test build locally
npm run build

# Check dependencies
npm ls --depth=0

# Verify Prisma setup
npx prisma generate
```

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma client
npx prisma generate
```

#### Problem: Environment Variable Issues
**Symptoms:**
- Configuration errors
- Missing API keys
- Database connection failures

**Diagnosis:**
```bash
# Check environment file
ls -la .env*

# Verify required variables
grep -E "^(DATABASE_URL|JWT_SECRET|NEXTAUTH_SECRET)" .env.local
```

**Solution:**
```bash
# Copy example file
cp env.example .env.local

# Edit with your values
nano .env.local

# Verify in Render.com dashboard
# Go to your service → Environment → Verify all required variables
```

#### Problem: Database Migration Failures
**Symptoms:**
- Migration errors during deployment
- Schema mismatch errors
- Data corruption warnings

**Diagnosis:**
```bash
# Check migration status
npx prisma migrate status

# Validate schema
npx prisma validate

# Check database connection
npx prisma db pull
```

**Solution:**
```bash
# Reset migrations (development only)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name fix_schema

# Deploy migrations
npx prisma migrate deploy
```

### 3. Runtime Issues

#### Problem: Service Won't Start
**Symptoms:**
- Service shows "failed" status
- No response from endpoints
- Error logs in Render dashboard

**Diagnosis:**
```bash
# Check service logs in Render dashboard
# Go to your service → Logs tab

# Check health endpoint
curl https://your-service.onrender.com/api/health

# Verify environment variables
# Check Render dashboard → Environment
```

**Solution:**
```bash
# Common fixes:
# 1. Verify DATABASE_URL is correct
# 2. Check JWT_SECRET is set
# 3. Ensure all required variables are present
# 4. Verify database is accessible
# 5. Check service logs for specific errors
```

#### Problem: Memory Issues
**Symptoms:**
- Service crashes
- Slow performance
- "Out of memory" errors

**Diagnosis:**
```bash
# Check memory usage in logs
# Look for memory warnings

# Monitor service metrics in Render dashboard
# Check memory usage graphs
```

**Solution:**
```bash
# Optimize memory usage:
# 1. Implement memory cleanup in code
# 2. Reduce concurrent operations
# 3. Optimize database queries
# 4. Consider upgrading from free tier
```

#### Problem: Cold Start Delays
**Symptoms:**
- First request after inactivity is slow (10-30 seconds)
- Service appears unresponsive initially
- Inconsistent response times

**Diagnosis:**
```bash
# Test cold start timing
# Wait 15+ minutes, then make a request
# Measure response time

# Check service logs for startup messages
```

**Solution:**
```bash
# Implement proper loading states in frontend
# Use progressive loading
# Cache frequently accessed data
# Consider paid tier for faster response times
```

### 4. API & Integration Issues

#### Problem: Authentication Failures
**Symptoms:**
- 401 Unauthorized errors
- JWT token validation failures
- Login not working

**Diagnosis:**
```bash
# Check JWT_SECRET is set
echo $JWT_SECRET

# Verify token format
# Should be: Bearer <token>

# Check token expiration
# Decode JWT at jwt.io
```

**Solution:**
```bash
# Regenerate JWT secret in Render dashboard
# Clear browser cookies/local storage
# Verify token is being sent in headers
# Check CORS configuration
```

#### Problem: CORS Issues
**Symptoms:**
- Browser console CORS errors
- API requests blocked
- Preflight request failures

**Diagnosis:**
```bash
# Check browser console for CORS errors
# Verify origin configuration
# Test with different origins
```

**Solution:**
```bash
# Update CORS configuration in server
# Verify allowed origins in render.yaml
# Check environment-specific CORS settings
```

#### Problem: Rate Limiting
**Symptoms:**
- 429 Too Many Requests errors
- API calls suddenly failing
- Rate limit headers in responses

**Diagnosis:**
```bash
# Check rate limit headers
curl -I https://your-api.onrender.com/api/endpoint

# Monitor request frequency
# Check for rapid successive calls
```

**Solution:**
```bash
# Implement request throttling
# Add retry logic with exponential backoff
# Cache responses to reduce API calls
# Monitor and optimize request patterns
```

### 5. Database Issues

#### Problem: Connection Pool Exhaustion
**Symptoms:**
- Database connection timeouts
- "Too many connections" errors
- Slow database queries

**Diagnosis:**
```bash
# Check connection count
# Monitor database metrics
# Look for connection leaks in code
```

**Solution:**
```bash
# Optimize connection pooling
# Close connections properly
# Implement connection limits
# Use connection pooling libraries
```

#### Problem: Query Performance Issues
**Symptoms:**
- Slow API responses
- Database timeouts
- High memory usage

**Diagnosis:**
```bash
# Enable query logging
# Add DEBUG="prisma:query" to .env.local

# Analyze slow queries
# Check database indexes
```

**Solution:**
```bash
# Optimize database queries
# Add proper indexes
# Implement query caching
# Use database connection pooling
```

### 6. File & Storage Issues

#### Problem: File Upload Failures
**Symptoms:**
- Upload errors
- File size limitations
- Storage service unavailable

**Diagnosis:**
```bash
# Check file size limits
# Verify storage service configuration
# Check AWS credentials (if using S3)
```

**Solution:**
```bash
# Configure proper file size limits
# Set up AWS S3 credentials
# Implement file validation
# Add error handling for uploads
```

#### Problem: Storage Service Unavailable
**Symptoms:**
- File uploads failing
- Storage endpoints returning errors
- Missing files

**Diagnosis:**
```bash
# Check storage service status
# Verify environment variables
# Test storage endpoints
```

**Solution:**
```bash
# Verify AWS credentials
# Check S3 bucket permissions
# Implement fallback storage
# Add storage service health checks
```

## 🛠️ Diagnostic Tools

### 1. Log Analysis
```bash
# Check Render service logs
# Go to your service → Logs tab

# Look for:
# - Error messages
# - Stack traces
# - Memory usage warnings
# - Connection errors
# - Authentication failures
```

### 2. Health Check Scripts
```bash
# Run deployment check
npm run deploy:check

# Check service status
npm run deploy:status

# Test API endpoints
curl -v https://your-api.onrender.com/api/health
```

### 3. Database Diagnostics
```bash
# Check Prisma status
npx prisma status

# Validate schema
npx prisma validate

# Check migrations
npx prisma migrate status

# Open Prisma Studio
npm run db:studio
```

### 4. Performance Monitoring
```bash
# Monitor memory usage
# Check Render dashboard metrics

# Test response times
time curl https://your-api.onrender.com/api/health

# Check cold start times
# Wait 15+ minutes, then test
```

## 🔧 Fixes by Issue Type

### Build Issues
```bash
# 1. Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# 2. Regenerate Prisma client
npx prisma generate

# 3. Test build locally
npm run build

# 4. Check for TypeScript errors
npx tsc --noEmit
```

### Deployment Issues
```bash
# 1. Verify render.yaml configuration
# 2. Check environment variables in Render dashboard
# 3. Verify database connection
# 4. Check service logs for specific errors
# 5. Ensure all required files are committed
```

### Runtime Issues
```bash
# 1. Check service logs in Render dashboard
# 2. Verify environment variables
# 3. Test health endpoints
# 4. Check database connectivity
# 5. Monitor resource usage
```

## 📞 Getting Help

### 1. Self-Diagnosis Steps
1. **Check the logs** - Most issues are visible in service logs
2. **Verify configuration** - Environment variables and settings
3. **Test endpoints** - Use health check and status endpoints
4. **Check documentation** - Review relevant documentation sections
5. **Search issues** - Look for similar problems in GitHub issues

### 2. When to Contact Support
- **Security issues** - Authentication bypasses, data leaks
- **Data corruption** - Database integrity issues
- **Service unavailable** - Complete service failure
- **Performance issues** - Consistent slow performance
- **Configuration problems** - Unable to resolve after trying solutions

### 3. Information to Provide
When reporting issues, include:
- **Error messages** - Exact error text and stack traces
- **Steps to reproduce** - Detailed reproduction steps
- **Environment details** - Node.js version, OS, deployment platform
- **Logs** - Relevant log entries
- **Configuration** - Environment variables (without secrets)
- **Expected vs actual behavior** - Clear description of the issue

### 4. Support Channels
- **GitHub Issues** - For bugs and feature requests
- **GitHub Discussions** - For questions and community support
- **Documentation** - Check this guide and other docs first
- **Community** - Ask in community forums or Discord

## 🚀 Prevention Tips

### 1. Development Best Practices
- **Test locally first** - Always test changes locally before deploying
- **Use environment variables** - Never commit secrets to git
- **Implement proper error handling** - Add comprehensive error handling
- **Add logging** - Include meaningful log messages
- **Monitor performance** - Track memory usage and response times

### 2. Deployment Best Practices
- **Use deployment scripts** - Automate deployment verification
- **Monitor health endpoints** - Regular health checks
- **Set up alerts** - Get notified of service issues
- **Backup data** - Regular database backups
- **Test rollbacks** - Ensure you can rollback if needed

### 3. Maintenance Best Practices
- **Regular updates** - Keep dependencies updated
- **Security patches** - Apply security updates promptly
- **Performance monitoring** - Track service metrics
- **Log rotation** - Manage log file sizes
- **Resource monitoring** - Watch for resource constraints

---

**Remember: Most issues can be resolved by checking logs, verifying configuration, and following the diagnostic steps above. When in doubt, start with the health checks and work through the troubleshooting process systematically.** 🔧
