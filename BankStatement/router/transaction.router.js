import TransactionController from "../controller/transaction.controller.js";

import express from "express";
const transactionRouter = express.Router();

transactionRouter.get("/", TransactionController.getAllTransaction);
// transactionRouter.get("/:id", TransactionController.getTransactionById);
// transactionRouter.get(
//   "/shop/:shopId",
//   TransactionController.getTransactionByShopId
// );
transactionRouter.get("/filter", TransactionController.filterTransaction);
transactionRouter.post("/", TransactionController.create);

export default transactionRouter;
