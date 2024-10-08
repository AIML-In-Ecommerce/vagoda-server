import createError from "http-errors";
import OrderService from "./order.service.js";
import { OrderStatus, PaymentMethod } from "./shared/enums.js";
import UserService from "./support/user.service.js";
import CartService from "./support/cart.service.js";
import ProductService from "./support/product.service.js";
import PromotionService from "./support/promotion.service.js";
const model = " order ";
const Model = " Order ";
const AuthorizedUserIdInHeader = "A-User-Id";

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
      const userId = req.query.userId;

      if (userId == undefined) {
        return next(createError.Unauthorized());
      }

      const list = await OrderService.getAllCustomerOrders(userId);
      if (list == null) {
        return next(createError.BadRequest(Model + " list not found"));
      }

      return res.json({
        message: "Get " + model + " list successfully",
        data: list,
      });
    } catch (error) {
      console.log(error);
      return next(createError.InternalServerError(error.message));
    }
  },

  getCustomerOrderById: async (req, res, next) => {
    try {
      // const userId = req.headers[`${AuthorizedUserIdInHeader}`]
      const userId = req.query.userId;

      if (userId == undefined) {
        return next(createError.Unauthorized());
      }

      const { orderId } = req.query;

      const object = await OrderService.getById(orderId);
      if (object == null) {
        return next(createError.BadRequest(Model + " not found"));
      }
      // console.log(object)
      if (userId != object.user._id) {
        return next(createError.NotFound("No document found"));
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
      const userId = req.query.userId;

      if (userId == undefined) {
        return next(createError.Unauthorized());
      }

      const data = req.body;
      data.userId = userId;
      const newOrders = await OrderService.create(data);
      if (newOrders == null) {
        return next(createError.BadRequest("Cannot create the new order"));
      }

      //update sold quantity of products which have been bought
      const cartInfo = await CartService.getCartInfoByUserId(userId);
      if (cartInfo != null) {
        const targetUpdateInfos = cartInfo.products.map((product) => {
          const record = {
            product: product._id,
            quantity: product.quantity,
          };
          return record;
        });

        await ProductService.increaseSoldAmountOfManyProducts(
          targetUpdateInfos
        );
      }

      //update remain quantity of promotions which have been used
      await PromotionService.updateUsedPromotionsQuantity(data.promotionIds);

      //TODO: clear cart of user
      if (
        data.itemIds != undefined &&
        data.itemIds != null &&
        data.itemIds.length > 0
      ) {
        await CartService.clearCartByUserId(userId, data.itemIds);
      } else {
        await CartService.clearAllCartByUserId(userId);
      }

      return res.json({
        message: "Create" + model + "successfully",
        data: newOrders,
      });
    } catch (error) {
      console.log(error);
      return next(createError.InternalServerError(error.message));
    }
  },

  cancelOrderByBuyer: async (req, res, next) => {
    try {
      // const userId = req.headers[`${AuthorizedUserIdInHeader}`]
      const userId = req.query.userId;
      const orderId = req.query.orderId;

      if (userId == undefined) {
        return next(createError.Unauthorized());
      }

      const isSuccessfullyCancelled = await OrderService.updateOrderStatus(
        orderId,
        undefined,
        userId,
        OrderStatus.CANCELLED
      );
      if (isSuccessfullyCancelled == false) {
        return next(createError.MethodNotAllowed("Cannot cancel the order"));
      }

      const updatedOrder = await OrderService.getById(orderId);

      return res.json({
        message: "Cancel order successfully",
        data: updatedOrder,
      });
    } catch (error) {
      console.log(error);
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
      console.log(error);
      return next(createError.InternalServerError(error.message));
    }
  },

  updateOrderStatusWhenZaloPayCallback: async (req, res, next) => {
    try {
      const data = req.body;

      const userId = data.userId;
      const orderIds = data.orderIds;
      const zpTransId = data.zpTransId;
      const appTransId = data.appTransId;
      const zpUserId = data.zpUserId;
      const paidAt = data.paidAt;

      if (
        orderIds == undefined ||
        userId == undefined ||
        zpTransId == undefined ||
        appTransId == undefined ||
        zpUserId == undefined ||
        paidAt == undefined
      ) {
        return next(createError.BadRequest("Missing parameters"));
      }

      if (data.orderIds.length == 0) {
        return next(
          createError.BadRequest("No target order's id to update documents")
        );
      }

      console.log("update order when payment service request (ZaloPay)");
      const successfulUpdatedStatusList =
        await OrderService.updateManyOrderStatus(
          orderIds,
          paidAt,
          undefined,
          userId,
          OrderStatus.PENDING
        );
      // if(successfulUpdatedStatusList.length == 0)
      // {
      //   return next(createError.MethodNotAllowed("Cannot find order list. Cannot update order's status"))
      // }

      const newPaymentInfo = {
        zpTransId: zpTransId,
        zpUserId: zpUserId,
        appTransId: appTransId,
        isPaid: true,
        paidAt: paidAt,
      };
      const successfulUpdatedPaymentList =
        await OrderService.updateManyPaymentInfo(
          orderIds,
          PaymentMethod.ZALOPAY,
          newPaymentInfo,
          userId,
          undefined
        );
      // if(successfulUpdatedPaymentList.length == 0)
      // {
      //   return next(createError.MethodNotAllowed("Cannot find order list. Cannot update order's payment"))
      // }
      console.log("update successfully");
      return res.json({
        message: "Update status and payment's info successfully",
        data: {
          successfulUpdatedStatusList,
          successfulUpdatedPaymentList,
        },
      });
    } catch (error) {
      console.log(error);
      return next(createError.InternalServerError(error.message));
    }
  },

  updateManyOrderStatusBySeller: async (req, res, next) => {
    try {
      // const shopId = req.headers[`${AuthorizedUserIdInHeader}`]
      const shopId = req.query.shopId;

      if (shopId == undefined) {
        return next(createError.Unauthorized());
      }
      const orderIds = req.body.orderIds;
      const execTime = req.body.execTime;
      const specStatusCode = req.body.specStatusCode;

      if (orderIds == undefined) {
        return next(
          createError.BadRequest("No target order's id to update documents")
        );
      }

      const successfulUpdatedList = await OrderService.updateManyOrderStatus(
        orderIds,
        execTime,
        shopId,
        undefined,
        specStatusCode
      );
      if (successfulUpdatedList.length == 0) {
        return next(
          createError.MethodNotAllowed(
            "Cannot find order list. Cannot update order's status"
          )
        );
      }

      const updatedNumber = successfulUpdatedList.length;
      const sampleNumber = orderIds.length;

      return res.json({
        message: `Updated ${updatedNumber}/${sampleNumber} orders`,
        data: successfulUpdatedList,
      });
    } catch (error) {
      console.log(error);
      return next(createError.InternalServerError(error.message));
    }
  },

  updateOneOrderStatusBySeller: async (req, res, next) => {
    try {
      // const shopId = req.headers[`${AuthorizedUserIdInHeader}`]
      const shopId = req.query.shopId;

      if (shopId == undefined) {
        return next(createError.Unauthorized());
      }

      const orderId = req.body.orderId;
      const execTime = req.body.execTime;
      const specStatusCode = req.body.specStatusCode;

      if (orderId == undefined || shopId == undefined) {
        return next(createError.BadRequest("Missing parameters"));
      }

      const isSuccessfullyCancelled = await OrderService.updateOrderStatus(
        orderId,
        execTime,
        shopId,
        undefined,
        specStatusCode
      );
      if (isSuccessfullyCancelled == false) {
        return next(createError.MethodNotAllowed("Cannot update orderStatus"));
      }

      const updatedOrder = await OrderService.getById(orderId);

      return res.json({
        message: "Update order successfully",
        data: updatedOrder,
      });
    } catch (error) {
      console.log(error);
      return next(createError.InternalServerError(error.message));
    }
  },

  //Seller center

  getShopLatestOrders: async (req, res, next) => {
    try {
      // const shopId = req.headers[`${AuthorizedUserIdInHeader}`]
      const shopId = req.query.shopId;

      if (shopId == undefined) {
        return next(createError.Unauthorized());
      }
      const targetOrderStatus = req.query.orderStatus;

      const orders = await OrderService.getAllSellerOrders(
        shopId,
        targetOrderStatus
      );
      if (orders == null) {
        return next(createError.BadRequest("Cannot get orders"));
      }

      return res.json({
        message: "Get list of order successfully",
        data: orders,
      });
    } catch (error) {
      console.log(error);
      return next(createError.InternalServerError(error.message));
    }
  },

  getSellerOrderById: async (req, res, next) => {
    try {
      // const shopId = req.headers[`${AuthorizedUserIdInHeader}`]
      const shopId = req.query.shopId;

      if (shopId == undefined) {
        return next(createError.Unauthorized());
      }
      const { orderId } = req.query;

      const object = await OrderService.getById(orderId);
      if (object == null) {
        return next(createError.BadRequest(Model + " not found"));
      }

      if (shopId != object.shop._id) {
        return next(createError.NotFound("No document found"));
      }

      return res.json({
        message: "Get" + model + "successfully",
        data: object,
      });
    } catch (error) {
      console.log(error);
      return next(createError.InternalServerError(error.message));
    }
  },

  cancelOneOrderBySeller: async (req, res, next) => {
    try {
      // const shopId = req.headers[`${AuthorizedUserIdInHeader}`]
      const shopId = req.query.shopId;

      if (shopId == undefined) {
        return next(createError.Unauthorized());
      }
      const orderId = req.body.orderId;
      const execTime = req.body.execTime;

      const isSuccessfullyCancelled = await OrderService.updateOrderStatus(
        orderId,
        execTime,
        shopId,
        undefined,
        OrderStatus.CANCELLED
      );
      if (isSuccessfullyCancelled == false) {
        return next(createError.MethodNotAllowed("Cannot cancel the order"));
      }

      const updatedOrder = await OrderService.getById(orderId);

      return res.json({
        message: "Cancel order successfully",
        data: updatedOrder,
      });
    } catch (error) {
      console.log(error);
      return next(createError.InternalServerError(error.message));
    }
  },

  cancelManyOrderBySeller: async (req, res, next) => {
    try {
      // const shopId = req.headers[`${AuthorizedUserIdInHeader}`]
      const shopId = req.query.shopId;

      if (shopId == undefined) {
        return next(createError.Unauthorized());
      }
      const orderIds = req.body.orderIds;
      const execTime = req.body.execTime;

      const successfulUpdatedList = await OrderService.updateManyOrderStatus(
        orderIds,
        execTime,
        shopId,
        undefined,
        OrderStatus.CANCELLED
      );
      if (successfulUpdatedList == null) {
        return next(createError.MethodNotAllowed("Cannot cancel the order"));
      }

      return res.json({
        message: "Cancel orders successfully",
        data: successfulUpdatedList,
      });
    } catch (error) {
      console.log(error);
      return next(createError.InternalServerError(error.message));
    }
  },
  // revenue
  getRevenue: async (req, res, next) => {
    console.log(new Date().getMonth());
    try {
      let m, y;
      const { shop, year, month } = req.query;
      console.log("filter info:", shop, year, month);
      if (!shop) {
        return next(createError.BadRequest("Invalid shop!"));
      }
      if (year == undefined) {
        // convert month to number and check if it is valid and be a integer

        if (month != undefined) {
          m = parseInt(month);
          console.log(m);
          if (isNaN(m) || m < 1 || m > 12) {
            return next(createError.BadRequest("Invalid month!"));
          }
          if (m % 1 !== 0) {
            return next(createError.BadRequest("Invalid month!"));
          }
          m--;
        }
        if (m > new Date().getMonth()) {
          y = new Date().getFullYear() - 1;
        } else {
          y = new Date().getFullYear();
        }
      } else {
        // convert year to number and check if it is valid and be a integer
        y = parseInt(year);
        console.log("yearrr", y);
        if (isNaN(y) || y < 2000 || y > new Date().getFullYear()) {
          return next(createError.BadRequest("Invalid year!"));
        }
        if (y > new Date().getFullYear()) {
          return next(createError.BadRequest("Invalid year!"));
        }
        if (y % 1 !== 0) {
          return next(createError.BadRequest("Invalid year!"));
        }
        if (month != undefined) {
          m = parseInt(month);
          if (isNaN(m) || m < 1 || m > 12) {
            return next(createError.BadRequest("Invalid month!"));
          }
          if (m % 1 !== 0) {
            return next(createError.BadRequest("Invalid month!"));
          }
          m--;
        }
      }
      console.log("aaaaaaaaaaaaaaaaaaaaaa", m, y);
      const revenue = await OrderService.getRevenue(shop, y);
      if (!revenue) {
        return next(createError.BadRequest("Something went wrong!"));
      }
      console.log("revenue", revenue);
      if (m != undefined) {
        res.json({
          message: "Get revenue successfully",
          data: revenue[m],
        });
      } else {
        console.log("ccccccccccc");
        res.json({
          message: "Get revenue successfully",
          data: revenue,
        });
      }
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },

  async getProductInOrder(req, res, next) {
    try {
      const orderId = req.query.orderId;
      const itemId = req.query.itemId;

      if (
        orderId == undefined ||
        orderId == null ||
        itemId == undefined ||
        itemId == null
      ) {
        return next(createError.BadRequest("Missing required parameters"));
      }

      const itemInfo = await OrderService.getItemInOrder(orderId, itemId);
      if (itemInfo == null) {
        return next(createError.NotFound("Cannot find the item"));
      }

      return res.json({
        message: "Get item's info successfully",
        data: itemInfo,
      });
    } catch (error) {
      console.log(error);
      return next(createError.InternalServerError(error.message));
    }
  },

  async repurchaseItem(req, res, next) {
    try {
      const orderId = req.body.orderId;
      const itemIds = req.body.itemIds;

      if (orderId == undefined || itemIds == undefined) {
        return next(createError.BadRequest("Missing required parameters"));
      }

      const newProductsInCart = await OrderService.repurchaseItem(
        orderId,
        itemIds
      );
      if (newProductsInCart == null) {
        return next(createError.MethodNotAllowed("Cannot repurchase the item"));
      }

      return res.json({
        message: "Repurchase the item successfully",
        data: newProductsInCart,
      });
    } catch (error) {
      console.log(error);
      return next(createError.InternalServerError(error.message));
    }
  },

  async getBuyerOrdersByIds(req, res, next) {
    try {
      const userId = req.query.userId;

      if (userId == undefined) {
        return next(createError(Unauthorized()));
      }

      const orderIds = req.body.orderIds;

      if (orderIds == undefined || orderIds == null) {
        return next(createError.BadRequest("Missing required parameter"));
      }

      const orders = await OrderService.getBuyerOrdersByIds(userId, orderIds);
      if (orders == null) {
        return next(createError.NotFound());
      }

      return res.json({
        message: "Get orders successfully",
        data: orders,
      });
    } catch (error) {
      console.log(error);
      return next(createError.InternalServerError(error.message));
    }
  },
};

export default OrderController;
