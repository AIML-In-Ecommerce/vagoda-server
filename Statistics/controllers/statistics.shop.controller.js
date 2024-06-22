
import createError from 'http-errors'
import ShopStatisticsService from "../services/statistics.shop.service.js"


const ShopStatisticsController = 
{

    async getTotalSales(req, res, next)
    {
        try
        {
            // const shopId = req.headers[`${AuthorizedUserIdInHeader}`]
            const shopId = req.query.shopId

            const startTime = req.body.startTime
            const endTime = req.body.endTime

            const statistic = await ShopStatisticsService.getShopTotalSales(shopId, startTime, endTime)
            if(statistic == null)
            {
                return next(createError.BadRequest("Invalid parameters"))
            }

            return res.json({
                message: "Get total sales successfully",
                data: statistic
            })
        }
        catch(error)
        {
            console.log(error)
            return createError.InternalServerError(error.message)
        }
    },

    async getTotalRevenue(req, res, next)
    {
        try
        {
            // const shopId = req.headers[`${AuthorizedUserIdInHeader}`]
            const shopId = req.query.shopId
            
            const startTime = req.body.startTime
            const endTime = req.body.endTime

            const statistics = await ShopStatisticsService.getRevenueOfShop(shopId, startTime, endTime)
            if(statistics == null)
            {
                return next(createError.MethodNotAllowed("Cannot get the revenue statistics"))
            }

            return res.json(
                {
                    message: "Get the revenue statistics successfully",
                    data: statistics
                }
            )
        }
        catch(error)
        {
            console.log(error)
            return next(createError.InternalServerError(error.message))
        }
    },

    async getConversionOfViewAndSales(req, res, next)
    {
        try
        {
            // const shopId = req.headers[`${AuthorizedUserIdInHeader}`]
            const shopId = req.query.shopId

            const startTime = req.body.startTime
            const endTime = req.body.endTime

            const statistics = await ShopStatisticsService.getConversionOfViewAndSale(shopId, startTime, endTime)
            if(statistics == null)
            {
                return next(createError.MethodNotAllowed("Cannot get statistics data"))
            }

            return res.json(
                {
                    message: "Get conversion of view and sales successfully",
                    data: statistics
                }
            )
        }
        catch(error)
        {
            console.log(error)
            return next(createError.InternalServerError(error.message))
        }
    },

    getOperationalQuanlityScore(req, res, next)
    {
        try
        {
            return res.json(
                {
                    message: "Get operational quanlity score successfully",
                    data: {}
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

export default ShopStatisticsController