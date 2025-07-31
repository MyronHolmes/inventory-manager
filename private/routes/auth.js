import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import express, { response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { capitalizeWords, parseDescription } from "../../src/utils/format.js";
import { makeRequest } from "../../src/utils/fetchHelpers.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Register User
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Missing email or password" });

  const password_hash = await bcrypt.hash(password, 10);

  let bodyObj = {
    ...req.body,
    password: password_hash,
  };

  try {
    const response = await fetch(`${process.env.PGRST_DB_URL}users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(bodyObj),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(error);
      return res.status(response.status).json(error);
    }

    const newUser = await response.json();
    res.status(201).json({ message: "User created", user: newUser[0] });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login User
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Missing email or password" });

  try {
    const response = await fetch(
      `${process.env.PGRST_DB_URL}users?email=eq.${encodeURIComponent(email)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    if (!response.ok) {
      return res
        .status(response.status)
        .json({ message: "User lookup failed" });
    }

    const users = await response.json();
    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = users[0];
    const userCookie = {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
    };
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });
    return res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
      })
      .cookie("user", JSON.stringify(userCookie), {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
      })
      .status(200)
      .json({ message: "Login successful", user: userCookie });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Logout User
router.post("/logout", (req, res) => {
  return res
    .clearCookie("user", {
      path: "/",
      sameSite: "Strict",
      secure: process.env.NODE_ENV === "production",
    })
    .clearCookie("token", {
      path: "/",
      httpOnly: true,
      sameSite: "Strict",
      secure: process.env.NODE_ENV === "production",
    })
    .status(200)
    .json({ message: "Logged out successfully" });
});

// Users Table
router.get("/users", async (req, res) => {
  try {
    const response = await fetch(`${process.env.PGRST_DB_URL}users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(error);

      return res.status(response.status).json(error);
    }

    const data = await response.json();

    res.status(200).json({ users: data });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Colors Table
router.get("/colors", async (req, res) => {
  try {
    const response = await fetch(`${process.env.PGRST_DB_URL}colors`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Failed to fetch colors: ", error);

      return res.status(response.status).json(error);
    }

    const data = await response.json();

    res.status(200).json({ colors: data });
  } catch (err) {
    console.error("Error fetching colors: ", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/colors", async (req, res) => {
  const { color } = req.body;
  const postObj = {
    ...req.body,
    color: capitalizeWords(color),
  };
  try {
    const response = await fetch(`${process.env.PGRST_DB_URL}colors`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(postObj),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Failed to create color: ", error);
      return res.status(response.status).json(error);
    }

    const newColor = await response.json();
    res.status(201).json({
      message: `New color \'${newColor[0].color}\' successfully created.`,
      user: newColor[0],
    });
  } catch (err) {
    console.error("Error creating color: ", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/colors", async (req, res) => {
  const { id, color, updated_by } = req.body;
  const postObj = {
    id,
    color: capitalizeWords(color),
    updated_by,
  };

  try {
    const response = await fetch(
      `${process.env.PGRST_DB_URL}colors?id=eq.${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(postObj),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Failed to update color: ", error);
      return res.status(response.status).json(error);
    }

    const newColor = await response.json();
    res.status(201).json({
      message: `Color successfully updated to \'${newColor[0].color}\'.`,
      user: newColor[0],
    });
  } catch (err) {
    console.error("Error updating color: ", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/colors", async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "No IDs provided" });
  }

  const idFilter = ids.map((id) => `"${id}"`).join(",");

  try {
    const response = await fetch(
      `${process.env.PGRST_DB_URL}colors?id=in.(${idFilter})`,
      {
        method: "DELETE",
        headers: {
          Prefer: "return=representation",
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to delete color(s): ", error);
      return res.status(response.status).json(error);
    }

    const deleted = await response.json();

    res
      .status(200)
      .json({ message: "Color(s) deleted successfully.", deleted });
  } catch (err) {
    console.error("Error deleting color(s): ", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Categories Table
router.get("/categories", async (req, res) => {
  try {
    const response = await fetch(`${process.env.PGRST_DB_URL}categories`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Failed to fetch categories: ", error);

      return res.status(response.status).json(error);
    }

    const data = await response.json();

    res.status(200).json({ categories: data });
  } catch (err) {
    console.error("Error fetching categories: ", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/categories", async (req, res) => {
  const { category } = req.body;
  const postObj = {
    ...req.body,
    category: capitalizeWords(category),
  };
  try {
    const response = await fetch(`${process.env.PGRST_DB_URL}categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(postObj),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Failed to create category: ", error);
      return res.status(response.status).json(error);
    }

    const data = await response.json();
    res.status(201).json({
      message: `New category \'${data[0].category}\' successfully created.`,
      category: data[0],
    });
  } catch (err) {
    console.error("Error creating category: ", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/categories", async (req, res) => {
  const { id, category, updated_by } = req.body;
  const postObj = {
    id,
    category: capitalizeWords(category),
    updated_by,
  };

  try {
    const response = await fetch(
      `${process.env.PGRST_DB_URL}categories?id=eq.${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(postObj),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Failed to update category: ", error);
      return res.status(response.status).json(error);
    }

    const data = await response.json();
    res.status(201).json({
      message: `Category successfully updated to \'${data[0].category}\'.`,
      category: data[0],
    });
  } catch (err) {
    console.error("Error updating category: ", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/categories", async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "No IDs provided" });
  }

  const idFilter = ids.map((id) => `"${id}"`).join(",");

  try {
    const response = await fetch(
      `${process.env.PGRST_DB_URL}categories?id=in.(${idFilter})`,
      {
        method: "DELETE",
        headers: {
          Prefer: "return=representation",
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to delete category(s): ", error);
      return res.status(response.status).json(error);
    }

    const deleted = await response.json();

    res
      .status(200)
      .json({ message: "Category(s) deleted successfully.", deleted });
  } catch (err) {
    console.error("Error deleting category(s): ", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Sizes Table
router.get("/sizes", async (req, res) => {
  try {
    const response = await fetch(`${process.env.PGRST_DB_URL}sizes`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Failed to fetch sizes: ", error);

      return res.status(response.status).json(error);
    }

    const data = await response.json();

    res.status(200).json({ sizes: data });
  } catch (err) {
    console.error("Error fetching sizes: ", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/sizes", async (req, res) => {
  const { size } = req.body;
  const postObj = {
    ...req.body,
    size: capitalizeWords(size),
  };
  try {
    const response = await fetch(`${process.env.PGRST_DB_URL}sizes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(postObj),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Failed to create size: ", error);
      return res.status(response.status).json(error);
    }

    const data = await response.json();
    res.status(201).json({
      message: `New size \'${data[0].size}\' successfully created.`,
      size: data[0],
    });
  } catch (err) {
    console.error("Error creating size: ", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/sizes", async (req, res) => {
  const { id, size, updated_by } = req.body;
  const postObj = {
    id,
    size: capitalizeWords(size),
    updated_by,
  };

  try {
    const response = await fetch(
      `${process.env.PGRST_DB_URL}sizes?id=eq.${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(postObj),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Failed to update size: ", error);
      return res.status(response.status).json(error);
    }

    const data = await response.json();
    res.status(201).json({
      message: `Size successfully updated to \'${data[0].size}\'.`,
      size: data[0],
    });
  } catch (err) {
    console.error("Error updating size: ", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/sizes", async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "No IDs provided" });
  }

  const idFilter = ids.map((id) => `"${id}"`).join(",");

  try {
    const response = await fetch(
      `${process.env.PGRST_DB_URL}sizes?id=in.(${idFilter})`,
      {
        method: "DELETE",
        headers: {
          Prefer: "return=representation",
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to delete size(s): ", error);
      return res.status(response.status).json(error);
    }

    const deleted = await response.json();

    res.status(200).json({ message: "Size(s) deleted successfully.", deleted });
  } catch (err) {
    console.error("Error deleting size(s): ", err);
    res.status(500).json({ message: "Server error" });
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
    console.error("Error fetching products: ", err);
    if (err.status) {
      res.status(err.status).json(err);
    }
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/products", async (req, res) => {
  try {
    const { product, description, category, quantity, status, created_by } =
      req.body;
    const postObj = {
      product: capitalizeWords(product),
      description,
      category_id: category,
      quantity,
      status,
      created_by
    };

    const data = await makeRequest(`${process.env.PGRST_DB_URL}products`, {
      method: "POST",
      body: JSON.stringify(postObj),
    });

    res.status(201).json({
      message: `New product \'${data[0].product}\' successfully created.`,
      product: data[0],
    });
  } catch (err) {
    console.error("Error creating product: ", err);
    if (err.status) {
      res.status(err.status).json(err);
    }
    res.status(500).json({ message: "Server Error" });
  }
});

router.put("/products", async (req, res) => {
  try {
    const { id, product, description, category, status, quantity, updated_by } = req.body;

    const catData = await makeRequest(
      `${process.env.PGRST_DB_URL}categories?select=id,category&category=eq.${category}`
    );
    if (!catData) {
      return res
        .status(400)
        .json({ message: `Category '${category}' not found` });
    }
    console.log(catData);
    const postObj = {
      id,
      product: capitalizeWords(product),
      category_id: catData[0].id,
      description,
      quantity,
      status: status,
      updated_by: updated_by,
    };

    const data = await makeRequest(
      `${process.env.PGRST_DB_URL}products?id=eq.${id}`,
      {
        method: "PUT",
        body: JSON.stringify(postObj),
      }
    );

    res.status(200).json({
      message: "Product successfully updated.",
      product: data[0],
    });
  } catch (err) {
    console.error("Error updating product: ", err);
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
      .json({ message: "Product(s) deleted successfully.", deleted });
  } catch (err) {
    console.error("Error deleting product(s): ", err);
    if (err.status) {
      res.status(err.status).json(err);
    }
    res.status(500).json({ message: "Server Error" });
  }
});

// Product Variants Table
router.get("/inventory", async (req, res) => {
  try {
    const [inventory, products, colors, sizes] = await Promise.all([
      makeRequest(`${process.env.PGRST_DB_URL}product_variants_view`),
      makeRequest(`${process.env.PGRST_DB_URL}products?select=id,product`),
      makeRequest(`${process.env.PGRST_DB_URL}colors?select=id,color`),
      makeRequest(`${process.env.PGRST_DB_URL}sizes?select=id,size`),
    ]);

    res.status(200).json({
      inventory,
      products,
      colors,
      sizes,
    });
  } catch (err) {
    console.error("Error fetching inventory: ", err);
    if (err.status) {
      res.status(err.status).json(err);
    }
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/inventory", async (req, res) => {
  try {
    const { product, color, size, quantity, createdBy } = req.body;
    const postObj = {
      product_id: product,
      color_id: color,
      size_id: size,
      quantity,
      created_by: createdBy,
    };
    console.log(postObj);
    const data = await makeRequest(
      `${process.env.PGRST_DB_URL}product_variants`,
      {
        method: "POST",
        body: JSON.stringify(postObj),
      }
    );
    console.log(data);

    res.status(201).json({
      message: `New product variant successfully created.`,
      product: data[0],
    });
  } catch (err) {
    console.error("Error creating product variant: ", err);
    if (err.status) {
      res.status(err.status).json(err);
    }
    res.status(500).json({ message: "Server Error" });
  }
});

router.put("/inventory", async (req, res) => {
  try {
    const { id, product, color, size, quantity, updatedBy } = req.body;

    const [prodData, colorData, sizeData] = await Promise.all([
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
      product_id: prodData[0].id,
      color_id: colorData[0].id,
      size_id: sizeData[0].id,
      quantity,
      updated_by: updatedBy,
    };

    const data = await makeRequest(
      `${process.env.PGRST_DB_URL}product_variants?id=eq.${id}`,
      {
        method: "PUT",
        body: JSON.stringify(postObj),
      }
    );

    res.status(200).json({
      message: `Product Varient successfully updated.`,
      product: data[0],
    });
  } catch (err) {
    console.error("Error updating product variant: ", err);
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
      .json({ message: "Product Variant(s) deleted successfully.", deleted });
  } catch (err) {
    console.error("Error deleting product variant(s): ", err);
    if (err.status) {
      res.status(err.status).json(err);
    }
    res.status(500).json({ message: "Server Error" });
  }
});
export default router;
