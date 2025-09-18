import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  makeRequest,
  parseDescription,
  capitalizeWords,
} from "../../shared/utils/helperFunctions.js";
import { userCookieObj } from "../utils/helperFunctions.js";

const JWT_SECRET = process.env.JWT_SECRET;

// Register User
export const registerUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Missing Email Or Password" });

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
      return res.status(response.status).json(error);
    }

    const newUser = await response.json();
    res
      .status(201)
      .json({ message: "User Created Successfully", user: newUser[0] });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Login User
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Missing Email Or Password" });

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
        .json({ message: "User Lookup Failed" });
    }

    const users = await response.json();
    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid Credentials" });
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
      return res.status(401).json({ message: "Invalid Credentials" });
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
      .json({ message: "Login Successful", user: userCookie });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Logout User
export const logoutUser = (req, res) => {
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
};

// Get Users
export const getUsers = async (req, res) => {
  try {
    const swaggerDocs = await fetch(process.env.PGRST_DB_URL);
    const api = await swaggerDocs.json();
    const content = await makeRequest(`${process.env.PGRST_DB_URL}users_view`);

    const tableDefinitions = api.definitions?.users_view;
    const definitions = parseDescription(tableDefinitions.properties);

    res.status(200).json({
      table: "User",
      content,
      definitions,
    });
  } catch (err) {
    console.error(err);
    if (err.status) {
      res.status(err.status).json(err);
    }
    res.status(500).json({ message: "Server Error" });
  }
};

// Post User
export const postUser = async (req, res) => {
  try {
    const { first_name, last_name, email, role, created_by } = req.body;
    const password_hash = await bcrypt.hash(
      first_name.toLowerCase() + last_name.toLowerCase(),
      10
    );
    const postObj = {
      first_name: capitalizeWords(first_name),
      last_name: capitalizeWords(last_name),
      email,
      password: password_hash,
      role,
      created_by,
    };
    const data = await makeRequest(`${process.env.PGRST_DB_URL}users`, {
      method: "POST",
      body: JSON.stringify(postObj),
    });

    res.status(201).json({
      message: `New User \'${data[0].first_name} ${data[0].last_name}\' Successfully Created.`,
      user: data[0],
    });
  } catch (err) {
    if (err.status) {
      res.status(err.status).json(err);
    }
    res.status(500).json({ message: "Server Error" });
  }
};

// Patch User (Admin + Account Self Update)
export const patchUser = async (req, res) => {
  try {
    const { id, first_name, last_name, email, role, updated_by } = req.body;

    const firstName = capitalizeWords(first_name);
    const lastName = capitalizeWords(last_name);

    let patchObj = {
      id,
      first_name: firstName,
      last_name: lastName,
      email,
      role,
      updated_by,
    };

    const updatedUser = await makeRequest(
      `${process.env.PGRST_DB_URL}users?id=eq.${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(patchObj),
      }
    );

    let referer = req.headers.referer || "";
    let message = "User Successfully Updated.";

    // If the request comes from the /account route then the user cookie will update
    if (!referer?.includes("/users")) {
      message = "Your Account Has Been Updated."
      
      const userCookie = userCookieObj(updatedUser[0]);
      res.cookie("user", JSON.stringify(userCookie), {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });
    }
    res.status(200).json({
      message: message,
      user: updatedUser[0],
    });
  } catch (err) {
    if (err.status) {
      res.status(err.status).json(err);
    }
    res.status(500).json({ message: "Server Error" });
  }
};

export const patchPassword = async (req, res) => {
  try {
    const { id, currentPassword, newPassword, updatedBy } = req.body;

    const userData = await makeRequest(
      `${process.env.PGRST_DB_URL}users?id=eq.${id}`
    );
    const user = userData[0];

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Current Password Is Incorrect.", user: resData });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    let patchObj = {
      password: hashedPassword,
      updated_by: updatedBy,
    };

    const updatedUser = await makeRequest(
      `${process.env.PGRST_DB_URL}users?id=eq.${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(patchObj),
      }
    );

    res.status(200).json({
       message: "Your Password Has Been Updated.",
      user: updatedUser[0],
    });
  } catch (err) {
    if (err.status) {
      res.status(err.status).json(err);
    }
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete User(s)
export const deleteUser = async (req, res) => {
  try {
    const { ids } = req.body;

    const idFilter = ids.map((id) => `"${id}"`).join(",");
    const deleted = await makeRequest(
      `${process.env.PGRST_DB_URL}users?id=in.(${idFilter})`,
      {
        method: "DELETE",
        headers: { Prefer: "return=representation" },
      }
    );

    res.status(200).json({ message: "User(s) Deleted Successfully.", deleted });
  } catch (err) {
    if (err.status) {
      res.status(err.status).json(err);
    }
    res.status(500).json({ message: "Server Error" });
  }
};
