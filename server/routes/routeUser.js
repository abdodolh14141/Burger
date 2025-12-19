import express from "express";
import cors from "cors";
import { authenticateJWT } from "../jwtAuto/autoMation.js";
import authUpdateUser, { authUser, authBuy } from "../auths/authUser.js";

const route = express.Router();
// Middleware for CORS
route.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);

// User Routes
route.get("/api/user", authenticateJWT, authUser);
route.put("/api/userEdit", authenticateJWT, authUpdateUser);
route.post("/api/buy", authenticateJWT, authBuy);

export default route;
