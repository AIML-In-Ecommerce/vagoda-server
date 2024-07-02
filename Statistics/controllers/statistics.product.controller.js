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

            const statistics = await StatisticsProductService.getTopProductInSalesBySeller(shopId, amount, startTime, endTime, false)
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

            const statistics = await StatisticsProductService.getSoldAmountOfProductsInAnIntervalOfTime(shopId, productIds, startTime, endTime)
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

            const statisticData = await StatisticsProductService.getSoldAmountOfAllProductsInAnIntervalOfTime(shopId, startTime, endTime)
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

            const statistics = await StatisticsProductService.getViewsAndViewersOfProducts(shopId, productIds, targetAccessType ,startTime, endTime)
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

            const targetAccessType = ProductAccessType.ADD_TO_CART

            const statistics = await StatisticsProductService.getViewsAndViewersOfProducts(shopId, productIds, targetAccessType ,startTime, endTime)
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

            const statistics = await StatisticsProductService.getTopProductsInGlobalSales(amount, startTime, endTime, useProductInfo)
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

    async getFrequentlyRelatedItems(req, res, next)
    {
        try
        {
            const productId = req.body.productId
            
            const startTime = req.body.startTime
            const endTime = req.body.endTime

            const statistics = await StatisticsProductService.getFrequentItemsetsAnIntervalOfTime(0.2, startTime, endTime)

            return res.json(
                {
                    message: "",
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