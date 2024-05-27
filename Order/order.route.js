import express from "express";
import OrderController from "./order.controller.js";
import ValidatorService from "./validator.service.js";

const router = express.Router();

const buyerRouter = router.use(ValidatorService.validateSystemRole ,ValidatorService.validateBuyerRole)
const systemRouter = router.use(ValidatorService.validateSystemRole)

//customer
buyerRouter.get("/buyer/orders", OrderController.getAllCustomerOrders);
buyerRouter.get("/buyer/order", OrderController.getCustomerOrderById);
buyerRouter.post("/buyer/order/create", OrderController.create);

buyerRouter.put("/buyer/order/status/cancel", OrderController.cancelOrderByBuyer);
// buyerRouter.put("/buyer/order/status/update_many", OrderController.updateManyOrderStatus)
// buyerRouter.put("buyer/order/status/update_one", OrderController.update)
// buyerRouter.delete("/buyer/order/delete", OrderController.delete);


buyerRouter.get("/order/statuses", OrderController.getStatus);


//seller center
// router.get("/s/orders", OrderController.getShopOrders)
// router.get("/s/order",)


systemRouter.post("/system/order/zalopay/update_callback", OrderController.updateOrderStatusWhenZaloPayCallback)

export default router;

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