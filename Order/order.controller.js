import createError from "http-errors";
import OrderService from "./order.service.js";
import { OrderStatus, PaymentMethod } from "./shared/enums.js";
import UserService from "./support/user.service.js";
import CartService from "./support/cart.service.js";
import ProductService from "./support/product.service.js";
import PromotionService from "./support/promotion.service.js";
const model = " order ";
const Model = " Order ";
const AuthorizedUserIdInHeader = "A-User-Id"

const OrderController = {

  /**
   * req.query = 
   * {
   *  userId: string
   * }
   */
  getAllCustomerLatestOrders: async (req, res, next) => {
    try {
      // const userId = req.headers[`${AuthorizedUserIdInHeader}`]
      const userId = req.query.userId

      if(userId == undefined)
      {
        return next(createError.Unauthorized())
      }

      const list = await OrderService.getAllCustomerOrders(userId)
      if (list == null) {
        return next(createError.BadRequest(Model + " list not found"))
      }

      return res.json({
        message: "Get " + model + " list successfully",
        data: list,
      });
    } catch (error) {
      console.log(error)
      return next(createError.InternalServerError(error.message));
    }
  },

  getCustomerOrderById: async (req, res, next) => {
    try {
      // const userId = req.headers[`${AuthorizedUserIdInHeader}`]
      const userId = req.query.userId

      if(userId == undefined)
      {
        return next(createError.Unauthorized())
      }

      const { orderId } = req.query;

      const object = await OrderService.getById(orderId);
      if (object == null) {
        return next(createError.BadRequest(Model + " not found"));
      }
      // console.log(object)
      if(userId != object.user._id)
      {
        return next(createError.NotFound("No document found"))
      }

      return res.json({
        message: "Get" + model + "successfully",
        data: object,
      });
    } catch (error) {
      return next(createError.InternalServerError(error.message));
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
      // const userId = req.headers[`${AuthorizedUserIdInHeader}`]
      const userId = req.query.userId

      if(userId == undefined)
      {
        return next(createError.Unauthorized())
      }

      const data = req.body;
      data.userId = userId
      const newOrders = await OrderService.create(data);
      if (newOrders == null) {
        return next(createError.BadRequest("Cannot create the new order"));
      }

      //update sold quantity of products which have been bought
      const cartInfo = await CartService.getCartInfoByUserId(userId)
      if(cartInfo != null)
      {
        const targetUpdateInfos = cartInfo.products.map((product) =>
        {
          const record = {
            product: product._id,
            quantity: product.quantity
          }
          return record
        })

        await ProductService.increaseSoldAmountOfManyProducts(targetUpdateInfos)
      }

      //update remain quantity of promotions which have been used
      await PromotionService.updateUsedPromotionsQuantity(data.promotionIds)

      //TODO: clear cart of user
      await CartService.clearCartByUserId(userId)

      return res.json({
        message: "Create" + model + "successfully",
        data: newOrders,
      });
    } catch (error) {
      console.log(error)
      return next(createError.InternalServerError(error.message));
    }
  },

  cancelOrderByBuyer: async (req, res, next) => {
    try {
      // const userId = req.headers[`${AuthorizedUserIdInHeader}`]
      const userId = req.query.userId
      const orderId = req.query.orderId

      if(userId == undefined)
      {
        return next(createError.Unauthorized())
      }

      const isSuccessfullyCancelled = await OrderService.updateOrderStatus(orderId, undefined, userId, OrderStatus.CANCELLED)
      if (isSuccessfullyCancelled == false) {
        return next(createError.MethodNotAllowed("Cannot cancel the order"));
      }

      const updatedOrder = await OrderService.getById(orderId)

      return res.json({
        message: "Cancel order successfully",
        data: updatedOrder,
      });
    } catch (error) {
      console.log(error)
      return next(createError.InternalServerError(error.message));
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
      return res.json({
        message: "Get OrderStatus list successfully",
        data: list,
      });
    } catch (error) {
      console.log(error)
      return next(createError.InternalServerError(error.message));
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
      
      console.log("update order when payment service request (ZaloPay)")
      const successfulUpdatedStatusList = await OrderService.updateManyOrderStatus(orderIds, paidAt, undefined, userId, OrderStatus.PENDING)
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
      console.log("update successfully")
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
      console.log(error)
      return next(createError.InternalServerError(error.message))
    }
  },

  updateManyOrderStatusBySeller: async (req, res, next) =>
  {
    try
    {
      // const shopId = req.headers[`${AuthorizedUserIdInHeader}`]
      const shopId = req.query.shopId

      if(shopId == undefined)
      {
        return next(createError.Unauthorized())
      }
      const orderIds = req.body.orderIds
      const execTime = req.body.execTime
      const specStatusCode = req.body.specStatusCode

      if(orderIds == undefined)
      {
        return next(createError.BadRequest("No target order's id to update documents"))
      }
      
      const successfulUpdatedList = await OrderService.updateManyOrderStatus(orderIds, execTime, shopId, undefined, specStatusCode)
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
      console.log(error)
      return next(createError.InternalServerError(error.message))
    }
  },

  updateOneOrderStatusBySeller: async (req, res, next) =>
  {
    try
    {
      // const shopId = req.headers[`${AuthorizedUserIdInHeader}`]
      const shopId = req.query.shopId

      if(shopId == undefined)
      {
        return next(createError.Unauthorized())
      }

      const orderId = req.body.orderId
      const execTime = req.body.execTime
      const specStatusCode = req.body.specStatusCode

      if(orderId == undefined || shopId == undefined)
      {
        return next(createError.BadRequest("Missing parameters"))
      }

      const isSuccessfullyCancelled = await OrderService.updateOrderStatus(orderId, execTime, shopId, undefined, specStatusCode)
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
      console.log(error)
      return next(createError.InternalServerError(error.message))
    }
  },

  //Seller center

  getShopLatestOrders: async (req, res, next) =>
  {
    try
    {
      // const shopId = req.headers[`${AuthorizedUserIdInHeader}`]
      const shopId = req.query.shopId

      if(shopId == undefined)
      {
        return next(createError.Unauthorized())
      }
      const targetOrderStatus = req.query.orderStatus

      const orders = await OrderService.getAllSellerOrders(shopId, targetOrderStatus)
      if(orders == null)
      {
        return next(createError.BadRequest("Cannot get orders"))
      }

      return res.json({
        message: "Get list of order successfully",
        data: orders
      })
    }
    catch(error)
    {
      console.log(error)
      return next(createError.InternalServerError(error.message))
    }
  },

  getSellerOrderById: async (req, res, next) => {
    try {
      // const shopId = req.headers[`${AuthorizedUserIdInHeader}`]
      const shopId = req.query.shopId

      if(shopId == undefined)
      {
        return next(createError.Unauthorized())
      }
      const { orderId } = req.query;

      const object = await OrderService.getById(orderId);
      if (object == null) {
        return next(createError.BadRequest(Model + " not found"));
      }

      if(shopId != object.shop._id)
      {
        return next(createError.NotFound("No document found"))
      }

      return res.json({
        message: "Get" + model + "successfully",
        data: object,
      });
    } catch (error) {
      console.log(error)
      return next(createError.InternalServerError(error.message));
    }
  },

  cancelOneOrderBySeller: async (req, res, next) =>
  {
    try
    {
      // const shopId = req.headers[`${AuthorizedUserIdInHeader}`]
      const shopId = req.query.shopId

      if(shopId == undefined)
      {
        return next(createError.Unauthorized())
      }
      const orderId = req.body.orderId
      const execTime = req.body.execTime
      
      const isSuccessfullyCancelled = await OrderService.updateOrderStatus(orderId, execTime, shopId, undefined, OrderStatus.CANCELLED)
      if(isSuccessfullyCancelled == false)
      {
        return next(createError.MethodNotAllowed("Cannot cancel the order"))
      }
      
      const updatedOrder = await OrderService.getById(orderId)

      return res.json({
        message: "Cancel order successfully",
        data: updatedOrder
      })

    }
    catch(error)
    {
      console.log(error)
      return next(createError.InternalServerError(error.message))
    }
  },

  cancelManyOrderBySeller: async (req, res, next) =>
  {
    try
    {
      // const shopId = req.headers[`${AuthorizedUserIdInHeader}`]
      const shopId = req.query.shopId

      if(shopId == undefined)
      {
        return next(createError.Unauthorized())
      }
      const orderIds = req.body.orderIds
      const execTime = req.body.execTime
      
      const successfulUpdatedList = await OrderService.updateManyOrderStatus(orderIds, execTime, shopId, undefined, OrderStatus.CANCELLED)
      if(successfulUpdatedList == null)
      {
        return next(createError.MethodNotAllowed("Cannot cancel the order"))
      }
      
      return res.json({
        message: "Cancel orders successfully",
        data: successfulUpdatedList
      })

    }
    catch(error)
    {
      console.log(error)
      return next(createError.InternalServerError(error.message))
    }
  }, 

};

export default OrderController;
