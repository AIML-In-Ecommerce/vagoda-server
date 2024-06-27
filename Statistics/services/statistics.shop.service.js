
import { OrderStatus } from '../shared/enums.js'
import StatisticsOrderService from './statistics.order.service.js'
import StatisticsAccessService from './statistics.access.service.js'
import StatisticsProductService from './statistics.product.service.js'
import ShopSupportService from '../support/shop.support.js'


const ShopStatisticsService =
{

    async getShopTotalSales(shopId, startTime = undefined, endTime = undefined)
    {
        // const targetOrderStatus = OrderStatus.PROCESSING
        const statistics = await StatisticsOrderService.getSalesByShop(shopId, startTime, endTime)

        if(statistics == null)
        {
            return null
        }

        const finalResult = 
        {
            totalOrders: statistics.totalOrders,
            totalRevenue: statistics.totalRevenue,
            totalProfit: statistics.totalProfit,
            avgRevenue: statistics.avgRevenue,
            avgProfit: statistics.avgProfit,
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

    async getTopGlobalShopsHasProductsInTopSales(amount = undefined, startTime = undefined, endTime = undefined)
    {
        //if cachedInfos == null ==> re-calculate the statistics
        const topProductsInGlobalSales = await StatisticsProductService.getTopProductsInGlobalSales(undefined, startTime, endTime, true)
        if(topProductsInGlobalSales == null)
        {
            return null
        }

        const shopInfosStatistics = new Map()

        topProductsInGlobalSales.forEach((record) =>
        {
            const productId = record._id
            const shopId = record.productInfo.shop
            const newRevenue = record.value
            const newSold = record.count

            const shopInfosStatisticsRecord = shopInfosStatistics.get(shopId)
            if(shopInfosStatisticsRecord == undefined)
            {
                //initialize the first value
                const initValue = {
                    shopId: shopId,
                    shopInfo: null,
                    revenue: newRevenue,
                    sold: newSold,
                    productIds: [productId]
                }

                shopInfosStatistics.set(shopId, initValue)
            }
            else
            {
                shopInfosStatisticsRecord.revenue = shopInfosStatisticsRecord.revenue + newRevenue
                shopInfosStatisticsRecord.sold = shopInfosStatisticsRecord.sold + newSold
                shopInfosStatisticsRecord.productIds.push(productId)

                shopInfosStatistics.set(shopId, shopInfosStatisticsRecord)
            }
        })

        const fetchedShopInfos = await ShopSupportService.getListOfShopInfosByShopIds(Array.from(shopInfosStatistics.keys()))
        if(fetchedShopInfos != null)
        {
            fetchedShopInfos.forEach((fetchedShopInfo) =>
            {
                const statistics = shopInfosStatistics.get(fetchedShopInfo._id)
                if(statistics != undefined)
                {
                    statistics.shopInfo = fetchedShopInfo
                }
            })
        }
        
        let finalResult = Array.from(shopInfosStatistics.values())

        finalResult.sort((a, b) => b.sold - a.sold)

        return finalResult
    },

}

export default ShopStatisticsService