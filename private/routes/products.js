import express from "express";
import {
  deleteProduct,
  getProducts,
  patchProduct,
  postProduct,
} from "../controllers/productController.js";

const router = express.Router();

// Get Products
router.get("/products", getProducts);

// Post Products
router.post("/products", postProduct);

// Patch products
router.patch("/products", patchProduct);

// Delete products
router.delete("/products", deleteProduct);

export default router;
