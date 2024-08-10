import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
import multer from "multer";

import { specs, swaggerUi } from "./configs/swagger.js";
import { errorHandler, notFound } from "./shared/helper/errorHandler.js";
import db from "./configs/db.js";

import widgetRoute from "./routes/widget.route.js";
import collectionTypeRoute from "./routes/collectionType.route.js";
import templateRoute from "./routes/template.route.js";
const app = express();

dotenv.config();
const port = process.env.WIDGET_PORT;
db();

const initializeExpress = (app) => {
  app.use(bodyParser());
  //app.use(express.static(path.join(__dirname, "public")));
  //app.use(cors(corsOptions));
  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // const upload = multer({
  //   limits: { fileSize: 50 * 1024 * 1024 } // 50MB
  // });

  // app.use(upload.any());
  //app.use(morgan("combined", { stream: logger.stream }));
};

initializeExpress(app);

app.use(widgetRoute);
app.use(collectionTypeRoute);
app.use(templateRoute);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use(notFound);
app.use(errorHandler);
app.listen(port, () => {
  console.log(`Your app is running at http://localhost:${port}`);
});
