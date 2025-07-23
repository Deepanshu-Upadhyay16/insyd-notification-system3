import { Router } from "express"
import { v4 as uuidv4 } from "uuid"
import type { DatabaseManager } from "../database/DatabaseManager"
import type { NotificationService } from "../services/NotificationService"

export const postRoutes = Router()

postRoutes.get("/", async (req, res) => {
  try {
    const dbManager: DatabaseManager = req.app.locals.dbManager
    const posts = await dbManager.getPosts()
    res.json(posts)
  } catch (error) {
    console.error("Error fetching posts:", error)
    res.status(500).json({ error: "Failed to fetch posts" })
  }
})

postRoutes.post("/", async (req, res) => {
  try {
    const { user_id, title, content } = req.body

    if (!user_id || !title || !content) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const dbManager: DatabaseManager = req.app.locals.dbManager
    const notificationService: NotificationService = req.app.locals.notificationService

    const postId = uuidv4()

    await dbManager.createPost({
      id: postId,
      user_id,
      title,
      content,
    })

    // Create notifications for followers
    await notificationService.createPostNotification(postId, user_id, title)

    res.status(201).json({ id: postId, message: "Post created successfully" })
  } catch (error) {
    console.error("Error creating post:", error)
    res.status(500).json({ error: "Failed to create post" })
  }
})
