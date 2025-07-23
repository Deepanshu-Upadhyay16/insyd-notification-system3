# Insyd Notification System POC

## System Design Overview

### Architecture Components

1. **Frontend (Next.js)**
   - User dashboard to view notifications
   - Real-time notification updates via WebSocket
   - Simple UI for creating posts and following users

2. **Backend (Node.js + Express)**
   - REST API for user management and notifications
   - WebSocket server for real-time notifications
   - Notification processing and delivery system

3. **Database (MySQL)**
   - Users table
   - Posts table  
   - Follows table (user relationships)
   - Notifications table
   - Notification preferences

### Flow of Execution

1. **User Actions Trigger Notifications**:
   - User creates a post → notify followers
   - User follows someone → notify the followed user
   - User likes/comments → notify post author

2. **Notification Processing**:
   - Action detected → Create notification record
   - Check user preferences → Filter notifications
   - Deliver via WebSocket (real-time) + Database (persistence)

3. **Real-time Delivery**:
   - WebSocket connection maintains live updates
   - Fallback to polling for offline users

### Scale Considerations (100 DAUs → 1M DAUs)

**Current (100 DAUs)**:
- Single server deployment
- Direct MySQL connections
- In-memory WebSocket management

**Future Scale (1M DAUs)**:
- Microservices architecture
- Message queues (Redis/RabbitMQ)
- Database sharding
- CDN for static content
- Load balancers

### Performance Optimizations

1. **Database Indexing**: On user_id, created_at, notification_type
2. **Batch Processing**: Group similar notifications
3. **Caching**: Redis for frequently accessed data
4. **Connection Pooling**: Efficient database connections

### Limitations

1. **Single Point of Failure**: Monolithic architecture
2. **Memory Constraints**: In-memory WebSocket storage
3. **Database Bottleneck**: Single MySQL instance
4. **No Horizontal Scaling**: Current design doesn't support multiple instances

## Deployment

This POC is configured for Railway deployment with automatic database provisioning.

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run development: `npm run dev`
5. Deploy to Railway: Connect GitHub repo to Railway
