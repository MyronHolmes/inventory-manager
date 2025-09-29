import express from "express";
import {
  deleteSize,
  getSizes,
  patchSize,
  postSize,
} from "../controllers/sizeController.js";

const router = express.Router();

// Get Sizes
router.get("/sizes", getSizes);

// Post Sizes
router.post("/sizes", postSize);

// Patch Sizes
router.patch("/sizes", patchSize);

// Delete Sizes
router.delete("/sizes", deleteSize);

export default router;
