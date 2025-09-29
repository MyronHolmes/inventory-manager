import {
  parseDescription,
  capitalizeWords,
} from "../../shared/utils/helperFunctions.js";
import * as Size from "../models/sizeModel.js";
import { sendError, sendResponse } from "../utils/response.js";

// Sizes Table
export const getSizes = async (req, res) => {
  try {
    const api = await Size.getSwaggerDocs();
    const content = await Size.getAllSizes();
    const tableDefinitions = api?.definitions?.sizes_view;
    const definitions = parseDescription(tableDefinitions.properties);
    const resObj = {
      table: "Size",
      content,
      definitions,
    };

    sendResponse(res, resObj);
  } catch (err) {
    sendError(res, err);
  }
};

export const postSize = async (req, res) => {
  try {
    const { size } = req.body;
    const postObj = {
      ...req.body,
      size: capitalizeWords(size),
    };

    const sizeData = await Size.createSize(postObj);
    const resData = {
      message: `New Size \'${sizeData.size}\' Successfully Created.`,
      size: sizeData,
    };

    sendResponse(res, resData);
  } catch (err) {
    sendError(res, err);
  }
};

export const patchSize = async (req, res) => {
  try {
    const { id, size, updated_by } = req.body;
    const patchObj = {
      id,
      size: capitalizeWords(size),
      updated_by,
    };

    const sizeData = Size.updateSize(id, patchObj);
    const resData = {
      message: "Size Successfully Updated.",
      size: sizeData,
    };
    sendResponse(res, resData);
  } catch (err) {
    sendError(res, err);
  }
};

export const deleteSize = async (req, res) => {
  try {
    const { ids } = req.body;
    const idFilter = ids.map((id) => `"${id}"`).join(",");

    const size = await Size.deleteSize(idFilter);
    const resData = { message: "Size(s) Deleted Successfully.", size };

    sendResponse(res, resData);
  } catch (err) {
    sendError(res, err);
  }
};
