import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import bodyParser from "body-parser";

import { specs, swaggerUi } from "./configs/swagger.js";
import { errorHandler } from "./shared/helper/errorHandler.js";
import db from "./configs/db.js";

import productRoute from "./routes/product.route.js";
const app = express();

// app.use(
//   cors({
//     origin: "*",
//   })
// );
dotenv.config();
const port = process.env.PRODUCT_PORT;
// const port = 3006

db();

const initializeExpress = (app) => {
  //app.use(express.static(path.join(__dirname, "public")));
  app.use(cors({}));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  //app.use(morgan("combined", { stream: logger.stream }));
};

initializeExpress(app);

app.use(productRoute);
app.use("/cc", function (req, res) {
  res.send("Hello World!");
})

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

//app.use(notFound);
app.use(errorHandler);
app.listen(port, () => {
  console.log(`Your app is running at http://localhost:${port}`);
});
