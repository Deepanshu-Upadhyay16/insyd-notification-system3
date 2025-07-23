"use client"

import type React from "react"

import { useState } from "react"
import { Send } from "lucide-react"

interface User {
  id: string
  username: string
}

interface PostFormProps {
  currentUser: User
  onPostCreated: () => void
}

export function PostForm({ currentUser, onPostCreated }: PostFormProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: currentUser.id,
          title: title.trim(),
          content: content.trim(),
        }),
      })

      if (response.ok) {
        setTitle("")
        setContent("")
        onPostCreated()
      }
    } catch (error) {
      console.error("Error creating post:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">Create New Post</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div>
          <input
            type="text"
            placeholder="Post title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <textarea
            placeholder="What's on your mind about architecture?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            disabled={isSubmitting}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!title.trim() || !content.trim() || isSubmitting}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? "Publishing..." : "Publish Post"}
          </button>
        </div>
      </form>
    </div>
  )
}
