import express from "express";
import {
  deleteColor,
  getColors,
  patchColor,
  postColor,
} from "../controllers/colorController.js";

const router = express.Router();

// Get Colors
router.get("/colors", getColors);

// Post Colors
router.post("/colors", postColor);

// Patch Colors
router.patch("/colors", patchColor);

// Delete Colors
router.delete("/colors", deleteColor);

export default router;
