"use client"

import { Bell, User, FileText } from "lucide-react"

interface Notification {
  id: string
  type: "follow" | "post" | "like" | "comment"
  message: string
  is_read: boolean
  created_at: string
}

interface NotificationPanelProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
}

export function NotificationPanel({ notifications, onMarkAsRead }: NotificationPanelProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "follow":
        return <User className="h-4 w-4 text-blue-500" />
      case "post":
        return <FileText className="h-4 w-4 text-green-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">{unreadCount}</span>
          )}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                !notification.is_read ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
              }`}
              onClick={() => !notification.is_read && onMarkAsRead(notification.id)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">{getIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatTime(notification.created_at)}</p>
                </div>
                {!notification.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
