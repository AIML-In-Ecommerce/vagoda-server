import createError from "http-errors";
import OrderService from "./order.service.js";
import { OrderStatus } from "./shared/enums.js";
import UserService from "./support/user.service.js";
const model = " order ";
const Model = " Order ";
const OrderController = {

  /**
   * req.query = 
   * {
   *  userId: string
   * }
   */
  getAllCustomerOrders: async (req, res, next) => {
    try {
      const filter = req.query;
      const list = await OrderService.getAllCustomerOrders(filter, "");
      if (!list) {
        return next(createError.BadRequest(Model + " list not found"));
      }
      res.json({
        message: "Get " + model + " list successfully",
        data: list,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },

  getCustomerOrderById: async (req, res, next) => {
    try {
      const { orderId } = req.query;

      const object = await OrderService.getById(orderId);
      if (!object) {
        return next(createError.BadRequest(Model + " not found"));
      }

      // const userInfo = await UserService.getUserInfo(userId)
      // if(userInfo == null)
      // {
      //   return next(createError.BadRequest(Model + " not found"));
      // }
      
      //check userId in AccessToken and userId in order
      // if(userInfo._id != object.user._id)
      // {
      //   return next(createError.Forbidden("Forbidden to access this resource"));
      // }

      res.json({
        message: "Get" + model + "successfully",
        data: object,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },

  /**
   * req.body = 
   * {
   *  
   * }
   * 
   */
  create: async (req, res, next) => {
    try {
      const data = req.body;
      const object = await OrderService.create(data);
      if (!object) {
        return next(createError.BadRequest("Bad request!"));
      }
      res.json({
        message: "Create" + model + "successfully",
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
      const object = await OrderService.update(id, data);
      if (!object) {
        return next(createError.BadRequest(Model + " not found"));
      }
      res.json({
        message: "Update" + model + "successfully",
        data: object,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },

  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const object = await OrderService.delete(id);
      if (!object) {
        return next(createError.BadRequest(Model + " not found"));
      }
      res.json({
        message: "Delete" + model + "successfully",
        data: object,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },

  cancel: async (req, res, next) => {
    try {
      const { id } = req.params;
      const object = await OrderService.update(id, {orderStatus: OrderStatus.CANCELLED});
      if (!object) {
        return next(createError.BadRequest(Model + " not found"));
      }
      res.json({
        message: "Cancel" + model + "successfully",
        data: object,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },
  getStatus: async (req, res, next) => {
    try {
      
      const list = OrderStatus;
      if (!list) {
        return next(createError.BadRequest("OrderStatus" + " list not found"));
      }
      res.json({
        message: "Get OrderStatus list successfully",
        data: list,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },

  

  //Seller center
};

export default OrderController;
