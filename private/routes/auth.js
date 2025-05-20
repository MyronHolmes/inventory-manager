import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import express from "express";
import bcrypt from "bcrypt";
// import jwt from 'jsonwebtoken';

const router = express.Router();
// const JWT_SECRET = process.env.JWT_SECRET;

// Register User
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Missing email or password" });

  const password_hash = await bcrypt.hash(password, 10);

  try {
    const response = await fetch(`${process.env.PGRST_DB_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({ email, password_hash }),
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json(error);
    }

    const newUser = await response.json();
    res.status(201).json({ message: "User created", user: newUser[0] });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login User
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Missing email or password" });

  try {
    const response = await fetch(
      `${process.env.PGRST_DB_URL}users?email=eq.${encodeURIComponent(email)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    if (!response.ok) {
      return res
        .status(response.status)
        .json({ message: "User lookup failed" });
    }

    const users = await response.json();
    console.log(users);
    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = users[0];
    const userCookie = {
      firstName: user.first_name,
      lastName: user.last_name,
      firstName: user.email,
      id: user.id,
    };
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // const token = jwt.sign(
    //   { id: user.id, email: user.email },
    //   JWT_SECRET,
    //   { expiresIn: '1h' }
    // );

    // res.json({ token });
    res.cookie("user", userCookie);
    return res.status(200).json({ user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
