import {
  parseDescription,
  capitalizeWords,
} from "../../shared/utils/helperFunctions.js";
import * as Product from "../models/productModel.js";
import { sendError, sendResponse } from "../utils/response.js";
import { makeRequest } from "../utils/helperFunctions.js";

const API_URL = process.env.PGRST_URL || process.env.PGRST_DB_URL;

// Product Table
export const getProducts = async (req, res) => {
  try {
    const api = await Product.getSwaggerDocs();
    const getAllObj = await Product.getAllProducts();
    const tableDefinitions = api?.definitions?.products_view;
    let definitions = parseDescription(tableDefinitions.properties);
    definitions.category.description = {
      ...definitions.category.description,
      options: getAllObj?.categoryOptions,
    };
    const resObj = {
      table: "Product",
      content: getAllObj?.products,
      definitions,
    };

    sendResponse(res, resObj);
  } catch (err) {
    console.error("There was an error: ", err); 
    sendError(res, err);
  }
};

export const postProduct = async (req, res) => {
  try {
    const { product, category, description, quantity, status, created_by } =
      req.body;
    const postObj = {
      category_id: category,
      description,
      quantity,
      status,
      created_by,
      product: capitalizeWords(product),
    };

    const productData = await Product.createProduct(postObj);
    const resData = {
      message: `New Product \'${productData.product}\' Successfully Created.`,
      product: productData,
    };

    sendResponse(res, resData);
  } catch (err) {
    console.error("There was an error: ", err); 
    sendError(res, err);
  }
};

export const patchProduct = async (req, res) => {
  try {
    const { id, product, description, category, status, quantity, updated_by } =
      req.body;
    const catData = await makeRequest(
      `${API_URL}categories?select=id,category&category=eq.${category}`
    );
    if (!catData) {
      return res
        .status(400)
        .json({ message: `Category '${category}' not found` });
    }

    const patchObj = {
      id,
      product: capitalizeWords(product),
      category_id: catData[0].id,
      description,
      quantity,
      status: status,
      updated_by,
    };

    const productData = Product.updateProduct(id, patchObj);
    const resData = {
      message: "Product Successfully Updated.",
      product: productData,
    };
    sendResponse(res, resData);
  } catch (err) {
    console.error("There was an error: ", err); 
    sendError(res, err);
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { ids } = req.body;
    const idFilter = ids.map((id) => `"${id}"`).join(",");

    const product = await Product.deleteProduct(idFilter);
    const resData = { message: "Product(s) Deleted Successfully.", product };

    sendResponse(res, resData);
  } catch (err) {
    console.error("There was an error: ", err); 
    sendError(res, err);
  }
};
