
import { OrderStatus } from '../shared/enums.js'
import StatisticsOrderService from './statistics.order.service.js'
import StatisticsAccessService from './statistics.access.service.js'
import StatisticsProductService from './statistics.product.service.js'
import ShopSupportService from '../support/shop.support.js'
import { access } from 'fs'
import Shop from '../models/shop/shop.model.js'


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

        const productAccessStatistics =  await StatisticsAccessService.getAccessProductRecordsByShopId(shopId, startTime, endTime, undefined, undefined)
        if(productAccessStatistics == null)
        {
            console.log("Null productAccessStatistics in getConversionOfViewAndSale")
            return null
        }

        let numberOfUserHasOrder = 0
        const userIdsInOrder = new Map()

        //this can help to remove duplicated userId
        orderStatistics.statisticData.forEach((item) =>
        {
            const userId = item.user.toString()
            userIdsInOrder.set(userId, true)
        })

        productAccessStatistics.forEach((record) =>
        {
            const isCountedFlag = userIdsInOrder.get(record.user.toString())
            if(isCountedFlag != undefined && isCountedFlag == true)
            {
                numberOfUserHasOrder += 1
                userIdsInOrder.set(record.user.toString(), false)
            }
        })

        const conversionRate = productAccessStatistics.length > 0 ? numberOfUserHasOrder / productAccessStatistics.length : null
        
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

    async getTopGlobalShopsHaveProductsInTopSales(amount = undefined, startTime = undefined, endTime = undefined, useCompensation = false)
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

        let compensationShops = []

        if(useCompensation == true)
        {
            const rawCompensationShops = await Shop.find({_id: {$nin: Array.from(shopInfosStatistics.keys())}})
            compensationShops = rawCompensationShops.map((record) =>
            {
                const clonedRecord = JSON.parse(JSON.stringify(record))

                const result = {
                    shopId: clonedRecord._id,
                    shopInfo: clonedRecord,
                    revenue: 0,
                    sold: 0,
                    productIds: []
                }

                return result
            })
        }

        finalResult = finalResult.concat(compensationShops)

        if(amount != undefined)
        {
            finalResult = finalResult.slice(0, amount)
        }

        return finalResult
    },

    async getReturningRateOfShop(shopId, startTime, endTime)
    {
        const targetOrderStatus = OrderStatus.PENDING
        const rawTargetOrderStatistics = await StatisticsOrderService.getCompletedOrderByShopWithStatus(shopId, targetOrderStatus, startTime, endTime)
        if(rawTargetOrderStatistics == null)
        {
            return null
        }

        let previousEndTime = new Date(2000, 0, 1)

        if(startTime != undefined)
        {
            previousEndTime = new Date(new Date(startTime).setSeconds((new Date(startTime).getSeconds() - 1)))
        }

        const allRawOrderStatistics = await StatisticsOrderService.getCompletedOrderByShopWithStatus(shopId, targetOrderStatus, undefined, previousEndTime)
        if(allRawOrderStatistics == null)
        {
            return null
        }


        const mapOfReturningUserToOrders = new Map()

        allRawOrderStatistics.statisticData.forEach((orderRecord) =>
        {
            const userId = orderRecord.user
            mapOfReturningUserToOrders.set(userId, [])
        })

        let totalOrdersOfReturningUsers = 0

        rawTargetOrderStatistics.statisticData.forEach((orderRecord, index) =>
        {
            const userId = orderRecord.user
            const listOfOrderIndex = mapOfReturningUserToOrders.get(userId)
            if(listOfOrderIndex != undefined)
            {
                //this is a user who returns to make a transaction
                listOfOrderIndex.push(index)
                totalOrdersOfReturningUsers += 1 
                mapOfReturningUserToOrders.set(userId, listOfOrderIndex)
            }
        })

        let totalUsers = 0
        let totalOrders = rawTargetOrderStatistics.statisticData.length
        let totalRevenue = 0
        let totalProfit = 0
        const listOfReturningUsers = []

        mapOfReturningUserToOrders.forEach((value, key) =>
        {
            totalUsers += 1

            if(value.length > 0)
            {
                //this is a returning user
                let revenue = 0
                let profit = 0
                const orders = value.map((orderRecordIndex) =>
                {
                    const orderRecord = rawTargetOrderStatistics.statisticData[orderRecordIndex]
                    revenue += orderRecord.totalPrice
                    profit += orderRecord.profit
                    return orderRecord
                })
                
                totalRevenue += revenue
                totalProfit += profit

                const returningUserRecord = {
                    user: key,
                    revenue: revenue,
                    profit: profit,
                    orders: orders
                }

                listOfReturningUsers.push(returningUserRecord)
            }
        })

        const returningRate = totalUsers > 0 ? listOfReturningUsers.length / totalUsers : null

        const finalResult = 
        {
            revenue: totalRevenue,
            profit: totalProfit,
            totalOrders: totalOrders,
            totalUsers: totalUsers,
            totalReturningUsers: listOfReturningUsers.length,
            returningRate: returningRate,
            statisticData: listOfReturningUsers
        }

        return finalResult
    },  

    async getWebTrafficOfShop(shopId, startTime, endTime)
    {
        const rawProductAccessRecords = await StatisticsAccessService.getAccessProductRecordsByShopId(shopId, startTime, endTime, undefined, undefined)
        if(rawProductAccessRecords == null)
        {
            return null
        }

        let totalAccess = 0
        const mapOfAccessUsers = new Map()

        rawProductAccessRecords.forEach((record) =>
        {
            totalAccess += 1

            let key = ""
            if(record.user != null)
            {
                key = "AUTH:" + record.user.toString()
            }
            else if(record.sessionUser != null)
            {
                key = "SESSION:" + record.sessionUser
            }

            const currentCount = mapOfAccessUsers.get(key)
            if(currentCount == undefined)
            {
                //initialize a new value
                const initCount = 1
                mapOfAccessUsers.set(key, initCount)
            }
            else
            {
                currentCount += 1
                mapOfAccessUsers.set(key, currentCount)
            }
        })

        const statisticData = []

        mapOfAccessUsers.forEach((value, key) =>
        {
            const keys = key.split(":")
            const userType = keys[0]
            const user = key[1]
            const userAccessRecord = 
            {
                user: user,
                userType: userType,
                access: value
            }

            statisticData.push(userAccessRecord)
        })

        const finalResult = {
            totalAccess: totalAccess,
            totalUsers: statisticData.length,
            statisticData: statisticData
        }

        return finalResult
    },

}

export default ShopStatisticsService