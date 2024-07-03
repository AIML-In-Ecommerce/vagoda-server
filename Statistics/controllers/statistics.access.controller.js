import createError from 'http-errors'
import StatisticsAccessService from '../services/statistics.access.service.js'
import dotenv from  "dotenv"
import { A_SESSION_USER_ID_IN_HEADERS, AuthorizedUserIdInHeader } from '../services/verification.service.js'
import { CachePrefix } from '../shared/enums.js'
import redisClient from '../configs/redis.config.js'
import { AccessProductCacheExpiry } from '../shared/redisExpiry.js'
dotenv.config()

// const SESSION_ID_COOKIE_KEY = String(process.env.SESSION_COOKIE_KEY) || "ssid"

const StatisticsAccessController = 
{

    setAccessProductByBuyer: async(req, res, next) =>
    {
        try
        {
            // const userId = req.headers[`${AuthorizedUserIdInHeader}`]
            const userId = req.query.userId
            
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
            // const userId = req.headers[`${AuthorizedUserIdInHeader}`]
            const userId = req.query.userId

            const amount = req.query.amount
            const accessType = req.query.accessType
            const startTime = req.query.startTime
            const endTime = req.query.endTime

            const intervalOfDay = 7

            let endTimeToCheck = new Date()

            if(endTime != undefined)
            {
                endTimeToCheck = new Date(endTime)
            }

            console.log(endTimeToCheck)

            const cacheKey = `${CachePrefix.USER_SEARCH_PRODUCT_PREFIX}${userId}`
            const cacheValue = await redisClient.get(cacheKey)
    
            if(cacheValue != null)
            {
                console.log("get from cache")
                const cacheProducts = JSON.parse(cacheValue)
                return res.json({
                    message: "Get products from cache successfully",
                    data: cacheProducts
                })
            }

            let startTimeToCheck = new Date(new Date(endTimeToCheck).setDate(endTimeToCheck.getDate() - intervalOfDay))

            if(startTime != undefined)
            {
                startTimeToCheck = new Date(startTime)
            }

            const productList = await StatisticsAccessService.getAccessProductInfosByBuyer(userId, amount, accessType, startTimeToCheck, endTimeToCheck)
            if(productList == null)
            {
                return next(createError.MethodNotAllowed("Cannot get searched products"))
            }

            if(productList.length > 0)
            {
                await redisClient.set(cacheKey, JSON.stringify(productList), {
                    EX: AccessProductCacheExpiry.EXPIRY_TIME_OF_CACHE_SEARCHED_PRODUCTS
                })
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

    async setAccessProductBySessionId(req, res, next)
    {
        try
        {
            const sessionUserUUID = req.headers[`${A_SESSION_USER_ID_IN_HEADERS}`]
            
            const productId = req.body.productId
            const shopId = req.body.shopId
            const accessType = req.body.accessType
            const appTime = req.body.appTime

            if(sessionUserUUID == undefined)
            {
                return next(createError.Unauthorized("Unauthorized session value"))
            }

            await StatisticsAccessService.setAccessProductBySessionId(sessionUserUUID, productId, shopId, accessType, appTime)

            return res.json(
                {
                    message: "Set product successfully",
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

export default StatisticsAccessController