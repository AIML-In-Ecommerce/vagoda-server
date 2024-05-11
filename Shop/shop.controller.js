import createError from "http-errors";
import ShopService from "./shop.service.js";
const model = "shop";
const Model = "Shop";
const ShopController = {
  getAll: async (req, res, next) => {
    try {
      const filter = req.body;
      const list = await ShopService.getAll(filter, "");
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

  
  getShopByIdList: async (req, res, next) =>
  {
    try
    {
      const requestBody = req.body

      const listOfShops = await ShopService.getByIds(requestBody)

      if(!list)
      {
        return next(createError.BadRequest(Model + " list not found"));
      }

      res.json(
        {
          message: "Get list of shops successfully",
          data: listOfShops
        }
      )
    }
    catch(err)
    {
      return next(createError.InternalServerError(err.message))
    }
  },


  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const object = await ShopService.getById(id);
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
      const object = await ShopService.create(data);
      if (!object) {
        return next(createError.BadRequest("Bad request!"));
      }
      res.json({
        message: "Create " + model + " successfully",
        status: 200,
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
      const object = await ShopService.update(id, data);
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
      const object = await ShopService.delete(id);
      if (!object) {
        return next(createError.BadRequest(Model + " not found"));
      }
      res.json({
        message: "Delete" + model + "successfully",
        status: 200,
        data: object,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },
};

export default ShopController;
