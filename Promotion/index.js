import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import bodyParser from "body-parser";

import { specs, swaggerUi } from "./configs/swagger.js";
import { errorHandler, notFound } from "./shared/helper/errorHandler.js";
import db from "./configs/db.js";

import promotionRoute from "./promotion.route.js";
import defaultCronJobController from "./cron_job/cron_job.controller.js";
const app = express();

dotenv.config();
const port = process.env.PROMOTION_PORT;
// const port = 3008;

db();
defaultCronJobController.start()

const initializeExpress = (app) => {
  //app.use(express.static(path.join(__dirname, "public")));
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  //app.use(morgan("combined", { stream: logger.stream }));
};

initializeExpress(app);

app.use(promotionRoute);

app.use(notFound);
app.use(errorHandler);
app.listen(port, () => {
  console.log(`Your app is running at http://localhost:${port}`);
});
