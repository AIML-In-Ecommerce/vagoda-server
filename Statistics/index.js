import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import bodyParser from 'body-parser';

import { specs, swaggerUi } from './configs/swagger.js';
import { errorHandler, notFound } from './shared/helper/errorHandler.js';
import db from "./configs/db.js";
import redisConfig from "./configs/redis.config.js";
import router from './routers/statistics.router.js'

const app = express();

dotenv.config();
const port = process.env.STATISTICS_PORT;

db();
// redisConfig()

const initializeExpress = (app) => {
  //app.use(express.static(path.join(__dirname, "public")));
  app.use(cors({}));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  //app.use(morgan("combined", { stream: logger.stream }));
};

initializeExpress(app);

app.use("/statistics", router);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use(notFound);
app.use(errorHandler);
app.listen(port, () => {
  console.log(`Your app is running at http://localhost:${port}`);
});
