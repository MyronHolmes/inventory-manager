import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { makeRequest } from "../utils/helperFunctions.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const API_URL = process.env.PGRST_URL || process.env.PGRST_DB_URL;


// Get Swagger Docs
export const getSwaggerDocs = async () => {
  const api = await makeRequest(API_URL);
  return api;
};

// Login User
export const loginUser = async (email) => {
  const login = await makeRequest(
    `${API_URL}users?email=eq.${encodeURIComponent(email)}`
  );
  return login[0];
};

// Get All Users
export const getAllUsers = async () => {
  const users = await makeRequest(`${API_URL}users_view`);
  return users;
};

// Get User
export const getUserById = async (id) => {
  const user = await makeRequest(`${API_URL}users?id=eq.${id}`);
  return user[0];
};

// Create User
export const createUser = async (postObj) => {
  const user = await makeRequest(`${API_URL}users`, {
    method: "POST",
    body: JSON.stringify(postObj),
  });
  return user[0];
};

// Patch User
export const updateUser = async (id, patchObj) => {
  const user = await makeRequest(`${API_URL}users?id=eq.${id}`, {
    method: "PATCH",
    body: JSON.stringify(patchObj),
  });
  return user[0];
};

// Delete User(s)
export const deleteUser = async (idList) => {
  const user = await makeRequest(`${API_URL}users?id=in.(${idList})`, {
    method: "DELETE",
    
  });
  return user;
};
