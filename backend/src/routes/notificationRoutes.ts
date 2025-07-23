import { Router } from "express"
import type { NotificationService } from "../services/NotificationService"
import type { DatabaseManager } from "../database/DatabaseManager"

export const notificationRoutes = Router()

notificationRoutes.get("/:userId", async (req, res) => {
  try {
    const notificationService: NotificationService = req.app.locals.notificationService
    const notifications = await notificationService.getNotifications(req.params.userId)
    res.json(notifications)
  } catch (error) {
    console.error("Error fetching notifications:", error)
    res.status(500).json({ error: "Failed to fetch notifications" })
  }
})

notificationRoutes.post("/follow", async (req, res) => {
  try {
    const { follower_id, following_id } = req.body

    if (!follower_id || !following_id) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const dbManager: DatabaseManager = req.app.locals.dbManager
    const notificationService: NotificationService = req.app.locals.notificationService

    await dbManager.followUser(follower_id, following_id)
    await notificationService.createFollowNotification(follower_id, following_id)

    res.json({ message: "Follow notification created" })
  } catch (error) {
    console.error("Error creating follow notification:", error)
    res.status(500).json({ error: "Failed to create follow notification" })
  }
})

notificationRoutes.put("/:id/read", async (req, res) => {
  try {
    const notificationService: NotificationService = req.app.locals.notificationService
    await notificationService.markAsRead(req.params.id)
    res.json({ message: "Notification marked as read" })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    res.status(500).json({ error: "Failed to mark notification as read" })
  }
})

notificationRoutes.get("/:userId/unread-count", async (req, res) => {
  try {
    const notificationService: NotificationService = req.app.locals.notificationService
    const count = await notificationService.getUnreadCount(req.params.userId)
    res.json({ count })
  } catch (error) {
    console.error("Error fetching unread count:", error)
    res.status(500).json({ error: "Failed to fetch unread count" })
  }
})
