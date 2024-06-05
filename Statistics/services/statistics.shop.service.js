import Order from '../models/order/order.model.js'
import { OrderStatus } from '../shared/enums.js'
import StatisticsOrderService from './statistics.order.service.js'
import ProductAccess from "../models/access/productAcess.model.js"
import StatisticsAccessService from './statistics.access.service.js'

const ShopStatisticsService =
{

    async getShopTotalSales(shopId, startTime = undefined, endTime = undefined)
    {
        const targetOrderStatus = OrderStatus.PROCESSING
        const statistics = await StatisticsOrderService.getOrderByShopWithStatus(shopId, targetOrderStatus,
            startTime, endTime
        )

        if(statistics == null)
        {
            return null
        }

        const finalResult = 
        {
            totalOrders: statistics.totalOrders,
            totalRevenue: statistics.totalRevenue,
            totalProfit: statistics.totalProfit,
            statisticsData: statistics.statisticData
        }

        return finalResult
    },

    async getRevenueOfShop(shopId, startTime, endTime)
    {
        const targetOrderStatus = OrderStatus.COMPLETED
        const statistics = await StatisticsOrderService.getOrderByShopWithStatus(shopId, targetOrderStatus, startTime, endTime)
        return statistics
    },

    async getConversionOfViewAndSale(shopId, startTime = undefined, endTime = undefined)
    {
        // let endTimeToCheck = new Date().getTime()
        // let startTimeToCheck = 0

        const targetOrderStatus = OrderStatus.PROCESSING
        const orderStatistics = await StatisticsOrderService.getOrderByShopWithStatus(shopId, targetOrderStatus, startTime, endTime)
        if(orderStatistics == null)
        {
            console.log("Null orderStatistics in getConversionOfViewAndSale")
            return null
        }

        const productAccessStatistics =  await StatisticsAccessService.getAccessProductsWithShopId(shopId, undefined, undefined, startTime, endTime)
        if(productAccessStatistics == null)
        {
            console.log("Null productAccessStatistics in getConversionOfViewAndSale")
            return null
        }

        let numberOfUserHasOrder = 0
        const userIdsInOrder = new Map()

        orderStatistics.statisticData.forEach((item) =>
        {
            const userId = item.user.toString()
            userIdsInOrder.set(userId, true)
        })

        productAccessStatistics.forEach((record) =>
        {
            const isExistedBuyerOrder = userIdsInOrder.get(record.user.toString())
            if(isExistedBuyerOrder != undefined)
            {
                numberOfUserHasOrder += 1
            }
        })

        const conversionRate = numberOfUserHasOrder / productAccessStatistics.length
        
        const finalResult = 
        {
            totalRevenue: orderStatistics.totalRevenue,
            totalProfit: orderStatistics.totalProfit,
            avgRevenue: orderStatistics.avgRevenue,
            avgProfit: orderStatistics.avgProfit,
            totalOrders: orderStatistics.totalOrders,
            totalAccess: productAccessStatistics.length,
            conversionRate: conversionRate,
            statisticData: orderStatistics.statisticData
        }

        return finalResult
    },

}

export default ShopStatisticsService