import createError from "http-errors";
import OrderService from "./order.service.js";
import { OrderStatus, PaymentMethod } from "./shared/enums.js";
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
      const userId = req.query.userId

      const list = await OrderService.getAllCustomerOrders(userId)
      if (list == null) {
        return next(createError.BadRequest(Model + " list not found"))
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
      const userId = req.query.userId
      const data = req.body;
      data.userId = userId
      const newOrders = await OrderService.create(data);
      if (newOrders == null) {
        return next(createError.BadRequest("Cannot create the new order"));
      }

      //TODO: remove cart

      res.json({
        message: "Create" + model + "successfully",
        data: newOrders,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },

  cancelOrderByBuyer: async (req, res, next) => {
    try {
      const orderId = req.body.orderId
      const userId = req.body.userId

      const isSuccessfullyCancelled = await OrderService.updateOrderStatus(orderId, userId, OrderStatus.CANCELLED)
      if (isSuccessfullyCancelled == false) {
        return next(createError.MethodNotAllowed("Cannot cancel the order"));
      }

      const updatedOrder = await OrderService.getById(orderId)

      res.json({
        message: "Cancel order successfully",
        data: updatedOrder,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },

  // delete: async (req, res, next) => {
  //   try {
  //     const { id } = req.params;
  //     const object = await OrderService.delete(id);
  //     if (!object) {
  //       return next(createError.BadRequest(Model + " not found"));
  //     }
  //     res.json({
  //       message: "Delete" + model + "successfully",
  //       data: object,
  //     });
  //   } catch (error) {
  //     next(createError.InternalServerError(error.message));
  //   }
  // },

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


  updateOrderStatusWhenZaloPayCallback: async (req, res, next) =>
  {
    try
    {
      const data = req.body
      const userId = data.userId
      const orderIds = data.orderIds
      const zpTransId = data.zpTransId
      const appTransId = data.appTransId
      const zpUserId = data.zpUserId
      const paidAt = data.paidAt

      if(orderIds == undefined || userId == undefined || zpTransId == undefined || appTransId == undefined
        || zpUserId == undefined || paidAt == undefined
      )
      {
        return next(createError.BadRequest("Missing parameters"))
      }

      if(data.orderIds.length == 0)
      {
        return next(createError.BadRequest("No target order's id to update documents"))
      }
      
      const successfulUpdatedStatusList = await OrderService.updateManyOrderStatus(orderIds, undefined, userId, OrderStatus.PENDING)
      // if(successfulUpdatedStatusList.length == 0)
      // {
      //   return next(createError.MethodNotAllowed("Cannot find order list. Cannot update order's status"))
      // }     

      const newPaymentInfo = {
        zpTransId: zpTransId,
        zpUserId: zpUserId,
        appTransId: appTransId,
        isPaid: true,
        paidAt: paidAt
    }
      const successfulUpdatedPaymentList = await OrderService.updateManyPaymentInfo(orderIds, PaymentMethod.ZALOPAY, newPaymentInfo, userId, undefined)
      // if(successfulUpdatedPaymentList.length == 0)
      // {
      //   return next(createError.MethodNotAllowed("Cannot find order list. Cannot update order's payment"))
      // }

      return res.json(
        {
          message: "Update status and payment's info successfully",
          data:
          {
            successfulUpdatedStatusList,
            successfulUpdatedPaymentList
          }
        }
      )

    }
    catch(error)
    {
      return next(createError.InternalServerError(error.message))
    }
  },

  updateManyOrderStatusBySeller: async (req, res, next) =>
  {
    try
    {
      const orderIds = req.body.orderIds
      const shopId = req.body.shopId
      const specStatusCode = req.body.specStatusCode
      if(orderIds == 0)
      {
        return next(createError.BadRequest("No target order's id to update documents"))
      }
      if(shopId == undefined)
      {
        return next(createError.BadRequest("Missing parameters"))
      }
      
      const successfulUpdatedList = await OrderService.updateManyOrderStatus(orderIds, shopId, undefined, specStatusCode)
      if(successfulUpdatedList.length == 0)
      {
        return next(createError.MethodNotAllowed("Cannot find order list. Cannot update order's status"))
      }

      const updatedNumber = successfulUpdatedList.length
      const sampleNumber = data.orderIds.length      

      if(updatedNumber != sampleNumber)
      {
        return res.json(
          {
            message: `Updated ${updatedNumber}/${sampleNumber} orders`,
            data: successfulUpdatedList
          }
        )
      }

      return res.json(
        {
          message: `Updated ${updatedNumber}/${sampleNumber} orders`,
          data: successfulUpdatedList
        }
      )
    }
    catch(error)
    {
      return next(createError.InternalServerError(error.message))
    }
  },

  updateOneOrderStatusBySeller: async (req, res, next) =>
  {
    try
    {
      const orderId = req.body.orderId
      const shopId = req.body.shopId
      const specStatusCode = req.body.specStatusCode

      if(orderId == undefined || shopId == undefined)
      {
        return next(createError.BadRequest("Missing parameters"))
      }

      const isSuccessfullyCancelled = await OrderService.updateOrderStatus(orderId, shopId, undefined, specStatusCode)
      if(isSuccessfullyCancelled == false)
      {
        return next(createError.MethodNotAllowed("Cannot update orderStatus"))
      }

      const updatedOrder = await OrderService.getById(orderId)
      
      return res.json(
        {
          message: "Update order successfully",
          data: updatedOrder
        }
      )

    }
    catch(error)
    {
      return next(createError.InternalServerError(error.message))
    }
  }

  //Seller center
};

export default OrderController;
