import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { capitalizeWords } from "../../src/utils/format.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Register User
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Missing email or password" });

  const password_hash = await bcrypt.hash(password, 10);

  let bodyObj = {
    ...req.body,
    password: password_hash,
  };

  try {
    const response = await fetch(`${process.env.PGRST_DB_URL}users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(bodyObj),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(error);
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
    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = users[0];
    const userCookie = {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
    };
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });
    return res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
      })
      .cookie("user", JSON.stringify(userCookie), {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
      })
      .status(200)
      .json({ message: "Login successful", user: userCookie });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Logout User
router.post("/logout", (req, res) => {
  return res
    .clearCookie("user", {
      path: "/",
      sameSite: "Strict",
      secure: process.env.NODE_ENV === "production",
    })
    .clearCookie("token", {
      path: "/",
      httpOnly: true,
      sameSite: "Strict",
      secure: process.env.NODE_ENV === "production",
    })
    .status(200)
    .json({ message: "Logged out successfully" });
});

// Users Table
router.get("/users", async (req, res) => {
  try {
    const response = await fetch(`${process.env.PGRST_DB_URL}users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(error);

      return res.status(response.status).json(error);
    }

    const data = await response.json();
    console.log(data);

    res.status(200).json({ users: data });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Colors Table
router.get("/colors", async (req, res) => {
  try {
    const response = await fetch(`${process.env.PGRST_DB_URL}colors`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(error);

      return res.status(response.status).json(error);
    }

    const data = await response.json();
    console.log(data);

    res.status(200).json({ colors: data });
  } catch (err) {
    console.error("Colors error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/colors", async (req, res) => {
  console.log(req.body)
  const { color } = req.body;
  const postObj = {
    ...req.body,
    color: capitalizeWords(color)
  };
  try {
    const response = await fetch(`${process.env.PGRST_DB_URL}colors`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(postObj),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(error);
      return res.status(response.status).json(error);
    }

    const newColor = await response.json();
    res.status(201).json({ message: `New color \'${newColor[0].color}\' successfully created.`, user: newColor[0] });
  } catch (err) {
    console.error("Color creation error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/colors", async (req, res) => {
  const { id, color, updated_by } = req.body;
  const postObj = {
    id,
    color: capitalizeWords(color),
    updated_by
  };

  try {
    const response = await fetch(`${process.env.PGRST_DB_URL}colors?id=eq.${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(postObj),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(error);
      return res.status(response.status).json(error);
    }

    const newColor = await response.json();
    res.status(201).json({ message: `Color successfully updated to \'${newColor[0].color}\'.`, user: newColor[0] });
  } catch (err) {
    console.error("Color creation error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/colors", async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "No IDs provided" });
  }

  const idFilter = ids.map(id => `"${id}"`).join(",");
  console.log(idFilter)

  try {
    const response = await fetch(`${process.env.PGRST_DB_URL}colors?id=in.(${idFilter})`, {
      method: "DELETE",
      headers: {
        Prefer: "return=representation", 
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Error deleting from PostgREST:", error);
      return res.status(response.status).json(error);
    }

    const deleted = await response.json();
    console.log(deleted)
    res.status(200).json({ message: "Color(s) deleted successfully.", deleted });
  } catch (err) {
    console.error("Server error deleting colors:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
