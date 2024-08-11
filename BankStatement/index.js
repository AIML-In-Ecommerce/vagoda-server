import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { errorHandler, notFound } from "./shared/helper/errorHandler.js";
import db from "./configs/db.js";
import defaultCronJobManager from "./cron_job/cronjob.manager.js";
import rootRouter from "./router/root.router.js";

const app = express();

dotenv.config();
const port = process.env.BANK_STATEMENT_PORT;

db();


const initializeExpress = (app) => {
  //app.use(express.static(path.join(__dirname, "public")));
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  //app.use(morgan("combined", { stream: logger.stream }));
};

initializeExpress(app);

// defaultCronJobManager.start()

//router here
app.use(rootRouter)

app.use(notFound);
app.use(errorHandler);
app.listen(port, () => {
  console.log(`Your app is running at http://localhost:${port}`);
});
