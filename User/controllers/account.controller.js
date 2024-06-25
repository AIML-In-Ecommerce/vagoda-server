import createError from "http-errors";
import AccountService from "../services/account.service.js";

const model = "account";
const Model = "Account";
const AccountController = {
  getAll: async (req, res, next) => {
    try {
      const filter = req.body;
      const list = await AccountService.getAll(filter, "");
      if (!list) {
        return next(createError.BadRequest(Model + " list not found"));
      }
      res.json({
        message: "Get " + model + " list successfully",
        status: 200,
        data: list,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },
  
  getByEmail: async (req, res, next) => {
    try {
      const {email} = req.body;
      const account = await AccountService.getByEmail(email)
      if(account == null)
      {
        return next(createError.NotFound("Account not found"))
      }
  
      return res.json(
        {
          message: "Get account successfully",
          data: account
        }
      )

    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const object = await AccountService.getById(id);
      if (!object) {
        return next(createError.BadRequest(Model + " not found"));
      }
      res.json({
        message: "Get" + model + "successfully",
        status: 200,
        data: object,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },

  create: async (req, res, next) => {
    try {
      const data = req.body;
      const object = await AccountService.create(data);
      if (!object) {
        return next(createError.BadRequest("Bad request!"));
      }
      res.json({
        message: "Create " + model + " successfully",
        data: object,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },
  update: async (req, res, next) => {
    try {
      const data = req.body;
      const { id } = req.params;
      const object = await AccountService.update(id, data);
      if (!object) {
        return next(createError.BadRequest(Model + " not found"));
      }
      res.json({
        message: "Update" + model + "successfully",
        status: 200,
        data: object,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },

  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const deletedAccountId = await AccountService.delete(id);
      if (!deletedAccountId) {
        return next(createError.BadRequest(Model + " not found"));
      }
      console.log("Deleted " + id)
      res.json({
        message: "Delete " + model + " successfully",
        status: 200,
        data: deletedAccountId,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },


};

export default AccountController;
