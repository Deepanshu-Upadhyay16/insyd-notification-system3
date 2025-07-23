import { Router } from "express"
import type { DatabaseManager } from "../database/DatabaseManager"

export const userRoutes = Router()

userRoutes.get("/", async (req, res) => {
  try {
    const dbManager: DatabaseManager = req.app.locals.dbManager
    const users = await dbManager.getUsers()
    res.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    res.status(500).json({ error: "Failed to fetch users" })
  }
})

userRoutes.get("/:id", async (req, res) => {
  try {
    const dbManager: DatabaseManager = req.app.locals.dbManager
    const user = await dbManager.getUserById(req.params.id)

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    res.status(500).json({ error: "Failed to fetch user" })
  }
})
