import express from "express";
import cors from "cors";
import { authenticateJWT } from "../jwtAuto/autoMation.js";
import { authProductId, authBuy } from "../auths/auth.js";
import {
  authPurchase,
  authPurchasePost,
  authPurchaseDelete,
  authPurchaseAdd,
} from "../auths/authPurchase.js";

const route = express.Router();
// Middleware for CORS
route.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);

// Product Route - Uses the Barcode ID
route.get("/api/product/:id", authProductId);

route.post("/api/buy/product", authenticateJWT, authBuy);

// Display All Product User Buying
route.get("/api/buy/purchases", authenticateJWT, authPurchase);

// Delete Product From DataBase
route.delete(
  "/api/buy/purchases/:idProduct",
  authenticateJWT,
  authPurchaseDelete
);

// Add Product Count in DataBase
route.put("/api/buy/purchases/:id", authenticateJWT, authPurchaseAdd);

// Add More Product (This route seems redundant/confusing with the PUT route above. Keeping it for compatibility.)
route.post("/api/buy/purchases/:idProduct", authenticateJWT, authPurchasePost);

export default route;
