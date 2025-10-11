import {
  parseDescription,
  capitalizeWords,
} from "../../shared/utils/helperFunctions.js";
import * as PV from "../models/inventoryModel.js";
import { sendError, sendResponse } from "../utils/response.js";
import { makeRequest } from "../utils/helperFunctions.js";

const API_URL = process.env.PGRST_URL || process.env.PGRST_DB_URL;

// Product Varients Table
export const getPVs = async (req, res) => {
  try {
    const api = await PV.getSwaggerDocs();
    const getAllObj = await PV.getAllProductVariants();
    const tableDefinitions = api?.definitions?.product_variants_view;
    let definitions = parseDescription(tableDefinitions.properties);
    definitions.product.description = {
      ...definitions.product.description,
      options: getAllObj?.productOptions,
    };
    definitions.color.description = {
      ...definitions.color.description,
      options: getAllObj?.colorOptions,
    };
    definitions.size.description = {
      ...definitions.size.description,
      options: getAllObj?.sizeOptions,
    };

    const resObj = {
      table: "Product",
      content: getAllObj?.content,
      definitions,
    };

    sendResponse(res, resObj);
  } catch (err) {
    sendError(res, err);
  }
};

export const postPV = async (req, res) => {
  try {
    const { product, size, color, quantity, created_by } = req.body;
    const postObj = {
      product_id: product,
      size_id: size,
      color_id: color,
      quantity,
      created_by,
    };

    const pvData = await PV.createProductVariant(postObj);
    const resData = {
      message: `New Product Varient Successfully Created.`,
      inventory: pvData,
    };

    sendResponse(res, resData);
  } catch (err) {
    sendError(res, err);
  }
};

export const patchPV = async (req, res) => {
  try {
    const { id, product, color, size, quantity, updated_by } = req.body;

    const [proData, colData, sizData] = await Promise.all([
      makeRequest(
        `${API_URL}products?select=id,product&product=eq.${product}`
      ),
      makeRequest(
        `${API_URL}colors?select=id,color&color=eq.${color}`
      ),
      makeRequest(
        `${API_URL}sizes?select=id,size&size=eq.${size}`
      ),
    ]);

    const patchObj = {
      id,
      product_id: proData[0].id,
      color_id: colData[0].id,
      size_id: sizData[0].id,
      quantity,
      updated_by,
    };

    const pvData = PV.updateProductVariant(id, patchObj);
    const resData = {
      message: "Product Variant Successfully Updated.",
      inventory: pvData,
    };
    sendResponse(res, resData);
  } catch (err) {
    sendError(res, err);
  }
};

export const deletePV = async (req, res) => {
  try {
    const { ids } = req.body;
    const idFilter = ids.map((id) => `"${id}"`).join(",");

    const inventory = await PV.deleteProductVariant(idFilter);
    const resData = { message: "Product Variant(s) Deleted Successfully.", inventory };

    sendResponse(res, resData);
  } catch (err) {
    sendError(res, err);
  }
};
