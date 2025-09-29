import express from "express";
import {
  deleteUser,
  getUsers,
  loginUser,
  logoutUser,
  patchPassword,
  patchUser,
  postUser,
} from "../controllers/userController.js";

const router = express.Router();
// Login User
router.post("/login", loginUser);

// Logout User
router.post("/logout", logoutUser);

// Get Users
router.get("/users", getUsers);

// Post Users
router.post("/users", postUser);

// Patch Users
router.patch("/users", patchUser);

// Patch Users Password
router.patch("/users/password", patchPassword);

// Delete Users
router.delete("/users", deleteUser);

export default router;
