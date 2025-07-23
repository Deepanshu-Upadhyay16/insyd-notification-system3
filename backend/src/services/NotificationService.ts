import type { Server } from "socket.io"
import { v4 as uuidv4 } from "uuid"
import type { DatabaseManager, Notification } from "../database/DatabaseManager"

export class NotificationService {
  constructor(
    private dbManager: DatabaseManager,
    private io: Server,
  ) {}

  async createFollowNotification(followerId: string, followingId: string): Promise<void> {
    const follower = await this.dbManager.getUserById(followerId)
    if (!follower) return

    const notification: Omit<Notification, "created_at"> = {
      id: uuidv4(),
      user_id: followingId,
      type: "follow",
      message: `${follower.username} started following you`,
      related_user_id: followerId,
      related_post_id: null,
      is_read: false,
    }

    await this.dbManager.createNotification(notification)

    // Send real-time notification
    this.io.to(`user_${followingId}`).emit("new_notification", notification)
  }

  async createPostNotification(postId: string, authorId: string, title: string): Promise<void> {
    const author = await this.dbManager.getUserById(authorId)
    if (!author) return

    const followers = await this.dbManager.getFollowers(authorId)

    for (const followerId of followers) {
      const notification: Omit<Notification, "created_at"> = {
        id: uuidv4(),
        user_id: followerId,
        type: "post",
        message: `${author.username} published a new post: "${title}"`,
        related_user_id: authorId,
        related_post_id: postId,
        is_read: false,
      }

      await this.dbManager.createNotification(notification)

      // Send real-time notification
      this.io.to(`user_${followerId}`).emit("new_notification", notification)
    }
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return await this.dbManager.getNotifications(userId)
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.dbManager.markNotificationAsRead(notificationId)
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.dbManager.getUnreadCount(userId)
  }
}
