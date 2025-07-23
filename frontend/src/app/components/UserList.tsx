"use client"

import { useState } from "react"
import { Users, UserPlus } from "lucide-react"

interface User {
  id: string
  username: string
  email: string
}

interface UserListProps {
  users: User[]
  onFollow: (userId: string) => void
}

export function UserList({ users, onFollow }: UserListProps) {
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set())

  const handleFollow = (userId: string) => {
    setFollowedUsers((prev) => new Set([...prev, userId]))
    onFollow(userId)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Discover Architects
        </h2>
      </div>

      <div className="p-4 space-y-3">
        {users.length === 0 ? (
          <p className="text-gray-500 text-center">No other users found</p>
        ) : (
          users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{user.username}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>

              <button
                onClick={() => handleFollow(user.id)}
                disabled={followedUsers.has(user.id)}
                className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                  followedUsers.has(user.id)
                    ? "bg-green-100 text-green-800 cursor-not-allowed"
                    : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                }`}
              >
                <UserPlus className="h-4 w-4 mr-1" />
                {followedUsers.has(user.id) ? "Following" : "Follow"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
