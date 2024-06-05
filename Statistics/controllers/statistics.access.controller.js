import createError from 'http-errors'
import StatisticsAccessService from '../services/statistics.access.service.js'

const StatisticsAccessController = 
{

    setAccessProductByBuyer: async(req, res, next) =>
    {
        try
        {
            const userId = req.body.userId
            const productId = req.body.productId
            const shopId = req.body.shopId
            const accessType = req.body.accessType
            const appTime = req.body.appTime

            const productList = await StatisticsAccessService.setAccessProductByBuyer(userId, productId, shopId, accessType, appTime)
            return res.json(
                {
                    message: "Set product successfully",
                    data: productList
                }
            )
        }
        catch(error)
        {
            console.log(error)
            return next(createError.InternalServerError(error.message))
        }
    },

    getAccessProductsByBuyer: async(req, res, next) =>
    {
        try
        {
            const userId = req.query.userId
            const amount = req.query.amount
            const accessType = req.query.accessType

            const intervalOfDay = 7

            const endTime = new Date(Date.now())
            const startTime = new Date(new Date(endTime).setDate(endTime.getDate() - intervalOfDay))

            const productList = await StatisticsAccessService.getAccessProductsByBuyer(userId, amount, accessType, startTime, endTime)
            if(productList == null)
            {
                return next(createError.MethodNotAllowed("Cannot get searched products"))
            }
            
            return res.json(
                {
                    message: "Get product successfully",
                    data: productList
                }
            )
        }
        catch(error)
        {
            console.log(error)
            return next(createError.InternalServerError(error.message))
        }
    },

    
}

export default StatisticsAccessController