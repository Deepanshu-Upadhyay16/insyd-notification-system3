"use client"

import { useEffect, useState } from "react"
import { io, type Socket } from "socket.io-client"

export function useSocket(url: string): Socket | null {
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    const socketInstance = io(url)
    setSocket(socketInstance)

    socketInstance.on("connect", () => {
      console.log("Connected to server")
    })

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from server")
    })

    return () => {
      socketInstance.close()
    }
  }, [url])

  return socket
}
