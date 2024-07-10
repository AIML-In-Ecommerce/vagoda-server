
import { OrderStatus } from '../shared/enums.js'
import StatisticsOrderService from './statistics.order.service.js'
import StatisticsAccessService from './statistics.access.service.js'
import StatisticsProductService from './statistics.product.service.js'
import ShopSupportService from '../support/shop.support.js'
import { access } from 'fs'
import Shop from '../models/shop/shop.model.js'
import { FromDateStringToUTCTime } from '../support/datestring.js'
import { count, time } from 'console'


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

        if(step == undefined || statistics.statisticData.length == 0)
        {
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
        }

        const getTargetIntervals = (start, end) =>
        {
            const result = []
            const worker = new FromDateStringToUTCTime()
            let moment = start
            while(moment < end)
            {
                let nextMoment = worker.getNextMoment(step, moment)
                if(nextMoment > end)
                {
                    nextMoment = end
                }
                const interval = [moment, nextMoment]
                result.push(interval)
                moment = nextMoment
            }

            return result
        }

        const targetIntervals = getTargetIntervals(startTimeToCheck, endTimeToCheck)

        //record of result will be:
        /**
         * {
         *      interval: [start; end]
         *      revenue: number
         *      count: number,
         *      statisticData: Order[]
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
                    statisticData: []
                })
            })

            let boundaryToChange = targetIntervals[0][1]
            let indexOfOrder = 0
            let indexOfInterval = 0

            // statistics.statisticData is an array of order which was sorted by the moment to check the target status
            for(; indexOfOrder < statistics.statisticData.length && indexOfInterval < targetIntervals.length; )
            {
                const targetOrderToCheck = statistics.statisticData[indexOfOrder]
                const timeToCheck = new Date(targetOrderToCheck.confirmStatus.time)

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
                    currentStatistics.statisticData.push(targetOrderToCheck)

                    indexOfOrder += 1
                }
            }

            return Array.from(mapOfIntervals.values())
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
        const statistics = await StatisticsOrderService.getOrderByShopWithStatus(shopId, targetOrderStatus, startTime, endTime)

        if(step == undefined || statistics.statisticData.length == 0)
        {
            return statistics
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

        const getTargetIntervals = (start, end) =>
            {
                const result = []
                const worker = new FromDateStringToUTCTime()
                let moment = start
                while(moment < end)
                {
                    let nextMoment = worker.getNextMoment(step, moment)
                    if(nextMoment > end)
                    {
                        nextMoment = end
                    }
                    const interval = [moment, nextMoment]
                    result.push(interval)
                    moment = nextMoment
                }
    
                return result
            }
    
        const targetIntervals = getTargetIntervals(startTimeToCheck, endTimeToCheck)

        //record of result will be:
        /**
         * {
         *      interval: [start; end]
         *      revenue: number
         *      count: number,
         *      statisticData: Order[]
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
                    statisticData: []
                })
            })

            let boundaryToChange = targetIntervals[0][1]
            let indexOfOrder = 0
            let indexOfInterval = 0

            // statistics.statisticData is an array of order which was sorted by the moment to check the target status
            for(; indexOfOrder < statistics.statisticData.length && indexOfInterval < targetIntervals.length; )
            {
                const targetOrderToCheck = statistics.statisticData[indexOfOrder]
                const timeToCheck = new Date(targetOrderToCheck.confirmStatus.time)

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
                    currentStatistics.statisticData.push(targetOrderToCheck)

                    indexOfOrder += 1
                }
            }

            return Array.from(mapOfIntervals.values())
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

        const targetOrderStatus = OrderStatus.PENDING
        const orderStatistics = await StatisticsOrderService.getOrderByShopWithStatus(shopId, targetOrderStatus, startTime, endTime)
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

        if(step == undefined)
        {
            let numberOfUserHasOrder = 0
            const userIdsInOrder = new Map()
    
            //this can help to remove duplicated userId
            orderStatistics.statisticData.forEach((item) =>
            {
                const userId = item.user.toString()
                userIdsInOrder.set(userId, false)
            })
    
            productAccessStatistics.forEach((record) =>
            {
                const isCountedFlag = userIdsInOrder.get(record.user)
                if(isCountedFlag != undefined && isCountedFlag == false)
                {
                    numberOfUserHasOrder += 1
                    userIdsInOrder.set(record.user, true)
                }
                else
                {
                    userIdsInOrder.set(record.user, false)
                }
            })

            const totalUserWhoAccess = Array.from(userIdsInOrder.keys()).length
    
            const conversionRate = totalUserWhoAccess > 0 ? numberOfUserHasOrder / totalUserWhoAccess : null
            
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

        const getTargetIntervals = (start, end) =>
            {
                const result = []
                const worker = new FromDateStringToUTCTime()
                let moment = start
                while(moment < end)
                {
                    let nextMoment = worker.getNextMoment(step, moment)
                    if(nextMoment > end)
                    {
                        nextMoment = end
                    }
                    const interval = [moment, nextMoment]
                    result.push(interval)
                    moment = nextMoment
                }
    
                return result
            }
    
        const targetIntervals = getTargetIntervals(startTimeToCheck, endTimeToCheck)

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
                    conversionRate: null,
                    statisticData: []
                })
            })

            let boundaryToChange = targetIntervals[0][1]
            let indexOfOrder = 0
            let indexOfInterval = 0
            let indexOfAccess = 0

            // statistics.statisticData is an array of order which was sorted by the moment to check the target status
            for(; indexOfOrder < orderStatistics.statisticData.length && indexOfInterval < targetIntervals.length; )
            {
                const targetOrderToCheck = orderStatistics.statisticData[indexOfOrder]
                const timeToCheck = new Date(targetOrderToCheck.confirmStatus.time)

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
                    currentStatistics.statisticData.push(targetOrderToCheck)
                    mapOfIntervals.set(indexOfInterval, currentStatistics)
                    indexOfOrder += 1
                }
            }

            //reset the state
            boundaryToChange = targetIntervals[0][1]
            indexOfInterval = 0
            for(; indexOfAccess < productAccessStatistics.length && indexOfInterval < targetIntervals.length; )
            {
                const targetAccessRecord = productAccessStatistics[indexOfAccess]
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
                    mapOfIntervals.set(indexOfInterval, currentStatistics)

                    indexOfAccess += 1
                }
            }

            mapOfIntervals.forEach((statistic, key) =>
            {
                const conversionRate = statistic.access > 0 ? statistic.orders / statistic.access : null
                if(conversionRate != null)
                {
                    intervalsHaveConversionRate += 1
                    totalConversionRate += conversionRate
                }

                statistic.conversionRate = conversionRate
            })

            return Array.from(mapOfIntervals.values())
        }

        const statisticData = getStatisticForEachInterval()

        const avgConversionRate = intervalsHaveConversionRate > 0 ? totalConversionRate / intervalsHaveConversionRate : null
        
        const finalResult = {
            totalRevenue: orderStatistics.totalRevenue,
            totalProfit: orderStatistics.totalProfit,
            avgRevenue: orderStatistics.avgRevenue,
            avgProfit: orderStatistics.avgProfit,
            totalOrders: orderStatistics.totalOrders,
            totalAccess: productAccessStatistics.length,
            conversionRate: avgConversionRate,
            statisticData: statisticData
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

    async getWebTrafficOfShop(shopId, startTime, endTime, step = undefined)
    {
        const rawProductAccessRecords = await StatisticsAccessService.getAccessProductRecordsByShopId(shopId, startTime, endTime, undefined, undefined, true)
        if(rawProductAccessRecords == null)
        {
            return null
        }

        if(step == undefined || rawProductAccessRecords.length == 0)
        {
            let totalAccess = 0
            const mapOfAccessUsers = new Map()
    
            rawProductAccessRecords.forEach((record) =>
            {
                totalAccess += 1
    
                let key = ""
                if(record.user != null)
                {
                    key = "AUTH:" + record.user
                }
                else if(record.sessionUser != null)
                {
                    key = "SESSION:" + record.sessionUser
                }
    
                let currentCount = mapOfAccessUsers.get(key)
                if(currentCount == undefined)
                {
                    //initialize a new value
                    const initCount = [record]
                    mapOfAccessUsers.set(key, initCount)
                }
                else
                {
                    currentCount.push(record)
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

        const getTargetIntervals = (start, end) =>
            {
                const result = []
                const worker = new FromDateStringToUTCTime()
                let moment = start
                while(moment < end)
                {
                    let nextMoment = worker.getNextMoment(step, moment)
                    if(nextMoment > end)
                    {
                        nextMoment = end
                    }
                    const interval = [moment, nextMoment]
                    result.push(interval)
                    moment = nextMoment
                }
    
                return result
            }
    
        const targetIntervals = getTargetIntervals(startTimeToCheck, endTimeToCheck)

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
            }

            //count access by mapOfUsers attributes
            mapOfIntervals.forEach((statistics, keyIndex) =>
            {
                const statisticData = []
                let users = 0
                statistics.mapOfAccessUsers.forEach((value, key) =>{
                    users += 1

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

                    mapOfAllUser.set(user, {})
                })

                statistics.users = users
                statistics.statisticData = statisticData
                statistics.mapOfAccessUsers = undefined
            })

            return Array.from(mapOfIntervals.values())
        }

        const statisticData = getStatisticForEachInterval()

        const finalResult = {
            totalAccess: rawProductAccessRecords.length,
            totalUsers: Array.from(mapOfAllUser.keys()).length,
            statisticData: statisticData
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

        rawSalesStatistics.statisticData.forEach((orderRecord) =>
        {
            const idDistrict = orderRecord.shippingAddress.idDistrict

            const currentValue = mapOfCityOrDistrictsSales.get(idDistrict)
            if(currentValue == undefined)
            {
                //initialize a new value
                const revenue = orderRecord.totalPrice
                const profit = orderRecord.profit
                const statisticData = [orderRecord]

                const initValue = {
                    idDistrict: idDistrict,
                    revenue: revenue,
                    profit: profit,
                    count: 1,
                    statisticData: statisticData
                }

                mapOfCityOrDistrictsSales.set(idDistrict, initValue)
            }
            else
            {
                const revenue = orderRecord.totalPrice
                const profit = orderRecord.profit
                currentValue.revenue += revenue
                currentValue.profit += profit
                currentValue.count += 1
                currentValue.statisticData.push(orderRecord)

                mapOfCityOrDistrictsSales.set(idDistrict, currentValue)
            }
        })

        const finalResult = {
            totalRevenue: rawSalesStatistics.totalRevenue,
            totalProfit: rawSalesStatistics.totalProfit,
            avgRevenue: rawSalesStatistics.avgRevenue,
            avgProfit: rawSalesStatistics.avgProfit,
            totalOrders: rawSalesStatistics.totalOrders,
            statisticData: Array.from(mapOfCityOrDistrictsSales.values())
        }

        return finalResult
    },

}

export default ShopStatisticsService