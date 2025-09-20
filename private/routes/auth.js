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

// Categories Table
router.get("/categories", async (req, res) => {
  try {
    const swaggerDocs = await fetch(process.env.PGRST_DB_URL);
    const api = await swaggerDocs.json();
    const content = await makeRequest(
      `${process.env.PGRST_DB_URL}categories_view`
    );

    const tableDefinitions = api.definitions?.categories_view;
    const definitions = parseDescription(tableDefinitions.properties);

    res.status(200).json({
      table: "Category",
      content,
      definitions,
    });
  } catch (err) {
    console.error("Error Fetching Category: ", err);
    if (err.status) {
      res.status(err.status).json(err);
    }
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/categories", async (req, res) => {
  try {
    const { category } = req.body;
    const postObj = {
      ...req.body,
      category: capitalizeWords(category),
    };
    const data = await makeRequest(`${process.env.PGRST_DB_URL}categories`, {
      method: "POST",
      body: JSON.stringify(postObj),
    });

    res.status(201).json({
      message: `New Category \'${data[0].category}\' Successfully Created.`,
      category: data[0],
    });
  } catch (err) {
    console.error("Error Creating Category: ", err);
    if (err.status) {
      res.status(err.status).json(err);
    }
    res.status(500).json({ message: "Server Error" });
  }
});

router.patch("/categories", async (req, res) => {
  try {
    const { category, id, updated_by } = req.body;
    const patchObj = {
      id,
      category: capitalizeWords(category),
      updated_by,
    };

    const data = await makeRequest(
      `${process.env.PGRST_DB_URL}categories?id=eq.${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(patchObj),
      }
    );

    res.status(200).json({
      message: "Category Successfully Updated.",
      category: data[0],
    });
  } catch (err) {
    console.error("Error Updating Category: ", err);
    if (err.status) {
      res.status(err.status).json(err);
    }
    res.status(500).json({ message: "Server Error" });
  }
});

router.delete("/categories", async (req, res) => {
  try {
    const { ids } = req.body;
    const idFilter = ids.map((id) => `"${id}"`).join(",");
    const deleted = await makeRequest(
      `${process.env.PGRST_DB_URL}categories?id=in.(${idFilter})`,
      {
        method: "DELETE",
        headers: { Prefer: "return=representation" },
      }
    );

    res
      .status(200)
      .json({ message: "Category(ies) Deleted Successfully.", deleted });
  } catch (err) {
    console.error("Error Deleting Category(ies): ", err);
    if (err.status) {
      res.status(err.status).json(err);
    }
    res.status(500).json({ message: "Server Error" });
  }
});

// Sizes Table
router.get("/sizes", async (req, res) => {
  try {
    const swaggerDocs = await fetch(process.env.PGRST_DB_URL);
    const api = await swaggerDocs.json();
    const content = await makeRequest(`${process.env.PGRST_DB_URL}sizes_view`);

    const tableDefinitions = api.definitions?.sizes_view;
    const definitions = parseDescription(tableDefinitions.properties);

    res.status(200).json({
      table: "Size",
      content,
      definitions,
    });
  } catch (err) {
    console.error("Error Fetching Size: ", err);
    if (err.status) {
      res.status(err.status).json(err);
    }
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/sizes", async (req, res) => {
  try {
    const { size } = req.body;
    const postObj = {
      ...req.body,
      size: capitalizeWords(size),
    };
    const data = await makeRequest(`${process.env.PGRST_DB_URL}sizes`, {
      method: "POST",
      body: JSON.stringify(postObj),
    });

    res.status(201).json({
      message: `New Size \'${data[0].size}\' Successfully Created.`,
      size: data[0],
    });
  } catch (err) {
    console.error("Error Creating Size: ", err);
    if (err.status) {
      res.status(err.status).json(err);
    }
    res.status(500).json({ message: "Server Error" });
  }
});

router.patch("/sizes", async (req, res) => {
  try {
    const { size, id, updated_by } = req.body;
    const patchObj = {
      id,
      size: capitalizeWords(size),
      updated_by,
    };

    const data = await makeRequest(
      `${process.env.PGRST_DB_URL}sizes?id=eq.${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(patchObj),
      }
    );

    res.status(200).json({
      message: "Size Successfully Updated.",
      size: data[0],
    });
  } catch (err) {
    console.error("Error Updating Size: ", err);
    if (err.status) {
      res.status(err.status).json(err);
    }
    res.status(500).json({ message: "Server Error" });
  }
});

router.delete("/sizes", async (req, res) => {
  try {
    const { ids } = req.body;
    const idFilter = ids.map((id) => `"${id}"`).join(",");
    const deleted = await makeRequest(
      `${process.env.PGRST_DB_URL}sizes?id=in.(${idFilter})`,
      {
        method: "DELETE",
        headers: { Prefer: "return=representation" },
      }
    );

    res.status(200).json({ message: "Size(s) Deleted Successfully.", deleted });
  } catch (err) {
    console.error("Error Deleting Size(s): ", err);
    if (err.status) {
      res.status(err.status).json(err);
    }
    res.status(500).json({ message: "Server Error" });
  }
});

// Products Table
router.get("/products", async (req, res) => {
  try {
    const swaggerDocs = await fetch(process.env.PGRST_DB_URL);
    const api = await swaggerDocs.json();
    const tableDefinitions = api.definitions?.products_view;

    const [categoryOptions, content] = await Promise.all([
      makeRequest(`${process.env.PGRST_DB_URL}categories?select=id,category`),
      makeRequest(`${process.env.PGRST_DB_URL}products_view`),
    ]);

    let definitions = parseDescription(tableDefinitions.properties);
    definitions.category.description = {
      ...definitions.category.description,
      options: categoryOptions,
    };

    res.status(200).json({
      table: "Product",
      content,
      definitions,
    });
  } catch (err) {
    console.error("Error Fetching Products: ", err);
    if (err.status) {
      res.status(err.status).json(err);
    }
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/products", async (req, res) => {
  try {
    const { product, category, description, quantity, status, created_by } =
      req.body;
    const postObj = {
      product: capitalizeWords(product),
      category_id: category,
      description,
      quantity,
      status,
      created_by,
    };

    const data = await makeRequest(`${process.env.PGRST_DB_URL}products`, {
      method: "POST",
      body: JSON.stringify(postObj),
    });

    res.status(201).json({
      message: `New Product \'${data[0].product}\' Successfully Created.`,
      product: data[0],
    });
  } catch (err) {
    console.error("Error Creating Product: ", err);
    if (err.status) {
      res.status(err.status).json(err);
    }
    res.status(500).json({ message: "Server Error" });
  }
});

router.patch("/products", async (req, res) => {
  try {
    const { id, product, description, category, status, quantity, updated_by } =
      req.body;

    const catData = await makeRequest(
      `${process.env.PGRST_DB_URL}categories?select=id,category&category=eq.${category}`
    );
    if (!catData) {
      return res
        .status(400)
        .json({ message: `Category '${category}' not found` });
    }
    console.log(catData);
    const patchObj = {
      id,
      product: capitalizeWords(product),
      category_id: catData[0].id,
      description,
      quantity,
      status: status,
      updated_by,
    };

    const data = await makeRequest(
      `${process.env.PGRST_DB_URL}products?id=eq.${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(patchObj),
      }
    );

    res.status(200).json({
      message: "Product Successfully Updated.",
      product: data[0],
    });
  } catch (err) {
    console.error("Error Updating Product: ", err);
    if (err.status) {
      res.status(err.status).json(err);
    }
    res.status(500).json({ message: "Server Error" });
  }
});

router.delete("/products", async (req, res) => {
  try {
    const { ids } = req.body;

    const idFilter = ids.map((id) => `"${id}"`).join(",");
    const deleted = await makeRequest(
      `${process.env.PGRST_DB_URL}products?id=in.(${idFilter})`,
      {
        method: "DELETE",
        headers: { Prefer: "return=representation" },
      }
    );

    res
      .status(200)
      .json({ message: "Product(s) Deleted Successfully.", deleted });
  } catch (err) {
    console.error("Error Deleting Product(s): ", err);
    if (err.status) {
      res.status(err.status).json(err);
    }
    res.status(500).json({ message: "Server Error" });
  }
});

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
