import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  parseDescription,
  capitalizeWords,
} from "../../shared/utils/helperFunctions.js";
import { userCookieObj } from "../utils/helperFunctions.js";
import * as User from "../models/userModel.js";
import { sendError, sendResponse } from "../utils/response.js";

const JWT_SECRET = process.env.JWT_SECRET;

// Login User
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return sendResponse(
      res,
      { info: { message: "Missing Email Or Password" } },
      400
    );

  try {
    const user = await User.loginUser(email);

    const userCookie = {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
    };

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendResponse(
        res,
        { info: { message: "Invalid Credentials" } },
        401
      );
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
    sendError(res, err);
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
    const api = await User.getSwaggerDocs();
    const content = await User.getAllUsers();
    const tableDefinitions = api?.definitions?.users_view;
    const definitions = parseDescription(tableDefinitions.properties);
    const resObj = {
      table: "User",
      content,
      definitions,
    };

    sendResponse(res, resObj);
  } catch (err) {
    sendError(res, err);
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

    const user = await User.createUser(postObj);
    const resObj = {
      message: `New User \'${user.first_name} ${user.last_name}\' Successfully Created.`,
      user,
    };

    sendResponse(res, resObj, 201);
  } catch (err) {
    sendError(res, err);
  }
};

// Patch User (Admin + Account Self Update)
export const patchUser = async (req, res) => {
  try {
    const { id, first_name, last_name, email, role, updated_by } = req.body;
    const firstName = capitalizeWords(first_name);
    const lastName = capitalizeWords(last_name);
    const patchObj = {
      id,
      first_name: firstName,
      last_name: lastName,
      email,
      role,
      updated_by,
    };

    const user = await User.updateUser(id, patchObj);

    let referer = req?.headers?.referer || "";
    let message = "User Successfully Updated.";

    // If the request comes from the /account route then the user cookie will update
    if (referer?.includes("/account")) {
      message = "Your Account Has Been Updated.";

      const userCookie = userCookieObj(user);
      res.cookie("user", JSON.stringify(userCookie), {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });
    }

    const resData = {
      message,
      user,
    };

    sendResponse(res, resData);
  } catch (err) {
    sendError(res, err);
  }
};
// Patch Users Password
export const patchPassword = async (req, res) => {
  try {
    const { id, currentPassword, newPassword, updatedBy } = req.body;

    const user = await User.getUserById(id);
    console.log(user);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    console.log("THIS IS ISMATCH, " + isMatch);
    if (!isMatch) {
      sendResponse(
        res,
        { info: { message: "Current Password Is Incorrect." } },
        401
      );
      return;
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    let patchObj = {
      password: hashedPassword,
      updated_by: updatedBy,
    };

    const updatedUser = await User.updateUser(id, patchObj);
    const resData = {
      message: "Your Password Has Been Updated.",
      user: updatedUser,
    };
    sendResponse(res, resData);
  } catch (err) {
    sendError(res, err);
  }
};

// Delete User(s)
export const deleteUser = async (req, res) => {
  try {
    const { ids } = req.body;

    const idFilter = ids.map((id) => `"${id}"`).join(",");
    const deleted = await User.deleteUser(idFilter);
    const resData = { message: "User(s) Deleted Successfully.", deleted };

    sendResponse(res, resData);
  } catch (err) {
    sendError(res, err);
  }
};
