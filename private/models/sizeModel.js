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

// Get All Sizes
export const getAllSizes = async () => {
  const sizes = await makeRequest(`${API_URL}sizes_view`);
  return sizes;
};

// Create Size
export const createSize = async (postObj) => {
  const size = await makeRequest(`${API_URL}sizes`, {
    method: "POST",
    body: JSON.stringify(postObj),
  });
  return size[0];
};

// Update Size
export const updateSize = async (id, patchObj) => {
  const size = await makeRequest(`${API_URL}sizes?id=eq.${id}`, {
    method: "PATCH",
    body: JSON.stringify(patchObj),
  });
  return size[0];
};

// Delete Size
export const deleteSize = async (idFilter) => {
  const size = await makeRequest(
    `${API_URL}sizes?id=in.(${idFilter})`,
    {
      method: "DELETE",
      headers: { Prefer: "return=representation" },
    }
  );
  return size;
};
