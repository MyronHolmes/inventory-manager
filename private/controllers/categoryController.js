import {
  parseDescription,
  capitalizeWords,
} from "../../shared/utils/helperFunctions.js";
import * as Category from "../models/categoryModel.js";
import { sendError, sendResponse } from "../utils/response.js";


// Categories Table
export const getCategories = async (req, res) => {
  try {
    const api = await Category.getSwaggerDocs();
    const content = await Category.getAllCategories();
    const tableDefinitions = api?.definitions?.categories_view;
    const definitions = parseDescription(tableDefinitions.properties);
    const resObj = {
      table: "Category",
      content,
      definitions,
    };

    sendResponse(res, resObj);
  } catch (err) {
    console.error("There was an error: ", err); 
    sendError(res, err);
  }
};

export const postCategory = async (req, res) => {
  try {
    const { category } = req.body;
    const postObj = {
      ...req.body,
      category: capitalizeWords(category),
    };

    const categoryData = await Category.createCategory(postObj);
    const resData = {
      message: `New Category \'${categoryData.category}\' Successfully Created.`,
      category: categoryData,
    };

    sendResponse(res, resData);
  } catch (err) {
    console.error("There was an error: ", err); 
    sendError(res, err);
  }
};

export const patchCategory = async (req, res) => {
  try {
    const { id, category, updated_by } = req.body;
    const patchObj = {
      id,
      category: capitalizeWords(category),
      updated_by,
    };

    const categoryData = await Category.updateCategory(id, patchObj);
    const resData = {
      message: "Category Successfully Updated.",
      category: categoryData,
    };
    sendResponse(res, resData);
  } catch (err) {
    console.error("There was an error: ", err); 
    sendError(res, err);
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { ids } = req.body;
    const idFilter = ids.map((id) => `"${id}"`).join(",");

    const categories = await Category.deleteCategory(idFilter);
    const resData = { message: "Category(ies) Deleted Successfully.", categories };

    sendResponse(res, resData);
  } catch (err) {
    console.error("There was an error: ", err); 
    sendError(res, err);
  }
};
