import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import cors from "cors"
import dotenv from "dotenv"
import { DatabaseManager } from "./database/DatabaseManager"
import { NotificationService } from "./services/NotificationService"
import { userRoutes } from "./routes/userRoutes"
import { postRoutes } from "./routes/postRoutes"
import { notificationRoutes } from "./routes/notificationRoutes"

dotenv.config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

// Middleware
app.use(cors())
app.use(express.json())

// Health check endpoint (before database initialization)
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    port: process.env.PORT || 5000,
  })
})

// Basic info endpoint
app.get("/", (req, res) => {
  res.json({
    name: "Insyd Notification System",
    version: "1.0.0",
    status: "running",
    endpoints: {
      health: "/health",
      users: "/api/users",
      posts: "/api/posts",
      notifications: "/api/notifications",
    },
  })
})

const PORT = process.env.PORT || 5000

// Initialize database and start server
async function startServer() {
  try {
    console.log("🚀 Starting Insyd Notification System...")
    console.log("Environment:", process.env.NODE_ENV || "development")
    console.log("Port:", PORT)

    // Initialize services
    const dbManager = new DatabaseManager()
    const notificationService = new NotificationService(dbManager, io)

    // Make services available to routes
    app.locals.dbManager = dbManager
    app.locals.notificationService = notificationService

    // Initialize database
    await dbManager.initialize()
    console.log("✅ Database initialized successfully")

    // Setup routes after database is ready
    app.use("/api/users", userRoutes)
    app.use("/api/posts", postRoutes)
    app.use("/api/notifications", notificationRoutes)

    // WebSocket connection handling
    io.on("connection", (socket) => {
      console.log("👤 User connected:", socket.id)

      socket.on("join", (userId: string) => {
        socket.join(`user_${userId}`)
        console.log(`👤 User ${userId} joined their notification room`)
      })

      socket.on("disconnect", () => {
        console.log("👋 User disconnected:", socket.id)
      })
    })

    // Start server
    server.listen(PORT, () => {
      console.log(`🎉 Server running on port ${PORT}`)
      console.log(`🌐 Health check: http://localhost:${PORT}/health`)
      console.log(`📡 API base: http://localhost:${PORT}/api`)
    })
  } catch (error) {
    console.error("❌ Failed to start server:", error)

    // More detailed error logging
    if (error.code === "ECONNREFUSED") {
      console.error("🔍 Database connection refused. Please check:")
      console.error("   - DATABASE_URL environment variable")
      console.error("   - MySQL service is running")
      console.error("   - Network connectivity")
    }

    process.exit(1)
  }
}

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received, shutting down gracefully")
  server.close(() => {
    console.log("✅ Process terminated")
  })
})

process.on("SIGINT", () => {
  console.log("👋 SIGINT received, shutting down gracefully")
  server.close(() => {
    console.log("✅ Process terminated")
  })
})

startServer()
