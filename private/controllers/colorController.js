import {
  parseDescription,
  capitalizeWords,
} from "../../shared/utils/helperFunctions.js";
import * as Color from "../models/colorModel.js";
import { sendError, sendResponse } from "../utils/response.js";

// Colors Table
export const getColors = async (req, res) => {
  try {
    const api = await Color.getSwaggerDocs();
    const content = await Color.getAllColors();
    const tableDefinitions = api?.definitions?.colors_view;
    const definitions = parseDescription(tableDefinitions.properties);
    const resObj = {
      table: "Color",
      content,
      definitions,
    };

    sendResponse(res, resObj);
  } catch (err) {
    sendError(res, err);
  }
};

export const postColor = async (req, res) => {
  try {
    const { color } = req.body;
    const postObj = {
      ...req.body,
      color: capitalizeWords(color),
    };

    const colorData = await Color.createColor(postObj);
    const resData = {
      message: `New Color \'${colorData.color}\' Successfully Created.`,
      color: colorData,
    };

    sendResponse(res, resData);
  } catch (err) {
    sendError(res, err);
  }
};

export const patchColor = async (req, res) => {
  try {
    const { id, color, updated_by } = req.body;
    const patchObj = {
      id,
      color: capitalizeWords(color),
      updated_by,
    };

    const colorData = Color.updateColor(id, patchObj);
    const resData = {
      message: "Color Successfully Updated.",
      color: colorData,
    };
    sendResponse(res, resData);
  } catch (err) {
    sendError(res, err);
  }
};

export const deleteColor = async (req, res) => {
  try {
    const { ids } = req.body;
    const idFilter = ids.map((id) => `"${id}"`).join(",");

    const colors = await Color.deleteColor(idFilter);
    const resData = { message: "Color(s) Deleted Successfully.", colors };

    sendResponse(res, resData);
  } catch (err) {
    sendError(res, err);
  }
};
