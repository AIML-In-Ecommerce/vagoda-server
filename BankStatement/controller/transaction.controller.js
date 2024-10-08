import TransactionService from "../service/transaction.service.js";
import createError from "http-errors";
import axios from "axios";

const TransactionController = {
  async getAllTransaction(req, res, next) {
    try {
      const filter = req.query;
      const list = await TransactionService.getAll(filter, "");
      if (!list) {
        return next(createError.BadRequest("Transaction list not found"));
      }
      res.json({
        message: "Get transaction list successfully",
        status: 200,
        data: list,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },
  async getTransactionById(req, res, next) {
    try {
      const { id } = req.params;
      const object = await TransactionService.getById(id);
      if (!object) {
        return next(createError.BadRequest("Transaction not found"));
      }
      res.json({
        message: "Get transaction successfully",
        status: 200,
        data: object,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },
  async getTransactionByShopId(req, res, next) {
    try {
      let shopId = req.params.shopId;
      if (shopId) {
        shopId = shopId.toString();
      }
      const object = await TransactionService.getByShopId(shopId);
      if (!object) {
        return next(createError.BadRequest("Transaction not found"));
      }
      res.json({
        message: "Get transaction successfully",
        status: 200,
        data: object,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },
  async filterTransaction(req, res, next) {
    try {
      const { _id, shopId, category, startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      const transactions = await TransactionService.filter(
        _id,
        shopId,
        category,
        start,
        end
      );
      res.json({
        message: "Filter transactions successfully",
        status: 200,
        data: transactions,
      });
    } catch (error) {
      return next(createError.InternalServerError(error.message));
    }
  },
  async create(req, res, next) {
    try {
      const { shop, category, type, description, money } = req.body;
      const shopObject = await TransactionService.getShopById(shop);
      if (!shopObject) {
        return next(createError.BadRequest("Shop not found"));
      }
      const currentBalance = shopObject.wallet.balance;
      const newBalance =
        type === "INCOME" ? currentBalance + money : currentBalance - money;
      if (newBalance < 0) {
        return next(createError.BadRequest("Not enough money"));
      }
      const newTransactionData = {
        shop,
        category,
        type,
        description,
        money,
        balance: newBalance,
      };
      const newTransaction = await TransactionService.create(
        newTransactionData
      );
      //update shop wallet balance
      const newInfoShop = await TransactionService.updateShopBalance(
        shop,
        newBalance
      );
      console.log(newInfoShop);
      res.json({
        message: "Create transaction successfully",
        status: 201,
        data: newTransaction,
      });
    } catch (error) {
      return next(createError.InternalServerError(error.message));
    }
  },
};

export default TransactionController;

// const FileController = {
//     getAll: async (req, res, next) => {
//       try {
//         const filter = req.query;
//         const list = await FileService.getAll(filter, "");
//         if (!list) {
//           return next(createError.BadRequest(Model + " list not found"));
//         }
//         res.json({
//           message: "Get " + model + " list successfully",
//           status: 200,
//           data: list,
//         });
//       } catch (error) {
//         next(createError.InternalServerError(error.message));
//       }
//     },
//     getById: async (req, res, next) => {
//       try {
//         const { id } = req.params;
//         const object = await FileService.getById(id);
//         if (!object) {
//           return next(createError.BadRequest(Model + " not found"));
//         }
//         res.json({
//           message: "Get" + model + "successfully",
//           status: 200,
//           data: object,
//         });
//       } catch (error) {
//         next(createError.InternalServerError(error.message));
//       }
//     },
//     getbyShopId: async (req, res, next) => {
//       try {
//         let shopId = req.params.shopId;
//           if(shopId) {
//               shopId = shopId.toString();
//           }
//         const object = await FileService.getByShopId(shopId);
//         if (!object) {
//           return next(createError.BadRequest(Model + " not found"));
//         }
//         res.json({
//           message: "Get" + model + "successfully",
//           status: 200,
//           data: object,
//         });
//       } catch (error) {
//         next(createError.InternalServerError(error.message));
//       }
//     },
//     async filterFiles(req, res) {
//       try {
//         const { shopId, name, status, startDate, endDate } = req.query;
//         if(!shopId){
//           return res.status(400).json({ message: "ShopId is required" });
//         }

//         const start = startDate ? new Date(startDate) : null;
//         const end = endDate ? new Date(endDate) : null;

//         const files = await FileService.filterByNameStatusDate(name, status, start, end);
//         res.status(200).json(files);
//       } catch (error) {
//         res.status(500).json({ message: "Internal Server Error", error });
//       }
//     },
//   };

//   export default FileController;
