import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.resolve(__dirname, ".env") });
console.log("PGRST_DB_URL:", process.env.PGRST_DB_URL);

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import userRoutes from "./routes/users.js";
import colorRoutes from "./routes/colors.js";
import categoryRoutes from "./routes/categories.js";
import sizeRoutes from "./routes/sizes.js";
import productRoutes from "./routes/products.js";
import inventoryRoutes from "./routes/inventory.js";





const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = [
  'http://localhost:5173',           // Local development
  'https://surplus-depot.vercel.app' // Production frontend
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(bodyParser.json());
app.set("trust proxy", 1);

// User Route
app.use("/api", userRoutes);

// Color Route
app.use("/api", colorRoutes);

// Category Route
app.use("/api", categoryRoutes);

// Size Route
app.use("/api", sizeRoutes);

// Product Route
app.use("/api", productRoutes);

// Inventory Route
app.use("/api", inventoryRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Auth backend is running");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
