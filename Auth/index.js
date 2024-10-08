import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser'
import { specs, swaggerUi } from './configs/swagger.js';
import { errorHandler, notFound } from './shared/helper/errorHandler.js';
import db from "./configs/db.js";

import authRoute from "./auth.route.js";
const app = express();

dotenv.config();
const port = process.env.AUTH_PORT;
db();


// const CorsOptions =
// {
//   credentials: true, 
//   origin: "*", 
//   exposedHeaders: ["Access-Control-Allow-Origin"], 
//   // preflightContinue: true,
// }  

const initializeExpress = (app) => {
  //app.use(express.static(path.join(__dirname, "public")));
  app.use(cors());
  app.use(cookieParser())
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  //app.use(morgan("combined", { stream: logger.stream }));
};

initializeExpress(app);

app.use(authRoute);

//app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Your app is running at http://localhost:${port}`);
});
