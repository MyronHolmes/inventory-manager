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
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import colorRoutes from "./routes/colors.js";
import categoryRoutes from "./routes/categories.js";


const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(bodyParser.json());
app.set("trust proxy", 1);

// User Route
app.use("/api", userRoutes);

// Color Route
app.use("/api", colorRoutes);

// Category Route
app.use("/api", categoryRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Auth backend is running");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
