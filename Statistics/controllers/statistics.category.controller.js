import createHttpError from "http-errors"
import StatisticsCategoryService from "../services/statistics.category.service.js"
import { CachePrefix } from "../shared/enums.js"
import redisClient from "../configs/redis.config.js"
import {CategoryInfosCacheExpiry} from "../shared/redisExpiry.js"


const StatisticsCategoryController = 
{
    async getTopInSalesSubCategories(req, res, next)
    {
        try
        {   
            const amount = req.body.amount
            const startTime = req.body.startTime
            const endTime = req.body.endTime

            const cacheKey = `${CachePrefix.GLOBAL_TOP_IN_SALES_SUBCATEGORY_PREFIX}`
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

            let statistics = await StatisticsCategoryService.getTopInSalesSubCategories(amount, startTime, endTime)
            if(statistics == null)
            {
                return next(createHttpError.BadRequest("Cannot get the statistics"))
            }

            //store the calculated value into cache
            try
            {
                if(statistics.length > 0)
                {
                    await redisClient.set(cacheKey, JSON.stringify(statistics), {
                        EX: CategoryInfosCacheExpiry.EXPIRY_OF_TOP_IN_SALES_SUB_CATEGORIES
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
                messsage: "Get top-in-sales sub-category successfully",
                data: statistics
            })
        }
        catch(error)
        {
            console.log(error)
            return next(createHttpError.InternalServerError(error.message))
        }
    },

}

export default StatisticsCategoryController