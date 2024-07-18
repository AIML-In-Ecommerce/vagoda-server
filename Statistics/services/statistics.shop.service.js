
import { OrderStatus } from '../shared/enums.js'
import StatisticsOrderService from './statistics.order.service.js'
import StatisticsAccessService from './statistics.access.service.js'
import StatisticsProductService from './statistics.product.service.js'
import ShopSupportService from '../support/shop.support.js'
import Shop from '../models/shop/shop.model.js'
import SupportDateService from '../support/date.service.js'


const ShopStatisticsService =
{

    async getShopTotalSales(shopId, startTime = undefined, endTime = undefined, step = undefined)
    {
        let startTimeToCheck = new Date(2000, 0, 1)
        let endTimeToCheck = new Date()

        if(startTime != undefined)
        {
            startTimeToCheck = new Date(startTime)
        }
        if(endTime != undefined)
        {
            endTimeToCheck = new Date(endTime)
        }

        // const targetOrderStatus = OrderStatus.PROCESSING
        const statistics = await StatisticsOrderService.getSalesByShop(shopId, startTime, endTime)

        if(statistics == null)
        {
            return null
        }

        let targetIntervals = []

        if(step == undefined)
        {
            targetIntervals = [[startTimeToCheck, endTimeToCheck]]
        }
        else
        {
            targetIntervals = SupportDateService.getClosedIntervals(startTimeToCheck, endTimeToCheck, step)
        }

        //record of result will be:
        /**
         * {
         *      interval: [start; end]
         *      revenue: number
         *      count: number,
         *      statisticsData: Order[]
         * }
         */
        const getStatisticForEachInterval = () =>
        {
            const mapOfIntervals = new Map()
            targetIntervals.forEach((interval, index) =>
            {
                mapOfIntervals.set(index, {
                    interval: interval,
                    revenue: 0,
                    profit: 0,
                    count: 0,
                    statisticsData: []
                })
            })

            let boundaryToChange = targetIntervals[0][1]
            let indexOfOrder = 0
            let indexOfInterval = 0

            // statistics.statisticsData is an array of order which was sorted by the moment to check the target status
            for(; indexOfOrder < statistics.statisticsData.length && indexOfInterval < targetIntervals.length; )
            {
                const targetOrderToCheck = statistics.statisticsData[indexOfOrder]
                const timeToCheck = new Date(targetOrderToCheck.confirmedStatus.time)

                if(timeToCheck > boundaryToChange)
                {
                    indexOfInterval += 1
                    boundaryToChange = targetIntervals[indexOfInterval][1]
                }
                else if(timeToCheck >= targetIntervals[indexOfInterval][0] && 
                    timeToCheck <= targetIntervals[indexOfInterval][1]
                )
                {
                    const currentStatistics = mapOfIntervals.get(indexOfInterval)
                    currentStatistics.revenue += targetOrderToCheck.totalPrice
                    currentStatistics.profit += targetOrderToCheck.profit
                    currentStatistics.count += 1
                    currentStatistics.statisticsData.push(targetOrderToCheck)

                    indexOfOrder += 1
                }
                else
                {
                    indexOfInterval += 1
                }
            }

            const result = targetIntervals.map((interval, index) =>
            {
                return mapOfIntervals.get(index)
            })

            return result
        }

        const statisticsDataForEachInterval = getStatisticForEachInterval()

        const finalResult = 
        {
            totalOrders: statistics.totalOrders,
            totalRevenue: statistics.totalRevenue,
            totalProfit: statistics.totalProfit,
            avgRevenue: statistics.avgRevenue,
            avgProfit: statistics.avgProfit,
            statisticsData: statisticsDataForEachInterval
        }

        return finalResult
    },

    async getRevenueOfShop(shopId, startTime, endTime, step)
    {
        const targetOrderStatus = OrderStatus.COMPLETED
        const statistics = await StatisticsOrderService.getOrderByShopWithStatus(shopId, targetOrderStatus, startTime, endTime, true)

        let startTimeToCheck = new Date(2000, 0, 1)
        let endTimeToCheck = new Date()

        if(startTime != undefined)
        {
            startTimeToCheck = new Date(startTime)
        }
        if(endTime != undefined)
        {
            endTimeToCheck = new Date(endTime)
        }
    
        let targetIntervals = []

        if(step == undefined)
        {
            targetIntervals = [[startTimeToCheck, endTimeToCheck]]
        }
        else
        {
            targetIntervals = SupportDateService.getClosedIntervals(startTimeToCheck, endTimeToCheck, step)
        }

        //record of result will be:
        /**
         * {
         *      interval: [start; end]
         *      revenue: number
         *      count: number,
         *      statisticsData: Order[]
         * }
         */
        const getStatisticForEachInterval = () =>
        {
            const mapOfIntervals = new Map()
            targetIntervals.forEach((interval, index) =>
            {
                mapOfIntervals.set(index, {
                    interval: interval,
                    revenue: 0,
                    profit: 0,
                    count: 0,
                    statisticsData: []
                })
            })

            let boundaryToChange = targetIntervals[0][1]
            let indexOfOrder = 0
            let indexOfInterval = 0

            // statistics.statisticsData is an array of order which was sorted by the moment to check the target status
            for(; indexOfOrder < statistics.statisticsData.length && indexOfInterval < targetIntervals.length; )
            {
                const targetOrderToCheck = statistics.statisticsData[indexOfOrder]
                const timeToCheck = new Date(targetOrderToCheck.confirmedStatus.time)

                if(timeToCheck > boundaryToChange)
                {
                    indexOfInterval += 1
                    boundaryToChange = targetIntervals[indexOfInterval][1]
                }
                else if(timeToCheck >= targetIntervals[indexOfInterval][0] && 
                    timeToCheck <= targetIntervals[indexOfInterval][1]
                )
                {
                    const currentStatistics = mapOfIntervals.get(indexOfInterval)
                    currentStatistics.revenue += targetOrderToCheck.totalPrice
                    currentStatistics.profit += targetOrderToCheck.profit
                    currentStatistics.count += 1
                    currentStatistics.statisticsData.push(targetOrderToCheck)

                    indexOfOrder += 1
                }
                else
                {
                    indexOfInterval += 1
                }
            }

            const result = targetIntervals.map((interval, index) =>
            {
                return mapOfIntervals.get(index)
            })

            return result
        }

        const statisticsDataForEachInterval = getStatisticForEachInterval()

        const finalResult = 
        {
            totalOrders: statistics.totalOrders,
            totalRevenue: statistics.totalRevenue,
            totalProfit: statistics.totalProfit,
            avgRevenue: statistics.avgRevenue,
            avgProfit: statistics.avgProfit,
            statisticsData: statisticsDataForEachInterval
        }

        return finalResult
    },

    async getConversionOfViewAndSale(shopId, startTime = undefined, endTime = undefined, step = undefined)
    {
        // let endTimeToCheck = new Date().getTime()
        // let startTimeToCheck = 0

        const targetOrderStatus = OrderStatus.PROCESSING
        const orderStatistics = await StatisticsOrderService.getOrderByShopWithStatus(shopId, targetOrderStatus, startTime, endTime, true)
        if(orderStatistics == null)
        {
            console.log("Null orderStatistics in getConversionOfViewAndSale")
            return null
        }

        const productAccessStatistics =  await StatisticsAccessService.getAccessProductRecordsByShopId(shopId, startTime, endTime, undefined, undefined, true)
        if(productAccessStatistics == null)
        {
            console.log("Null productAccessStatistics in getConversionOfViewAndSale")
            return null
        }

        let startTimeToCheck = new Date(2000, 0, 1)
        let endTimeToCheck = new Date()

        //else
        if(startTime != undefined)
        {
            startTimeToCheck = new Date(startTime)
        }
        if(endTime != undefined)
        {
            endTimeToCheck = new Date(endTime)
        }
    
        let targetIntervals = []

        if(step == undefined)
        {
            targetIntervals = [[startTimeToCheck, endTimeToCheck]]
        }
        else
        {
            targetIntervals = SupportDateService.getClosedIntervals(startTimeToCheck, endTimeToCheck, step)
        }

        let intervalsHaveConversionRate = 0
        let totalConversionRate = 0

        const getStatisticForEachInterval = () =>
        {
            const mapOfIntervals = new Map()

            targetIntervals.forEach((interval, index) =>
            {
                mapOfIntervals.set(index, {
                    interval: interval,
                    access: 0,
                    orders: 0,
                    revenue: 0,
                    profit: 0,
                    mapOfUsers: new Map(),
                    mapOfAccessUsers: new Map(),
                    conversionRate: null,
                    statisticsData: []
                })
            })

            let boundaryToChange = targetIntervals[0][1]
            let indexOfOrder = 0
            let indexOfInterval = 0
            let indexOfAccess = 0

            // statistics.statisticsData is an array of order which was sorted by the moment to check the target status
            for(; indexOfOrder < orderStatistics.statisticsData.length && indexOfInterval < targetIntervals.length; )
            {
                const targetOrderToCheck = orderStatistics.statisticsData[indexOfOrder]
                const timeToCheck = new Date(targetOrderToCheck.confirmedStatus.time)

                if(timeToCheck > boundaryToChange)
                {
                    indexOfInterval += 1
                    boundaryToChange = targetIntervals[indexOfInterval][1]
                }
                else if(timeToCheck >= targetIntervals[indexOfInterval][0] && 
                    timeToCheck <= targetIntervals[indexOfInterval][1]
                )
                {
                    const currentStatistics = mapOfIntervals.get(indexOfInterval)
                    currentStatistics.revenue += targetOrderToCheck.totalPrice
                    currentStatistics.profit += targetOrderToCheck.profit
                    currentStatistics.orders += 1
                    currentStatistics.statisticsData.push(targetOrderToCheck)

                    currentStatistics.mapOfUsers.set(targetOrderToCheck.user, true)

                    mapOfIntervals.set(indexOfInterval, currentStatistics)
                    indexOfOrder += 1
                }
                else
                {
                    // indexOfInterval += 1
                    break
                }
            }

            //reset the state
            boundaryToChange = targetIntervals[0][1]
            indexOfInterval = 0
            for(; indexOfAccess < productAccessStatistics.length && indexOfInterval < targetIntervals.length; )
            {
                const targetAccessRecord = productAccessStatistics[indexOfAccess]
                const timeToCheck = new Date(targetAccessRecord.time)
                let userAccessId = null
                if(targetAccessRecord.user != null)
                {
                    userAccessId = targetAccessRecord.user
                }
                else if(targetAccessRecord.sessionUser != null)
                {
                    userAccessId = targetAccessRecord.sessionUser
                }

                if(timeToCheck > boundaryToChange)
                {
                    indexOfInterval += 1
                    boundaryToChange = targetIntervals[indexOfInterval][1]
                }
                else if(timeToCheck >= targetIntervals[indexOfInterval][0] && 
                    timeToCheck <= targetIntervals[indexOfInterval][1]
                )
                {
                    const currentStatistics = mapOfIntervals.get(indexOfInterval)
                    currentStatistics.access += 1

                    if(userAccessId != null)
                    {
                        currentStatistics.mapOfAccessUsers.set(userAccessId, true)
                    }
                    
                    mapOfIntervals.set(indexOfInterval, currentStatistics)

                    indexOfAccess += 1
                }
            }

            const result = targetIntervals.map((interval, index) =>
            {
                const statistic = mapOfIntervals.get(index)
                const usersHaveOrders = Array.from(statistic.mapOfUsers.keys())
                const usersAccessed = Array.from(statistic.mapOfAccessUsers.keys())

                const conversionRate = usersAccessed.length > 0 ? usersHaveOrders.length / usersAccessed.length : null
                if(conversionRate != null)
                {
                    intervalsHaveConversionRate += 1
                    totalConversionRate += conversionRate
                }

                statistic.usersHaveOrders = usersHaveOrders
                statistic.usersAccessed = usersAccessed
                statistic.conversionRate = conversionRate
                statistic.mapOfUsers = undefined
                statistic.mapOfAccessUsers = undefined

                mapOfIntervals.set(index, statistic)

                return statistic
            })

            return result
        }

        const statisticsData = getStatisticForEachInterval()

        const avgConversionRate = intervalsHaveConversionRate > 0 ? totalConversionRate / intervalsHaveConversionRate : null
        
        const finalResult = {
            totalRevenue: orderStatistics.totalRevenue,
            totalProfit: orderStatistics.totalProfit,
            avgRevenue: orderStatistics.avgRevenue,
            avgProfit: orderStatistics.avgProfit,
            totalOrders: orderStatistics.totalOrders,
            totalAccess: productAccessStatistics.length,
            conversionRate: avgConversionRate,
            statisticsData: statisticsData
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

    async getReturningRateOfShop(shopId, startTime, endTime, step = undefined)
    {
        const targetOrderStatus = OrderStatus.PENDING
        const rawTargetOrderStatistics = await StatisticsOrderService.getOrderByShopWithStatus(shopId, targetOrderStatus, startTime, endTime, true)
        if(rawTargetOrderStatistics == null)
        {
            return null
        }

        let previousEndTime = new Date(2000, 0, 1)

        if(startTime != undefined)
        {
            previousEndTime = new Date(new Date(startTime).setSeconds((new Date(startTime).getSeconds() - 1)))
        }

        const allRawOrderStatistics = await StatisticsOrderService.getOrderByShopWithStatus(shopId, targetOrderStatus, undefined, previousEndTime, true)
        if(allRawOrderStatistics == null)
        {
            return null
        }

        let startTimeToCheck = new Date(2000, 0, 1)
        let endTimeToCheck = new Date()
        if(startTime != undefined)
        {
            startTimeToCheck = new Date(startTime)
        }
        if(endTime != undefined)
        {
            endTimeToCheck = new Date(endTime)
        }

        let targetIntervals = []
        if(step == undefined)
        {
            targetIntervals = [[startTimeToCheck, endTimeToCheck]]
        }
        else
        {
            targetIntervals = SupportDateService.getClosedIntervals(startTimeToCheck, endTimeToCheck, step)
        }

        const mapOfAllUsers = new Map()
        const mapOfAllReturningUsers = new Map()
        let totalRevenue = 0
        let totalProfit = 0
        let totalReturningRevenue = 0
        let totalReturningProfit = 0

        allRawOrderStatistics.statisticsData.forEach((orderRecord) =>
        {
            const userId = orderRecord.user
            mapOfAllUsers.set(userId, {})
        })

        const getStatisticForEachInterval = () =>
        {
            const mapOfIntervals = new Map()
            targetIntervals.forEach((interval, index) =>
            {
                const initValue = {
                    interval: interval,
                    totalOrders: 0,
                    totalRevenue: 0,
                    totalProfit: 0,
                    totalReturningRevenue: 0,
                    totalReturningProfit: 0,
                    totalUsers: 0,
                    totalReturingUsers: 0,
                    returningRate: null,
                    mapOfReturningUsers: new Map()
                }

                mapOfIntervals.set(index, initValue)
            })

            let boundaryToChange = targetIntervals[0][1]
            // let startIndexOfCheckingOrder= 0
            let indexOfInterval = 0
            let indexOfOrder = 0

            for(; indexOfOrder < rawTargetOrderStatistics.statisticsData.length && indexOfInterval < targetIntervals.length;)
            {
                const targetOrderRecord = rawTargetOrderStatistics.statisticsData[indexOfOrder]
                const timeToCheck = new Date(targetOrderRecord.confirmedStatus.time)

                if(timeToCheck > boundaryToChange)
                {
                    indexOfInterval += 1
                    boundaryToChange = targetIntervals[indexOfInterval][1]
                }
                else if(timeToCheck >= targetIntervals[indexOfInterval][0] && timeToCheck <= targetIntervals[indexOfInterval][1])
                {
                    const targetUserId = targetOrderRecord.user

                    const currentStatistics = mapOfIntervals.get(indexOfInterval)
                    const mapOfReturningUsers = currentStatistics.mapOfReturningUsers

                    currentStatistics.totalOrders += 1
                    currentStatistics.totalRevenue += targetOrderRecord.totalPrice
                    currentStatistics.totalProfit += targetOrderRecord.profit

                    if(mapOfAllUsers.get(targetUserId) != undefined)
                    {
                        // this is a returning user
                        mapOfAllReturningUsers.set(targetUserId, true)
                        
                        currentStatistics.totalReturningRevenue += targetOrderRecord.totalPrice
                        currentStatistics.totalReturningProfit += targetOrderRecord.profit

                        const userStatistics = mapOfReturningUsers.get(targetUserId)
                        if(userStatistics == undefined)
                        {
                            const initUserStatistics = [targetOrderRecord]
                            mapOfReturningUsers.set(targetUserId, initUserStatistics)
                        }
                        else
                        {
                            userStatistics.push(targetOrderRecord)
                            mapOfReturningUsers.set(targetUserId, userStatistics)
                        }
                    }
                    else
                    {
                        //this is a new user
                        mapOfAllReturningUsers.set(targetUserId, false)
                        mapOfAllUsers.set(targetUserId, {})
                    }

                    mapOfIntervals.set(indexOfInterval, currentStatistics)
                    indexOfOrder += 1
                }
                else
                {
                    break;
                }
            }

            const result = targetIntervals.map((interval, index) =>
            {
                const intervalStatistics = mapOfIntervals.get(index)
                const mapOfReturningUsers = intervalStatistics.mapOfReturningUsers
                
                totalRevenue += intervalStatistics.totalRevenue
                totalProfit += intervalStatistics.totalProfit
                totalReturningRevenue += intervalStatistics.totalReturningRevenue
                totalReturningProfit += intervalStatistics.totalReturningProfit
                
                let statisticsData = []
                mapOfReturningUsers.forEach((value, key) =>
                {
                    intervalStatistics.totalUsers += 1
                    if(value.length > 1)
                    {
                        //this is a returning user
                        intervalStatistics.totalReturingUsers += 1
                        statisticsData = statisticsData.concat(value)
                    }
                })

                const returningRate = intervalStatistics.totalUsers > 0 ? (intervalStatistics.totalReturingUsers / intervalStatistics.totalUsers) : null
                intervalStatistics.returningRate = returningRate
                intervalStatistics.statisticsData = statisticsData
                intervalStatistics.mapOfReturningUsers = undefined

                return intervalStatistics
            })

            return result
        }

        const statisticsDataForEachInterval = getStatisticForEachInterval()

        const usersInBigInterval = []
        const returningUsersInBigInterval = []

        mapOfAllReturningUsers.forEach((isReturningUser, userId) =>
        {
            usersInBigInterval.push(userId)
            if(isReturningUser == true)
            {
                returningUsersInBigInterval.push(userId)
            }
        })


        const finalResult = {
            totalOrders: rawTargetOrderStatistics.statisticsData.length,
            totalRevenue: totalRevenue,
            totalProfit: totalProfit,
            totalReturningRevenue: totalReturningRevenue, 
            totalReturningProfit: totalReturningProfit,
            totalUsers: usersInBigInterval.length,
            totalReturningUsers: returningUsersInBigInterval.length,
            statisticsData: statisticsDataForEachInterval
        }

        return finalResult
    },  

    async getWebTrafficOfShop(shopId, startTime, endTime, step = undefined)
    {
        const rawProductAccessRecords = await StatisticsAccessService.getAccessProductRecordsByShopId(shopId, startTime, endTime, undefined, undefined, true)
        if(rawProductAccessRecords == null)
        {
            return null
        }

        let startTimeToCheck = new Date(2000, 0, 1)
        let endTimeToCheck = new Date()
        if(startTime != undefined)
        {
            startTimeToCheck = new Date(startTime)
        }
        if(endTime != undefined)
        {
            endTimeToCheck = new Date(endTime)
        }
    
        let targetIntervals = []

        if(step == undefined)
        {
            targetIntervals = [[startTimeToCheck, endTimeToCheck]]
        }
        else
        {
            targetIntervals = SupportDateService.getClosedIntervals(startTimeToCheck, endTimeToCheck, step)
        }

        const mapOfAllUser = new Map()

        const getStatisticForEachInterval = () =>
        {
            const mapOfIntervals = new Map()
            
            targetIntervals.forEach((interval, index) =>
            {
                mapOfIntervals.set(index, {
                    interval: interval,
                    access: 0,
                    users: 0,
                    mapOfAccessUsers: new Map() //user-access map 
                })
            })

            let indexOfInterval = 0
            let boundaryToChange = targetIntervals[0][1]
            let indexOfAccess = 0

            for(; indexOfAccess < rawProductAccessRecords.length && indexOfInterval < targetIntervals.length; )
            {
                const targetAccessRecord = rawProductAccessRecords[indexOfAccess]
                const timeToCheck = new Date(targetAccessRecord.time)

                if(timeToCheck > boundaryToChange)
                {
                    indexOfInterval += 1
                    boundaryToChange = targetIntervals[indexOfInterval][1]
                }
                else if(timeToCheck >= targetIntervals[indexOfInterval][0] &&
                    timeToCheck <= targetIntervals[indexOfInterval][1]
                )
                {
                    const currentStatistics = mapOfIntervals.get(indexOfInterval)

                    currentStatistics.access += 1

                    let key = ""
                    if(targetAccessRecord.user != null)
                    {
                        key = "AUTH:" + targetAccessRecord.user
                    }
                    else if(targetAccessRecord.sessionUser != null)
                    {
                        key = "SESSION:" + targetAccessRecord.sessionUser
                    }
        
                    let currentCount = currentStatistics.mapOfAccessUsers.get(key)
                    if(currentCount == undefined)
                    {
                        //initialize a new value
                        const initCount = [targetAccessRecord]
                        currentStatistics.mapOfAccessUsers.set(key, initCount)
                    }
                    else
                    {
                        currentCount.push(targetAccessRecord)
                        currentStatistics.mapOfAccessUsers.set(key, currentCount)
                    }

                    indexOfAccess += 1
                }
                else
                {
                    indexOfInterval += 1
                }
            }

            //count access by mapOfUsers attributes
            const result = targetIntervals.map((interval, index) =>
            {
                const statistics = mapOfIntervals.get(index)
                const statisticsData = []
                let users = 0
                statistics.mapOfAccessUsers.forEach((value, key) =>{
                    users += 1

                    const keys = key.split(":")
                    const userType = keys[0]
                    const user = keys[1]

                    const userAccessRecord = 
                    {
                        user: user,
                        userType: userType,
                        access: value
                    }
                    statisticsData.push(userAccessRecord)

                    mapOfAllUser.set(user, {})
                })

                statistics.users = users
                statistics.statisticsData = statisticsData
                statistics.mapOfAccessUsers = undefined

                mapOfIntervals.set(index, statistics)

                return statistics
            })

            return result
        }

        const statisticsData = getStatisticForEachInterval()

        const finalResult = {
            totalAccess: rawProductAccessRecords.length,
            totalUsers: Array.from(mapOfAllUser.keys()).length,
            statisticsData: statisticsData
        }
        
        return finalResult
    },

    async getTopCityInSales(shopId, startTime = undefined, endTime = undefined, amount = undefined)
    {
        const rawSalesStatistics = await StatisticsOrderService.getSalesByShop(shopId, startTime, endTime)
        if(rawSalesStatistics == null)
        {
            return null
        }

        const mapOfCityOrDistrictsSales = new Map()

        rawSalesStatistics.statisticsData.forEach((orderRecord) =>
        {
            const idProvince = orderRecord.shippingAddress.idProvince

            const currentValue = mapOfCityOrDistrictsSales.get(idProvince)
            if(currentValue == undefined)
            {
                //initialize a new value
                const revenue = orderRecord.totalPrice
                const profit = orderRecord.profit
                const statisticsData = [orderRecord]

                const initValue = {
                    idProvince: idProvince,
                    revenue: revenue,
                    profit: profit,
                    count: 1,
                    statisticsData: statisticsData
                }

                mapOfCityOrDistrictsSales.set(idProvince, initValue)
            }
            else
            {
                const revenue = orderRecord.totalPrice
                const profit = orderRecord.profit
                currentValue.revenue += revenue
                currentValue.profit += profit
                currentValue.count += 1
                currentValue.statisticsData.push(orderRecord)

                mapOfCityOrDistrictsSales.set(idProvince, currentValue)
            }
        })

        const finalResult = {
            totalRevenue: rawSalesStatistics.totalRevenue,
            totalProfit: rawSalesStatistics.totalProfit,
            avgRevenue: rawSalesStatistics.avgRevenue,
            avgProfit: rawSalesStatistics.avgProfit,
            totalOrders: rawSalesStatistics.totalOrders,
            statisticsData: Array.from(mapOfCityOrDistrictsSales.values())
        }

        return finalResult
    },

}

export default ShopStatisticsService