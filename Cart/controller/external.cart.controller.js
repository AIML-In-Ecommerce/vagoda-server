import createHttpError from "http-errors"
import CartService from "../services/cart.service.js"

const ExternalCartController = 
{
    async addToCart(req, res, next)
    {
        try
        {
            const userId = req.query.userId
            const productId = req.query.productId

            if(userId == undefined || productId == undefined)
            {
                return next(createHttpError.BadRequest("Missing required parameters"))
            }

            //optional parameters
            const color = req.query.color
            const size = req.query.size
            let quantity = req.query.quantity

            if(quantity != undefined && quantity != null)
            {
                quantity = Number(quantity)
            }

            const result = await CartService.addToCartByStringDescriptions(userId, productId, color, size, quantity)
            if(result == null)
            {
                return next(createHttpError.MethodNotAllowed("Cannot add the product to cart"))
            }

            return res.json({
                message: "Add to cart successfully",
                data: result
            })
        }
        catch(error)
        {
            console.log(error)
            return next(createHttpError.InternalServerError(error.message))
        }
    },
}

export default ExternalCartController