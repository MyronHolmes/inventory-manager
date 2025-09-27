import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import express, { response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { makeRequest, parseDescription, capitalizeWords } from "../../shared/utils/helperFunctions.js"; 

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;


// Product Variants Table
router.get("/inventory", async (req, res) => {
  try {
    const swaggerDocs = await fetch(process.env.PGRST_DB_URL);
    const api = await swaggerDocs.json();
    const tableDefinitions = api.definitions?.product_variants_view;

    const [content, productOptions, colorOptions, sizeOptions] =
      await Promise.all([
        makeRequest(`${process.env.PGRST_DB_URL}product_variants_view`),
        makeRequest(`${process.env.PGRST_DB_URL}products?select=id,product`),
        makeRequest(`${process.env.PGRST_DB_URL}colors?select=id,color`),
        makeRequest(`${process.env.PGRST_DB_URL}sizes?select=id,size`),
      ]);

    let definitions = parseDescription(tableDefinitions.properties);
    definitions.product.description = {
      ...definitions.product.description,
      options: productOptions,
    };
    definitions.color.description = {
      ...definitions.color.description,
      options: colorOptions,
    };
    definitions.size.description = {
      ...definitions.size.description,
      options: sizeOptions,
    };
    res.status(200).json({
      table: "Product Variants",
      content,
      definitions,
    });
  } catch (err) {
    console.error("Error Fetching Product Varients: ", err);
    if (err.status) {
      res.status(err.status).json(err);
    }
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/inventory", async (req, res) => {
  try {
    const { product, size, color, quantity, created_by } = req.body;
    const postObj = {
      product_id: product,
      size_id: size,
      color_id: color,
      quantity,
      created_by,
    };

    const data = await makeRequest(
      `${process.env.PGRST_DB_URL}product_variants`,
      {
        method: "POST",
        body: JSON.stringify(postObj),
      }
    );

    res.status(201).json({
      message: `New Product Variant Successfully Created.`,
      product_variant: data[0],
    });
  } catch (err) {
    console.error("Error Creating Product Variant: ", err);
    if (err.status) {
      res.status(err.status).json(err);
    }
    res.status(500).json({ message: "Server Error" });
  }
});

router.patch("/inventory", async (req, res) => {
  try {
    const { id, product, color, size, quantity, updated_by } = req.body;

    const [proData, colData, sizData] = await Promise.all([
      makeRequest(
        `${process.env.PGRST_DB_URL}products?select=id,product&product=eq.${product}`
      ),
      makeRequest(
        `${process.env.PGRST_DB_URL}colors?select=id,color&color=eq.${color}`
      ),
      makeRequest(
        `${process.env.PGRST_DB_URL}sizes?select=id,size&size=eq.${size}`
      ),
    ]);

    const postObj = {
      id,
      product_id: proData[0].id,
      color_id: colData[0].id,
      size_id: sizData[0].id,
      quantity,
      updated_by,
    };

    const data = await makeRequest(
      `${process.env.PGRST_DB_URL}product_variants?id=eq.${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(postObj),
      }
    );

    res.status(200).json({
      message: "Product Variant Successfully Updated.",
      product_variant: data[0],
    });
  } catch (err) {
    console.error("Error Updating Product Variant: ", err);
    if (err.status) {
      res.status(err.status).json(err);
    }
    res.status(500).json({ message: "Server Error" });
  }
});

router.delete("/inventory", async (req, res) => {
  try {
    const { ids } = req.body;

    const idFilter = ids.map((id) => `"${id}"`).join(",");
    const deleted = await makeRequest(
      `${process.env.PGRST_DB_URL}product_variants?id=in.(${idFilter})`,
      {
        method: "DELETE",
        headers: { Prefer: "return=representation" },
      }
    );

    res
      .status(200)
      .json({ message: "Product Variant(s) Deleted Successfully.", deleted });
  } catch (err) {
    console.error("Error Deleting Product Variant(s): ", err);
    if (err.status) {
      res.status(err.status).json(err);
    }
    res.status(500).json({ message: "Server Error" });
  }
});
export default router;
