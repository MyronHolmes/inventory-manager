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

// Get All Products
export const getAllProducts = async () => {
  const products = await makeRequest(`${API_URL}products_view`);
  const categoryOptions = await makeRequest(`${API_URL}categories?select=id,category`)
  return {products, categoryOptions};
};

// Create Product
export const createProduct = async (postObj) => {
  const product = await makeRequest(`${API_URL}products`, {
    method: "POST",
    body: JSON.stringify(postObj),
  });
  return product[0];
};

// Update Product
export const updateProduct = async (id, patchObj) => {
  const product = await makeRequest(`${API_URL}products?id=eq.${id}`, {
    method: "PATCH",
    body: JSON.stringify(patchObj),
  });
  return product[0];
};

// Delete Product
export const deleteProduct = async (idFilter) => {
  const product = await makeRequest(
    `${API_URL}products?id=in.(${idFilter})`,
    {
      method: "DELETE",
      
    }
  );
  return product;
};
