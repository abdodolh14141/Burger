import express from "express";
import cors from "cors";
import { authenticateJWT } from "../jwtAuto/autoMation.js";
import { authRegister, authLogin } from "../auths/authUser.js";
import { authProfile } from "../auths/auth.js";

const route = express.Router();
// Middleware for CORS
route.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);

// Authentication Routes
route.post("/api/register", authRegister);
route.post("/api/login", authLogin);
route.get("/api/profile", authenticateJWT, authProfile);
route.get("/api/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ success: true, message: "Success Logout" });
});

export default route;
