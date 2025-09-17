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

// Update User Account

// Users Table
router.get("/users", async (req, res) => {
  try {
    const swaggerDocs = await fetch(process.env.PGRST_DB_URL);
    const api = await swaggerDocs.json();
    const content = await makeRequest(`${process.env.PGRST_DB_URL}users_view`);

    const tableDefinitions = api.definitions?.users_view;
    const definitions = parseDescription(tableDefinitions.properties);

    res.status(200).json({
      table: "User",
      content,
      definitions,
    });
  } catch (err) {
    console.error("Error Fetching Users: ", err);
    if (err.status) {
      res.status(err.status).json(err);
    }
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/users", async (req, res) => {
  try {
    const { first_name, last_name, email, role, created_by } = req.body;
    const password_hash = await bcrypt.hash(
      first_name.toLowerCase() + last_name.toLowerCase(),
      10
    );
    const postObj = {
      first_name: capitalizeWords(first_name),
      last_name: capitalizeWords(last_name),
      email,
      password: password_hash,
      role,
      created_by,
    };
    const data = await makeRequest(`${process.env.PGRST_DB_URL}users`, {
      method: "POST",
      body: JSON.stringify(postObj),
    });

    res.status(201).json({
      message: `New User \'${data[0].first_name} ${data[0].last_name}\' Successfully Created.`,
      user: data[0],
    });
  } catch (err) {
    console.error("Error Creating User: ", err);
    if (err.status) {
      res.status(err.status).json(err);
    }
    res.status(500).json({ message: "Server Error" });
  }
});

router.patch("/users", async (req, res) => {
  try {
    let putObj = {};
    const {
      id,
      first_name,
      last_name,
      email,
      role,
      currentPassword,
      newPassword,
      updated_by,
    } = req.body;
    if (!currentPassword && !newPassword) {
      const firstName = capitalizeWords(first_name);
      const lastName = capitalizeWords(last_name);

      putObj = {
        id,
        first_name: firstName,
        last_name: lastName,
        email,
        role,
        updated_by,
      };
    } else if (currentPassword && newPassword) {
      const userData = await makeRequest(
        `${process.env.PGRST_DB_URL}users?id=eq.${id}`
      );
      const user = userData[0];
      const resData = {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
      };
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ message: "Current Password Is Incorrect.", user: resData });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      putObj = {
        password: hashedPassword,
        updated_by: id,
      };
    } else {
      return res
        .status(400)
        .json({
          message: "Both Current And New Password Are Required.",
          user: resData,
        });
    }
    const updatedUser = await makeRequest(
      `${process.env.PGRST_DB_URL}users?id=eq.${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(putObj),
      }
    );
    console.log(putObj, updatedUser);

    let referer = req.headers.referer || "";
    let pathname = "";

    //If the request comes from the /account route then the user cookie will update
    if (referer?.includes("/account")) {
      referer = new URL(referer);
      pathname = referer.pathname;
      if (pathname.startsWith("/account/")) {
        pathname = pathname.replace("/account", "");
      }
      
      const userCookie = {
        id: updatedUser[0].id,
        firstName: updatedUser[0].first_name,
        lastName: updatedUser[0].last_name,
        email: updatedUser[0].email,
        role: updatedUser[0].role,
      };
      res.cookie("user", JSON.stringify(userCookie), {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
    }
    let message = `Your ${capitalizeWords(pathname.substring(1))} Has Been Updated.`;
    res.status(200).json({
      message: referer.includes("/users") ? "User Successfully Updated." : message,
      user: updatedUser[0],
    });
  } catch (err) {
    console.error("Error Updating User: ", err);
    if (err.status) {
      res.status(err.status).json(err);
    }
    res.status(500).json({ message: "Server Error" });
  }
});

router.delete("/users", async (req, res) => {
  try {
    const { ids } = req.body;

    const idFilter = ids.map((id) => `"${id}"`).join(",");
    const deleted = await makeRequest(
      `${process.env.PGRST_DB_URL}users?id=in.(${idFilter})`,
      {
        method: "DELETE",
        headers: { Prefer: "return=representation" },
      }
    );

    res.status(200).json({ message: "User(s) Deleted Successfully.", deleted });
  } catch (err) {
    console.error("Error Deleting User(s): ", err);
    if (err.status) {
      res.status(err.status).json(err);
    }
    res.status(500).json({ message: "Server Error" });
  }
});

// Colors Table
router.get("/colors", async (req, res) => {
  try {
    const swaggerDocs = await fetch(process.env.PGRST_DB_URL);
    const api = await swaggerDocs.json();
    const content = await makeRequest(`${process.env.PGRST_DB_URL}colors_view`);

    const tableDefinitions = api.definitions?.colors_view;
    const definitions = parseDescription(tableDefinitions.properties);

    res.status(200).json({
      table: "Color",
      content,
      definitions,
    });
  } catch (err) {
    console.error("Error Fetching Colors: ", err);
    if (err.status) {
      res.status(err.status).json(err);
    }
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/colors", async (req, res) => {
  try {
    const { color } = req.body;
    const postObj = {
      ...req.body,
      color: capitalizeWords(color),
    };
    const data = await makeRequest(`${process.env.PGRST_DB_URL}colors`, {
      method: "POST",
      body: JSON.stringify(postObj),
    });

    res.status(201).json({
      message: `New Color \'${data[0].color}\' Successfully Created.`,
      color: data[0],
    });
  } catch (err) {
    console.error("Error Creating Color: ", err);
    if (err.status) {
      res.status(err.status).json(err);
    }
    res.status(500).json({ message: "Server Error" });
  }
});

router.patch("/colors", async (req, res) => {
  try {
    const { id, color, updated_by } = req.body;
    const patchObj = {
      id,
      color: capitalizeWords(color),
      updated_by,
    };

    const data = await makeRequest(
      `${process.env.PGRST_DB_URL}colors?id=eq.${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(patchObj),
      }
    );

    res.status(200).json({
      message: "Color Successfully Updated.",
      color: data[0],
    });
  } catch (err) {
    console.error("Error Updating Color: ", err);
    if (err.status) {
      res.status(err.status).json(err);
    }
    res.status(500).json({ message: "Server Error" });
  }
});

router.delete("/colors", async (req, res) => {
  try {
    const { ids } = req.body;
    const idFilter = ids.map((id) => `"${id}"`).join(",");
    const deleted = await makeRequest(
      `${process.env.PGRST_DB_URL}colors?id=in.(${idFilter})`,
      {
        method: "DELETE",
        headers: { Prefer: "return=representation" },
      }
    );

    res
      .status(200)
      .json({ message: "Color(s) Deleted Successfully.", deleted });
  } catch (err) {
    console.error("Error Deleting Color(s): ", err);
    if (err.status) {
      res.status(err.status).json(err);
    }
    res.status(500).json({ message: "Server Error" });
  }
});

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
