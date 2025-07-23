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

// Initialize services
const dbManager = new DatabaseManager()
const notificationService = new NotificationService(dbManager, io)

// Make services available to routes
app.locals.dbManager = dbManager
app.locals.notificationService = notificationService

// Routes
app.use("/api/users", userRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/notifications", notificationRoutes)

// WebSocket connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  socket.on("join", (userId: string) => {
    socket.join(`user_${userId}`)
    console.log(`User ${userId} joined their notification room`)
  })

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)
  })
})

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

const PORT = process.env.PORT || 5000

// Initialize database and start server
async function startServer() {
  try {
    await dbManager.initialize()
    console.log("Database initialized successfully")

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error("Failed to start server:", error)
    process.exit(1)
  }
}

startServer()
