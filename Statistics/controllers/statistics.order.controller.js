import createError from 'http-errors'
import StatisticsOrderService from '../services/statistics.order.service.js'


const StatisticsOrderController = 
{

    async getOrderStatisticsByShopWithStatus(req, res, next)
    {
        try
        {
            const shopId = req.body.shopId
            const orderStatus = req.body.orderStatus
            const startTime = req.body.startTime
            const endTime = req.body.endTime
    
            const statisticsResult = await StatisticsOrderService.getOrderByShopWithStatus(shopId, orderStatus, startTime, endTime)    
            if(statisticsResult == null)
            {
                return next(createError.MethodNotAllowed("Cannot get the statistics"))
            }

            return res.json(
                {
                    message: "Get statistics of order successfully",
                    data: statisticsResult
                }
            )
        }
        catch(error)
        {
            console.log(error)
            return next(createError.InternalServerError(error.message))
        }
    },

    async getOrderStatisticsByShopWithLatestStatus(req, res, next)
    {
        try
        {
            const shopId = req.body.shopId
            const orderStatus = req.body.orderStatus
            const startTime = req.body.startTime
            const endTime = req.body.endTime
    
            const statisticsResult = await StatisticsOrderService.getOrderByShopWithLatestStatus(shopId, orderStatus, startTime, endTime)    
            if(statisticsResult == null)
            {
                return next(createError.MethodNotAllowed("Cannot get the statistics"))
            }

            return res.json(
                {
                    message: "Get statistics of order successfully",
                    data: statisticsResult
                }
            )
        }
        catch(error)
        {
            console.log(error)
            return next(createError.InternalServerError(error.message))
        }
    },

    async getTotalReceivedOrders(req, res, next)
    {
        try
        {
            const shopId = req.body.shopId
            const startTime = req.body.startTime
            const endTime = req.body.endTime

            const statistics = await StatisticsOrderService.getTotalReceivedOrders(shopId, startTime, endTime)
            if(statistics == null)
            {
                return next(createError.MethodNotAllowed("Cannot get the statistics"))
            }

            res.json({
                message: "Get total received order statistics successfully",
                data: statistics
            })
        }
        catch(error)
        {
            console.log(error)
            return next(createError.InternalServerError(error.message))
        }
    },

    async getLatePendingAndProcessingOrdersInIntervalOfTime(req, res, next)
    {
        try
        {
            const shopId = req.body.shopId
            const startTime = req.body.startTime
            const endTime = req.body.endTime

            const statistics = await StatisticsOrderService.getLatePendingAndProcessingOrdersBySeller(shopId, startTime, endTime)
            if(statistics == null)
            {
                return next(createError("Cannot get the statistics"))
            }

            return res.json(
                {
                    message: "Get late pending and processing orders successfully",
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

    async getOnTimePendingAndProcessingOrdersInIntervalOfTime(req, res, next)
    {
        try
        {
            const shopId = req.body.shopId
            const startTime = req.body.startTime
            const endTime = req.body.endTime

            const statistics = await StatisticsOrderService.getOnTimePendingAndProcessingOrdersBySeller(shopId, startTime, endTime)
            if(statistics == null)
            {
                return next(createError("Cannot get the statistics"))
            }

            return res.json(
                {
                    message: "Get late pending and processing orders successfully",
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

    async getOrdersWithOnWaitingForStatus(req, res, next)
    {
        try
        {
            const shopId = req.body.shopId
            const orderStatus = req.body.orderStatus
            const startTime = req.body.startTime
            const endTime = req.body.endTime

            const statistics = await StatisticsOrderService.getOrdersWithOnWaitingForStatus(shopId, orderStatus, startTime, endTime)
            if(statistics == null)
            {
                return next(createError.MethodNotAllowed("Cannot get the statistics"))
            }

            return res.json(
                {
                    message: "Get statistics of orders on waiting for process successfully",
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


    async getLateOrdersByShopWithStatus(req, res, next)
    {
        try
        {
            const shopId = req.body.shopId
            const orderStatus = req.body.orderStatus
            const startTime = req.body.startTime
            const endTime = req.body.endTime

            const statistics = await StatisticsOrderService.getLateOrderByShopWithStatus(shopId, orderStatus, startTime, endTime)
            if(statistics == null)
            {
                return next(createError.MethodNotAllowed("Cannot get the statistics"))
            }

            return res.json(
                {
                    message: "Get statistics of orders on waiting for process successfully",
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

    async getOnTimeOrdersByShopIdWithStatus(req, res, next)
    {
        try
        {
            const shopId = req.body.shopId
            const orderStatus = req.body.orderStatus
            const startTime = req.body.startTime
            const endTime = req.body.endTime

            const statistics = await StatisticsOrderService.getOnTimeOrderByShopWithStatus(shopId, orderStatus, startTime, endTime)
            if(statistics == null)
            {
                return next(createError.MethodNotAllowed("Cannot get the statistics"))
            }

            return res.json(
                {
                    message: "Get statistics of orders on waiting for process successfully",
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

export default StatisticsOrderController