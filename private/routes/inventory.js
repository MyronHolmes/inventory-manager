import express from "express";
import {
  deletePV,
  getPVs,
  patchPV,
  postPV,
} from "../controllers/inventoryController.js";

const router = express.Router();

// Get Product Variants
router.get("/inventory", getPVs);

// Post Product Variant
router.post("/inventory", postPV);

// Patch Product Variant
router.patch("/inventory", patchPV);

// Delete Product Variant
router.delete("/inventory", deletePV);

export default router;
