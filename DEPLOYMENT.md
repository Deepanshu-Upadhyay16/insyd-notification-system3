# Railway Deployment Guide

## Prerequisites
1. Railway account
2. GitHub repository with this code

## Deployment Steps

### 1. Create Railway Project
\`\`\`bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Create new project
railway new
\`\`\`

### 2. Add MySQL Database
1. Go to Railway dashboard
2. Click "Add Service" → "Database" → "MySQL"
3. Note the connection details

### 3. Set Environment Variables
In Railway dashboard, add these variables:
\`\`\`
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-domain.railway.app
DATABASE_URL=mysql://user:password@host:port/database
\`\`\`

### 4. Deploy Backend
\`\`\`bash
# Link to Railway project
railway link

# Deploy
railway up
\`\`\`

### 5. Deploy Frontend (Optional)
For separate frontend deployment:
1. Create another Railway service
2. Set `NEXT_PUBLIC_BACKEND_URL` to your backend URL
3. Deploy frontend code

## Database Setup
The application will automatically:
- Create required tables
- Seed initial data
- Set up proper indexes

## Monitoring
- Check Railway logs for any issues
- Monitor database connections
- Watch for WebSocket connection errors

## Scaling Considerations
- Current setup handles ~100 concurrent users
- For higher load, consider:
  - Redis for session management
  - Database read replicas
  - Load balancing
\`\`\`

Finally, let's update the backend environment configuration:

```typescriptreact file="backend/.env.example"
[v0-no-op-code-block-prefix]# Database Configuration (Railway provides DATABASE_URL automatically)
DATABASE_URL=mysql://user:password@host:port/database

# Fallback individual DB settings
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=insyd_notifications

# Server Configuration
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-domain.railway.app

# Railway automatically provides:
# RAILWAY_ENVIRONMENT=production
# RAILWAY_SERVICE_NAME=your-service-name
