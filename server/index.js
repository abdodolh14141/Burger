import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv/config";
import bodyParser from "body-parser";
import route from "./routes/route.js";
import routeProduct from "./routes/routeProduct.js";
import cookieParser from "cookie-parser";

const PORT = parseInt(process.env.PORT || "4000", 10);

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Mount routes
app.use("/", route);
app.use("/", routeProduct);

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(`Worker ${process.pid} connected to MongoDB`);
  })
  .catch((error) =>
    console.error(`Worker ${process.pid} error connecting to MongoDB:`, error)
  );

app.listen(PORT, () => {
  console.log(`Worker ${process.pid} is running on port ${PORT}`);
});
