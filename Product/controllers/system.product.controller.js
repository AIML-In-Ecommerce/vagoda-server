import createError from "http-errors"
import ProductService from "../services/product.service.js"


const SystemProductController = 
{
    async increaseSoldAmountOfAProduct(req, res, next)
    {
        try
        {
            const productId = req.body.productId
            const quantity = req.body.quantity

            if(shopId == undefined)
            {
                return next(createError.Unauthorized())
            }

            const updatedProductId = await ProductService.increaseSoldAmountOfAProduct(productId, quantity)
            if(updatedProductId == null)
            {
                return next(createError.MethodNotAllowed("Failed to increase sold quantity"))
            }

            return res.json({
                message: "Increase sold quantity successfully",
                data: updatedProductId
            })
        }
        catch(error)
        {
            console.log(error)
            return next(createError.InternalServerError(error.message))
        }
    },

    async decreaseSoldAmountOfAProduct(req, res, next)
    {
        try
        {
            const productId = req.body.productId
            const quantity = req.body.quantity

            if(shopId == undefined)
            {
                return next(createError.Unauthorized())
            }

            const updatedProductId = await ProductService.decreaseSoldAmountOfAProduct(productId, quantity)
            if(updatedProductId == null)
            {
                return next(createError.MethodNotAllowed("Failed to descrease sold quantity"))
            }

            return res.json({
                message: "Descrease sold quantity successfully",
                data: updatedProductId
            })
        }
        catch(error)
        {
            console.log(error)
            return next(createError.InternalServerError(error.message))
        }
    },

    async increaseSoldAmountOfManyProduct(req, res, next)
    {
        try
        {
            const updateInfos = req.body.updateInfos

            const updatedProductIdList = await ProductService.increaseSoldAmountOfManyProduct(updateInfos)
            if(updatedProductIdList == null)
            {
                return next(createError.MethodNotAllowed("Failed to increase sold quantity"))
            }

            return res.json({
                message: "Increase sold quantity successfully",
                data: updatedProductIdList
            })
        }
        catch(error)
        {
            console.log(error)
            return next(createError.InternalServerError(error.message))
        }
    },

    async decreaseSoldAmountOfManyProduct(req, res, next)
    {
        try
        {
            const updateInfos = req.body.updateInfos

            const updatedProductIdList = await ProductService.decreaseSoldAmountOfManyProduct(updateInfos)
            if(updatedProductIdList == null)
            {
                return next(createError.MethodNotAllowed("Failed to increase sold quantity"))
            }

            return res.json({
                message: "Increase sold quantity successfully",
                data: updatedProductIdList
            })
        }
        catch(error)
        {
            console.log(error)
            return next(createError.InternalServerError(error.message))
        }
    },

}

export default SystemProductController