import express from "express"
import VerificationService from "./verification.service.js";
import OrderController from "./order.controller.js";

const buyerRouter = express.Router()
const sellerRouter = express.Router()
const systemRouter = express.Router()
const router = express.Router()

const rootRouter = express.Router()


// from buyer
buyerRouter.get("/welcome", (req, res, next) => {return res.json({
    message: "welcome to buyer path of Order Service",
    data: {}
})})

buyerRouter.get("/orders",  OrderController.getAllCustomerLatestOrders);
buyerRouter.get("/order",  OrderController.getCustomerOrderById);
buyerRouter.post("/create",  OrderController.create);
buyerRouter.post("/repurchase_item", OrderController.repurchaseItem)

buyerRouter.put("/status/cancel",  OrderController.cancelOrderByBuyer);
// buyerRouter.get("/statuses", OrderController.getStatus);


// from seller
sellerRouter.get("/welcome", (req, res, next) => {return res.json({
    message: "welcome to seller path of Order Service",
    data: {}
})})
sellerRouter.get("/orders", OrderController.getShopLatestOrders)
sellerRouter.get("/order",  OrderController.getSellerOrderById)
sellerRouter.put("/status/update_one", OrderController.updateOneOrderStatusBySeller)
sellerRouter.put("/status/update_many", OrderController.updateManyOrderStatusBySeller)
sellerRouter.put("/status/cancel_one", OrderController.cancelOneOrderBySeller)
sellerRouter.put("/status/cancel_many", OrderController.cancelManyOrderBySeller)

sellerRouter.get('/revenue', OrderController.getRevenue)

// from system
systemRouter.post("/system/order/zalopay/update_callback", VerificationService.verifySystemRole, OrderController.updateOrderStatusWhenZaloPayCallback)


//general router

router.get("/get_item", OrderController.getProductInOrder)

router.use("/buyer", buyerRouter)
router.use("/seller", sellerRouter)

rootRouter.use("/order", router)
rootRouter.use(systemRouter)

export default rootRouter
// export default {authorizedBuyerRouter, authorizedSellerRouter, authorizedSystemRouter, openRouter};

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         user:
 *           type: string
 *         shop:
 *           type: string
 *         products:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               product:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               purchasePrice:
 *                 type: number
 *         promotion:
 *           type: string
 *         paymentMethod:
 *           type: string
 *         shippingFee:
 *           type: number
 *         totalPrice:
 *           type: number
 *         profit:
 *           type: number
 *         shippingAddress:
 *           type: object
 *           properties:
 *             receiverName:
 *               type: string
 *             address:
 *               type: string
 *             phoneNumber:
 *               type: string
 *             coordinate:
 *               type: object
 *               properties:
 *                 lng:
 *                   type: number
 *                 lat:
 *                   type: number
 *             label:
 *               type: string
 *               enum: ["HOME", "OFFICE"]
 *             isDefault:
 *               type: boolean
 *         orderStatus:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               complete:
 *                 type: string
 *                 format: date-time
 *               time:
 *                 type: string
 *                 format: date-time
 *               deadline:
 *                 type: string
 *                 format: date-time
 */

/**
 * @swagger
 * /orders:
 *   get:
 *     responses:
 *       200:
 *         description: Return all orders.
 */

/**
 * @swagger
 * /c/order/:
 *   get:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Return order with corresponding ID.
 */

/**
 * @swagger
 * /order:
 *   post:
 *     responses:
 *       200:
 *         description: Create a new order.
 */

/**
 * @swagger
 * /order/{id}:
 *   put:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Update order successfully.
 */

/**
 * @swagger
 * /order/{id}:
 *   delete:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Delete order successfully.
 */

/**
 * @swagger
 * /order/cancel/{id}:
 *   put:
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cancel order successfully.
 */

/**
 * @swagger
 * /orders/statuses:
 *   get:
 *     responses:
 *       200:
 *         description: Return all orderStatus.
 */