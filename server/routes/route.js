import express from "express";
import cors from "cors";
import {
  authPageOne, // Renamed to handle the single product endpoint
  authAbout,
  authAboutPost,
  fetchAllProductData,
} from "../auths/auth.js";
import { authenticateJWT } from "../jwtAuto/autoMation.js";

const route = express.Router();

// Middleware for CORS
route.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);

// Middleware for error handling
// NOTE: This should typically be the last middleware in your stack.
route.use((error, req, res, next) => {
  console.error("Error:", error);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

// Home route
route.get("/", (req, res) => {
  res.json({ success: true, message: "Home Page" });
});
// About Page Route
route.get("/api/about", authAbout);
route.post("/api/about/Report", authenticateJWT, authAboutPost);
route.get("/api/shopping", fetchAllProductData);
// Specialty Product Routes Api - CONSOLIDATED/REMOVED
// Only keeping the first one, which now serves the single product data.
route.get("/api/v1", authPageOne);

export default route;
