import mysql from "mysql2/promise"
import type { Pool } from "mysql2/promise"

export interface User {
  id: string
  username: string
  email: string
  created_at: Date
}

export interface Post {
  id: string
  user_id: string
  title: string
  content: string
  created_at: Date
}

export interface Follow {
  follower_id: string
  following_id: string
  created_at: Date
}

export interface Notification {
  id: string
  user_id: string
  type: "follow" | "post" | "like" | "comment"
  message: string
  related_user_id?: string
  related_post_id?: string
  is_read: boolean
  created_at: Date
}

export class DatabaseManager {
  private pool: Pool

  constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "insyd_notifications",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    })
  }

  async initialize() {
    await this.createTables()
    await this.seedData()
  }

  private async createTables() {
    const connection = await this.pool.getConnection()

    try {
      // Create users table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(36) PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_username (username)
        )
      `)

      // Create posts table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS posts (
          id VARCHAR(36) PRIMARY KEY,
          user_id VARCHAR(36) NOT NULL,
          title VARCHAR(200) NOT NULL,
          content TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_user_created (user_id, created_at)
        )
      `)

      // Create follows table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS follows (
          follower_id VARCHAR(36),
          following_id VARCHAR(36),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (follower_id, following_id),
          FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `)

      // Create notifications table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS notifications (
          id VARCHAR(36) PRIMARY KEY,
          user_id VARCHAR(36) NOT NULL,
          type ENUM('follow', 'post', 'like', 'comment') NOT NULL,
          message TEXT NOT NULL,
          related_user_id VARCHAR(36),
          related_post_id VARCHAR(36),
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_user_created (user_id, created_at),
          INDEX idx_user_unread (user_id, is_read)
        )
      `)

      console.log("Database tables created successfully")
    } finally {
      connection.release()
    }
  }

  private async seedData() {
    const connection = await this.pool.getConnection()

    try {
      // Check if users already exist
      const [existingUsers] = await connection.execute("SELECT COUNT(*) as count FROM users")
      if ((existingUsers as any)[0].count > 0) {
        console.log("Database already seeded")
        return
      }

      // Seed users
      const users = [
        { id: "1", username: "architect_alice", email: "alice@example.com" },
        { id: "2", username: "designer_bob", email: "bob@example.com" },
        { id: "3", username: "planner_carol", email: "carol@example.com" },
        { id: "4", username: "engineer_dave", email: "dave@example.com" },
      ]

      for (const user of users) {
        await connection.execute("INSERT INTO users (id, username, email) VALUES (?, ?, ?)", [
          user.id,
          user.username,
          user.email,
        ])
      }

      // Seed some follows
      await connection.execute("INSERT INTO follows (follower_id, following_id) VALUES (?, ?)", ["1", "2"])
      await connection.execute("INSERT INTO follows (follower_id, following_id) VALUES (?, ?)", ["1", "3"])
      await connection.execute("INSERT INTO follows (follower_id, following_id) VALUES (?, ?)", ["2", "1"])

      console.log("Database seeded successfully")
    } finally {
      connection.release()
    }
  }

  // User operations
  async getUsers(): Promise<User[]> {
    const [rows] = await this.pool.execute("SELECT * FROM users ORDER BY created_at DESC")
    return rows as User[]
  }

  async getUserById(id: string): Promise<User | null> {
    const [rows] = await this.pool.execute("SELECT * FROM users WHERE id = ?", [id])
    const users = rows as User[]
    return users.length > 0 ? users[0] : null
  }

  // Post operations
  async createPost(post: Omit<Post, "created_at">): Promise<void> {
    await this.pool.execute("INSERT INTO posts (id, user_id, title, content) VALUES (?, ?, ?, ?)", [
      post.id,
      post.user_id,
      post.title,
      post.content,
    ])
  }

  async getPosts(): Promise<(Post & { username: string })[]> {
    const [rows] = await this.pool.execute(`
      SELECT p.*, u.username 
      FROM posts p 
      JOIN users u ON p.user_id = u.id 
      ORDER BY p.created_at DESC
    `)
    return rows as (Post & { username: string })[]
  }

  // Follow operations
  async followUser(followerId: string, followingId: string): Promise<void> {
    await this.pool.execute("INSERT IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)", [
      followerId,
      followingId,
    ])
  }

  async getFollowers(userId: string): Promise<string[]> {
    const [rows] = await this.pool.execute("SELECT follower_id FROM follows WHERE following_id = ?", [userId])
    return (rows as any[]).map((row) => row.follower_id)
  }

  // Notification operations
  async createNotification(notification: Omit<Notification, "created_at">): Promise<void> {
    await this.pool.execute(
      "INSERT INTO notifications (id, user_id, type, message, related_user_id, related_post_id, is_read) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        notification.id,
        notification.user_id,
        notification.type,
        notification.message,
        notification.related_user_id,
        notification.related_post_id,
        notification.is_read,
      ],
    )
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    const [rows] = await this.pool.execute(
      "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
      [userId],
    )
    return rows as Notification[]
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.pool.execute("UPDATE notifications SET is_read = TRUE WHERE id = ?", [notificationId])
  }

  async getUnreadCount(userId: string): Promise<number> {
    const [rows] = await this.pool.execute(
      "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE",
      [userId],
    )
    return (rows as any)[0].count
  }
}
