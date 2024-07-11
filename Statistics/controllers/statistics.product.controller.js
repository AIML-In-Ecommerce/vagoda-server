import createError from 'http-errors'
import StatisticsProductService from '../services/statistics.product.service.js'
import { ProductAccessType } from '../shared/enums.js'


const StatisticsProductController = 
{
    async getTopProductInSalesBySeller(req, res, next)
    {
        try
        {
            // const shopId = req.headers[`${AuthorizedUserIdInHeader}`]
            const shopId = req.query.shopId

            const startTime = req.body.startTime
            const endTime = req.body.endTime
            const amount = req.body.amount
            const keepMissingItem = req.body.keepMissingItem
            const useProductInfo = req.body.useProductInfo

            const statistics = await StatisticsProductService.getTopProductInSalesBySeller(shopId, amount, startTime, endTime, useProductInfo, keepMissingItem)
            if(statistics == null)
            {
                return next(createError.MethodNotAllowed("Cannot get the statistics"))
            }

            return res.json(
                {
                    message: "Get top sales of products successfully",
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

    async getSoldAmountOfProducts(req, res, next)
    {
        try
        {
            const shopId = req.query.shopId

            const productIds = req.body.productIds
            const startTime = req.body.startTime
            const endTime = req.body.endTime
            const step = req.body.step

            const statistics = await StatisticsProductService.getSoldAmountOfProductsInAnIntervalOfTime(shopId, productIds, startTime, endTime, step)
            if(statistics == null)
            {
                return next(createError.NotFound("No info to get the statistics"))
            }

            return res.json(
                {
                    message: "Get sold amount of products successfully",
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

    async getSoldAmountOfAllProducts(req, res, next)
    {
        try
        {
            const shopId = req.query.shopId

            const startTime = req.body.startTime
            const endTime = req.body.endTime
            const step = req.body.step

            const statisticData = await StatisticsProductService.getSoldAmountOfAllProductsInAnIntervalOfTime(shopId, startTime, endTime, step)
            if(statisticData == null)
            {
                return next(createError.NotFound("No info to get the statistics"))
            }

            return res.json(
                {
                    message: "Get sold amount of all products successfully",
                    data: statisticData
                }
            )
        }
        catch(error)
        {
            console.log(error)
            return next(createError.InternalServerError(error.message))
        }
    },

    async getViewsAndViewersOfProducts(req, res, next)
    {
        try
        {
            const shopId = req.query.shopId

            const productIds = req.body.productIds
            const targetAccessType = req.body.accessType
            const startTime = req.body.startTime
            const endTime = req.body.endTime
            const step = req.body.step

            const statistics = await StatisticsProductService.getViewsAndViewersOfProducts(shopId, productIds, targetAccessType ,startTime, endTime, step)
            if(statistics == null)
            {
                return next(createError.MethodNotAllowed("Cannot get the statistics"))
            }

            return res.json(
                {
                    message: "Get views of products successfully",
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

    async getAddToCartAmountOfProducts(req, res, next)
    {
        try
        {
            const shopId = req.query.shopId

            const productIds = req.body.productIds
            const startTime = req.body.startTime
            const endTime = req.body.endTime
            const step = req.body.step

            const targetAccessType = ProductAccessType.ADD_TO_CART

            const statistics = await StatisticsProductService.getViewsAndViewersOfProducts(shopId, productIds, targetAccessType ,startTime, endTime, step)
            if(statistics == null)
            {
                return next(createError.MethodNotAllowed("Cannot get the statistics"))
            }

            return res.json(
                {
                    message: "Get add-to-cart statistics successfully",
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

    async getAddToCartRatio(req, res, next)
    {
        try
        {
            const shopId = req.query.shopId
            
            const productIds = req.body.productIds
            const startTime = req.body.startTime
            const endTime = req.body.endTime

            const statistics = await StatisticsProductService.getAddToCartRatio(shopId, productIds, startTime, endTime)
            if(statistics == null)
            {
                return next(createError.MethodNotAllowed("Cannot get add-to-cart ratio statistics"))
            }

            return res.json(
                {
                    message: "Get add-to-cart ratio successfully",
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

    async getAmountOfBuyersOfProducts(req, res, next)
    {
        try
        {
            const shopId = req.query.shopId

            const productIds = req.body.productIds
            const startTime = req.body.startTime
            const endTime = req.body.endTime

            const statistics = await StatisticsProductService.getAmountOfBuyersOfProducts(shopId, productIds, startTime, endTime)
            if(statistics == null)
            {
                return next(createError.MethodNotAllowed("Cannot get amount of buyers of products"))
            }

            return res.json({
                message: "Get amount of buyers statistics successfully",
                data: statistics
            })
        }
        catch(error)
        {
            console.log(error)
            return next(createError.InternalServerError(error.message))
        }
    },

    async getTopProductInGlobalSales(req, res, next)
    {
        try
        {
            const startTime = req.body.startTime
            const endTime = req.body.endTime
            const amount = req.body.amount
            const useProductInfo = req.body.useProductInfo ? req.body.useProductInfo : false
            const useCompensation = req.body.useCompensation ? req.body.useCompensation : false
            const keepMissingItem = req.body.keepMissingItem

            const statistics = await StatisticsProductService.getTopProductsInGlobalSales(amount, startTime, endTime, useProductInfo, useCompensation, keepMissingItem)
            if(statistics == null)
            {
                return next(createError.MethodNotAllowed("Cannot get the statistics"))
            }

            return res.json(
                {
                    message: "Get top sales of products successfully",
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

    async getProductsAbleToCombine(req, res, next)
    {
        try
        {
            const productId = req.body.productId
            
            const startTime = req.body.startTime
            const endTime = req.body.endTime

            const statistics = await StatisticsProductService.getFrequentItemsToSuggest(productId, startTime, endTime)
            if(statistics == null)
            {
                return next(createError.MethodNotAllowed("Cannot get the statistics"))
            }

            return res.json(
                {
                    message: "Get products can be used to combine successfully",
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

    async getReviewsOfProductsInRanges(req, res, next)
    {
        try
        {
            const shopId = req.query.shopId
            if(shopId == undefined || shopId == null)
            {
                return next(createError.BadRequest("Missing required parameter"))
            }

            const ratingRanges = req.body.ratingRanges
            const targetProductIds = req.body.targetProductIds
            const startTime = req.body.startTime
            const endTime = req.body.endTime
            const useProductInfo = req.body.useProductInfo
            const useReviewInfo = req.body.useReviewInfo

            const statistics = await StatisticsProductService.getReviewsOfProductsInRanges(shopId, targetProductIds, ratingRanges, startTime, endTime, useProductInfo, useReviewInfo)
            if(statistics == null)
            {
                return next(createError.MethodNotAllowed("Cannot get the statistics"))
            }

            return res.json(
                {
                    message: "Get review statistics successfully",
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

}

export default StatisticsProductController