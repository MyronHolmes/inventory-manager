import express from "express";
import {
  deleteCategory,
  getCategories,
  patchCategory,
  postCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

// Get Categories
router.get("/categories", getCategories);

// Post Categories
router.post("/categories", postCategory);

// Patch Categories
router.patch("/categories", patchCategory);

// Delete Categories
router.delete("/categories", deleteCategory);

export default router;
