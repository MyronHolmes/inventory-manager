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

// Get All Colors
export const getAllColors = async () => {
  const colors = await makeRequest(`${API_URL}colors_view`);
  return colors;
};

// Create Color
export const createColor = async (postObj) => {
  const color = await makeRequest(`${API_URL}colors`, {
    method: "POST",
    body: JSON.stringify(postObj),
  });
  return color[0];
};

// Update Color
export const updateColor = async (id, patchObj) => {
  const color = await makeRequest(`${API_URL}colors?id=eq.${id}`, {
    method: "PATCH",
    body: JSON.stringify(patchObj),
  });
  return color[0];
};

// Delete Color(s)
export const deleteColor = async (idFilter) => {
  const color = await makeRequest(
    `${process.env.PGRST_DB_URL}colors?id=in.(${idFilter})`,
    {
      method: "DELETE",
      headers: { Prefer: "return=representation" },
    }
  );
  return color;
};
