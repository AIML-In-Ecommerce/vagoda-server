
import createError from 'http-errors'
import ShopStatisticsService from "../services/statistics.shop.service.js"
import { CachePrefix } from '../shared/enums.js'
import { ShopInfosCacheExpiry } from '../shared/redisExpiry.js'
import redisClient from '../configs/redis.config.js'


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

    async getTopGlobalShopsHasProductsInTopSales(req, res, next)
    {
        try
        {
            const amount = req.body.amount
            const startTime = req.body.startTime
            const endTime = req.body.endTime

            const cacheKey = `${CachePrefix.GLOBAL_TOP_SHOPS_HAS_PRODUCTS_IN_TOP_SALES}`
            //get from cache
            try
            {
                const cachedInfos = await redisClient.get(cacheKey)
                let cachedParsedInfos = []
                if(cachedInfos != null)
                {
                    cachedParsedInfos = JSON.parse(cachedInfos)
                    if(amount != undefined)
                    {
                        cachedParsedInfos = cachedParsedInfos.slice(0, amount)
                    }
                    
                    return res.json({
                        message: "Get the statistics successfully",
                        data: cachedParsedInfos
                    })
                }
            }
            catch(error)
            {
                console.error(error)
            }


            let statistics = await ShopStatisticsService.getTopGlobalShopsHasProductsInTopSales(amount, startTime, endTime)
            if(statistics == null)
            {
                return next(createError.BadRequest("Cannot get the statistics"))
            }

            //save to cache
            try
            {
                if(statistics.length > 0)
                {
                    await redisClient.set(cacheKey, JSON.stringify(statistics), {
                        EX: ShopInfosCacheExpiry.EXPIRY_OF_TOP_SHOPS_HAS_PRODUCTS_IN_TOP_SALES
                    })
                }
            }
            catch(error)
            {
                console.error(error)
            }

            if(amount != undefined)
            {
                statistics = statistics.slice(0, amount)
            }

            return res.json({
                message: "Get the statistics successfully",
                data: statistics
            })
        }
        catch(error)
        {
            console.log(error)
            return next(createError.InternalServerError(error))
        }
    },

}

export default ShopStatisticsController