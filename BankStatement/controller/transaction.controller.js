import TransactionService from "../service/transaction.service.js";

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
      const { shopId, category, startDate, endDate } = req.query;
      if (!shopId) {
        return res.status(400).json({ message: "ShopId is required" });
      }

      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      const transactions = await TransactionService.filterByShopIdCategoryDate(
        shopId,
        category,
        start,
        end
      );
      res.json({
        message: "Get transactions successfully",
        status: 200,
        data: transactions,
      });
    } catch (error) {
      return next(createError.InternalServerError(error.message));
    }
  },
  async create(req, res, next) {
    try {
      const data = req.body;
      const newTransaction = await TransactionService.create(data);
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
