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

// Get All Categories
export const getAllCategories = async () => {
  const categories = await makeRequest(`${API_URL}categories_view`);
  return categories;
};

// Create Category
export const createCategory = async (postObj) => {
  const category = await makeRequest(`${API_URL}categories`, {
    method: "POST",
    body: JSON.stringify(postObj),
  });
  return category[0];
};

// Update Category
export const updateCategory = async (id, patchObj) => {
  const category = await makeRequest(`${API_URL}categories?id=eq.${id}`, {
    method: "PATCH",
    body: JSON.stringify(patchObj),
  });
  return category[0];
};

// Delete Category(ies)
export const deleteCategory = async (idFilter) => {
  const category = await makeRequest(
    `${API_URL}categories?id=in.(${idFilter})`,
    {
      method: "DELETE",
      headers: { Prefer: "return=representation" },
    }
  );
  return category;
};
