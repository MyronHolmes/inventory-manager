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

// Get All Product Variants
export const getAllProductVariants = async () => {
  const [content, productOptions, colorOptions, sizeOptions] =
    await Promise.all([
      makeRequest(`${API_URL}product_variants_view`),
      makeRequest(`${API_URL}products?select=id,product`),
      makeRequest(`${API_URL}colors?select=id,color`),
      makeRequest(`${API_URL}sizes?select=id,size`),
    ]);
  return { content, productOptions, colorOptions, sizeOptions };
};

// Create Product Variant
export const createProductVariant = async (postObj) => {
  const inventory = await makeRequest(`${API_URL}product_variants`, {
    method: "POST",
    body: JSON.stringify(postObj),
  });
  return inventory[0];
};

// Update Product Variant
export const updateProductVariant = async (id, patchObj) => {
  const inventory = await makeRequest(`${API_URL}product_variants?id=eq.${id}`, {
    method: "PATCH",
    body: JSON.stringify(patchObj),
  });
  return inventory[0];
};

// Delete Product Variant(s)
export const deleteProductVariant = async (idFilter) => {
  const inventory = await makeRequest(
    `${API_URL}product_variants?id=in.(${idFilter})`,
    {
      method: "DELETE",
      headers: { Prefer: "return=representation" },
    }
  );
  return inventory;
};
