"use client"

import { useState, useEffect } from "react"
import { NotificationPanel } from "./components/NotificationPanel"
import { PostForm } from "./components/PostForm"
import { PostList } from "./components/PostList"
import { UserList } from "./components/UserList"
import { useSocket } from "./hooks/useSocket"

interface User {
  id: string
  username: string
  email: string
}

interface Post {
  id: string
  user_id: string
  title: string
  content: string
  username: string
  created_at: string
}

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [notifications, setNotifications] = useState([])

  const socket = useSocket(process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000")

  useEffect(() => {
    fetchUsers()
    fetchPosts()
  }, [])

  useEffect(() => {
    if (currentUser && socket) {
      socket.emit("join", currentUser.id)
      fetchNotifications()

      socket.on("new_notification", (notification) => {
        setNotifications((prev) => [notification, ...prev])
      })

      return () => {
        socket.off("new_notification")
      }
    }
  }, [currentUser, socket])

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/users`)
      const data = await response.json()
      setUsers(data)
      if (data.length > 0 && !currentUser) {
        setCurrentUser(data[0]) // Auto-select first user for demo
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/posts`)
      const data = await response.json()
      setPosts(data)
    } catch (error) {
      console.error("Error fetching posts:", error)
    }
  }

  const fetchNotifications = async () => {
    if (!currentUser) return

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/notifications/${currentUser.id}`,
      )
      const data = await response.json()
      setNotifications(data)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const handlePostCreated = () => {
    fetchPosts()
  }

  const handleUserFollow = async (followingId: string) => {
    if (!currentUser) return

    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/notifications/follow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          follower_id: currentUser.id,
          following_id: followingId,
        }),
      })
    } catch (error) {
      console.error("Error following user:", error)
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading Insyd...</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Insyd</h1>
              <span className="ml-2 text-sm text-gray-500">Architecture Social Network</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, <strong>{currentUser.username}</strong>
              </span>
              <select
                value={currentUser.id}
                onChange={(e) => {
                  const user = users.find((u) => u.id === e.target.value)
                  if (user) setCurrentUser(user)
                }}
                className="text-sm border rounded px-2 py-1"
              >
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Users */}
          <div className="lg:col-span-1">
            <UserList users={users.filter((u) => u.id !== currentUser.id)} onFollow={handleUserFollow} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <PostForm currentUser={currentUser} onPostCreated={handlePostCreated} />
            <PostList posts={posts} />
          </div>

          {/* Right Sidebar - Notifications */}
          <div className="lg:col-span-1">
            <NotificationPanel
              notifications={notifications}
              onMarkAsRead={(id) => {
                // Update notification as read
                setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
