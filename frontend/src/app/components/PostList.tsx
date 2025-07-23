"use client"

import { FileText, User } from "lucide-react"

interface Post {
  id: string
  title: string
  content: string
  username: string
  created_at: string
}

interface PostListProps {
  posts: Post[]
}

export function PostList({ posts }: PostListProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return (
      date.toLocaleDateString() +
      " at " +
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 flex items-center">
        <FileText className="h-5 w-5 mr-2" />
        Recent Posts
      </h2>

      {posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No posts yet. Be the first to share something!</p>
        </div>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <User className="h-8 w-8 text-gray-400 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">{post.username}</h3>
                  <p className="text-sm text-gray-500">{formatTime(post.created_at)}</p>
                </div>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-3">{post.title}</h2>
              <p className="text-gray-700 leading-relaxed">{post.content}</p>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
