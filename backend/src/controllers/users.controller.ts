import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import * as usersService from "../services/users.service.js";
import { getParam } from "../utils/request.js";

export async function getAllUsers(req: AuthRequest, res: Response) {
  try {
    const users = await usersService.getAllUsers();
    // Remove password from response
    const sanitizedUsers = users.map((user) => {
      const { password, ...rest } = user;
      return rest;
    });
    res.json(sanitizedUsers);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
}

export async function getUser(req: AuthRequest, res: Response) {
  try {
    const user = await usersService.getUserById(getParam(req.params.id));
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const { password, ...sanitizedUser } = user;
    res.json(sanitizedUser);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
}

export async function createUser(req: AuthRequest, res: Response) {
  try {
    const user = await usersService.createUser(req.body);
    const { password, ...sanitizedUser } = user;
    res.status(201).json(sanitizedUser);
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: "Failed to create user" });
  }
}

export async function updateUser(req: AuthRequest, res: Response) {
  try {
    const user = await usersService.updateUser(
      getParam(req.params.id),
      req.body,
    );
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const { password, ...sanitizedUser } = user;
    res.json(sanitizedUser);
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
}

export async function deleteUser(req: AuthRequest, res: Response) {
  try {
    await usersService.deleteUser(getParam(req.params.id));
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
}
