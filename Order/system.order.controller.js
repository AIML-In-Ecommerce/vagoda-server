import createHttpError from "http-errors"
import OrderService from "./order.service.js"


const SystemOrderController = 
{
    async getOrdersByIds(req, res, next)
    {
        try
        {
            const orderIds = req.body.orderIds

            const orders = await OrderService.getOrdersByIds(orderIds)
            if(orders == null)
            {
                return next(createHttpError.MethodNotAllowed())
            }

            return res.json({
                message: "Get orders successfully",
                data: orders
            })
        }
        catch(error)
        {
            console.log(error)
            return next(createHttpError.InternalServerError(error.message))
        }
    },



}

export default SystemOrderController