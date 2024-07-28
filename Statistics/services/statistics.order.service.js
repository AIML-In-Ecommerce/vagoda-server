import mongoose from "mongoose"
import Order from "../models/order/order.model.js"
import { OrderStatus } from "../shared/enums.js"
import SupportDateService from "../support/date.service.js"


const StatisticsOrderService = 
{

    fromOrderStatisticsToCloseIntervals(orderStatistics, startTime = undefined, endTime = undefined, step = undefined)
    {
        if(orderStatistics == null)
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

        const getStatisticForEachInterval = () =>
        {
            const mapOfIntervals = new Map()
            targetIntervals.forEach((interval, index) =>
            {
                const initValue = {
                    interval: interval,
                    revenue: 0,
                    profit: 0,
                    avgRevenue: 0,
                    avgProfit: 0,
                    totalOrders: 0,
                    statisticsData: []
                }
                mapOfIntervals.set(index, initValue)
            })

            let boundaryToChange = targetIntervals[0][1]
            let indexOfInterval = 0
            let indexOfOrder = 0
            
            for(; indexOfOrder < orderStatistics.statisticsData.length && indexOfInterval < targetIntervals.length;)
            {
                const targetOrderRecord = orderStatistics.statisticsData[indexOfOrder]
                const timeToCheck = new Date(targetOrderRecord.confirmedStatus.time)
                
                if(timeToCheck > boundaryToChange)
                {
                    indexOfInterval += 1
                    boundaryToChange = targetIntervals[indexOfInterval][1]
                }
                else if(timeToCheck >= targetIntervals[indexOfInterval][0] && timeToCheck <= targetIntervals[indexOfInterval][1])
                {
                    const currentStatistics = mapOfIntervals.get(indexOfInterval)
                    if(currentStatistics != undefined)
                    {
                        currentStatistics.revenue += targetOrderRecord.totalPrice
                        currentStatistics.profit += targetOrderRecord.profit
                        currentStatistics.statisticsData.push(targetOrderRecord)
                        currentStatistics.totalOrders += 1

                        mapOfIntervals.set(indexOfInterval, currentStatistics)

                        indexOfOrder += 1
                    }
                }
                else
                {
                    break;
                }
            }

            const result = targetIntervals.map((interval, index) =>
            {
                const statistics = mapOfIntervals.get(index)
                if(statistics.totalOrders > 0)
                {
                    statistics.avgRevenue = statistics.revenue / statistics.totalOrders
                    statistics.avgProfit = statistics.avgProfit / statistics.totalOrders
                }

                return statistics
            })

            return result
        }

        const statisticsDataForEachInterval = getStatisticForEachInterval()

        const finalResult = {
            totalRevenue: orderStatistics.totalRevenue,
            totalProfit: orderStatistics.totalProfit,
            avgRevenue: orderStatistics.avgRevenue,
            avgProfit: orderStatistics.avgProfit,
            totalOrders: orderStatistics.totalOrders,
            statisticsData: statisticsDataForEachInterval
        }

        return finalResult
    },
    
    /**
     * Get all orders of a shop at the moment that is between startTime and endTime,
     * whether the status of the order was completed or not
     * 
     * @param {*} shopId 
     * @param {*} targetOrderStatus 
     * @param {*} startTime 
     * @param {*} endTime 
     * @returns 
     */
    async getOrderByShopWithStatus(shopId, targetOrderStatus, startTime = undefined, endTime = undefined, isAscending = false)
    {
        let endTimeToCheck = new Date()
        let startTimeToCheck = new Date(2000, 0, 1)

        if(startTime != undefined)
        {
            startTimeToCheck = new Date(startTime)
        }
        if(endTime != undefined)
        {
            endTimeToCheck = new Date(endTime)
        }

        let sortState = -1
        if(isAscending == true)
        {
            sortState = 1
        }

        const castedShopId = mongoose.Types.ObjectId.createFromHexString(shopId)

        const pipeline = [
            {
                $match: {
                    shop: castedShopId,
                    orderStatus: {
                    $elemMatch: {
                        status: targetOrderStatus,
                        time: {
                            $gte: startTimeToCheck,
                            $lte: endTimeToCheck
                        }
                    }
                  }
                }
            },
            {
                $addFields: {
                    confirmedStatus: {
                        $arrayElemAt: ["$orderStatus", {
                        $indexOfArray: ["$orderStatus.status", targetOrderStatus]
                    }]
                  }
                }
            },
            {
                $project: {
                    orderStatus: 0
                }
            },
            {
                $sort: {
                    "confirmedStatus.time": sortState
                }
            },
        ]

        // const rawOrders =  await Order.find({shop: shopId})
        const rawOrders =  await Order.aggregate(pipeline)

        if(rawOrders == null)
        {
            return null
        }

        let totalRevenue = 0
        let totalProfit = 0
        const statisticsData = []

        rawOrders.forEach((order) =>
        {
            const data = JSON.parse(JSON.stringify(order))

            totalRevenue += order.totalPrice
            totalProfit += order.profit

            statisticsData.push(data)
        })

        const avgRevenue = statisticsData.length == 0 ? 0 : totalRevenue / statisticsData.length
        const avgProfit = statisticsData.length == 0 ? 0: totalProfit / statisticsData.length

        const finalResult = 
        {
            totalRevenue: totalRevenue,
            totalProfit: totalProfit,
            avgRevenue: avgRevenue,
            avgProfit: avgProfit,
            totalOrders: statisticsData.length,
            statisticsData: statisticsData
        }

        return finalResult
    },

    /**
     * Get all orders of a shop at the moment that is between startTime and endTime,
     * and the status at that moment was completed
     * 
     * @param {*} shopId 
     * @param {*} targetOrderStatus 
     * @param {*} startTime 
     * @param {*} endTime 
     * @returns 
     */
    async getCompletedOrderByShopWithStatus(shopId, targetOrderStatus, startTime = undefined, endTime = undefined, isAscending = false)
    {
        let endTimeToCheck = new Date()
        let startTimeToCheck = new Date(2000, 0, 1)
        if(startTime != undefined)
        {
            startTimeToCheck = new Date(startTime)
        }
        if(endTime != undefined)
        {
            endTimeToCheck = new Date(endTime)
        }

        let sortState = -1
        if(isAscending == true)
        {
            sortState = 1
        }

        const castedShopId = mongoose.Types.ObjectId.createFromHexString(shopId)

        const pipeline = [
            {
                $match: {
                    shop: castedShopId,
                    orderStatus: {
                    $elemMatch: {
                        status: targetOrderStatus,
                        time: {
                            $gte: startTimeToCheck,
                            $lte: endTimeToCheck
                        },
                        complete: {$ne: null}
                    }
                  }
                }
            },
            {
                $addFields: {
                    confirmedStatus: {
                        $arrayElemAt: ["$orderStatus", {
                        $indexOfArray: ["$orderStatus.status", targetOrderStatus]
                    }]
                  }
                }
            },
            {
                $project: {
                    orderStatus: 0
                }
            },
            {
                $sort: {
                    "confirmedStatus.time": sortState
                }
            },
        ]

        const rawOrders =  await Order.aggregate(pipeline)

        if(rawOrders == null)
        {
            return null
        }

        let totalRevenue = 0
        let totalProfit = 0
        const statisticsData = []

        rawOrders.forEach((order) =>
        {
            const data = JSON.parse(JSON.stringify(order))

            totalRevenue += order.totalPrice
            totalProfit += order.profit
            
            statisticsData.push(data)
        })

        const avgRevenue = statisticsData.length == 0 ? 0 : totalRevenue / statisticsData.length
        const avgProfit = statisticsData.length == 0 ? 0: totalProfit / statisticsData.length

        const finalResult = 
        {
            totalRevenue: totalRevenue,
            totalProfit: totalProfit,
            avgRevenue: avgRevenue,
            avgProfit: avgProfit,
            totalOrders: statisticsData.length,
            statisticsData: statisticsData
        }

        return finalResult
    },

    async getOrderByShopWithLatestStatus(shopId, targetOrderStatus, startTime = undefined, endTime = undefined, isAscending = false)
    {
        let endTimeToCheck = new Date()
        let startTimeToCheck = new Date(2000, 0, 1)

        if(startTime != undefined)
        {
            startTimeToCheck = new Date(startTime)
        }
        if(endTime != undefined)
        {
            endTimeToCheck = new Date(endTime)
        }

        let sortState = -1
        if(isAscending == true)
        {
            sortState = 1
        }
        
        const castedShopId = mongoose.Types.ObjectId.createFromHexString(shopId)

        const orderAggregatepipeline = [
            {
                $match: {
                    shop: castedShopId
                }
            },
            {
                $addFields: {
                    confirmedStatus: {
                    $arrayElemAt: ["$orderStatus", -1]
                    }
                }
            },
            {
                $match: {
                    "confirmedStatus.status": targetOrderStatus,
                    "confirmedStatus.time": {
                        $gte: startTimeToCheck,
                        $lte: endTimeToCheck
                    }
                }
            },
            {
                $sort: {
                    "confirmedStatus.time": sortState
                }
            },
        ]
        const rawOrders =  await Order.aggregate(orderAggregatepipeline)

        if(rawOrders == null)
        {
            return null
        }

        let totalRevenue = 0
        let totalProfit = 0
        const statisticsData = []

        rawOrders.forEach((order) =>
        {
            const data = JSON.parse(JSON.stringify(order))
            totalRevenue += order.totalPrice
            totalProfit += order.profit

            statisticsData.push(data)
        })

        const avgRevenue = statisticsData.length == 0 ? 0 : totalRevenue / statisticsData.length
        const avgProfit = statisticsData.length == 0 ? 0: totalProfit / statisticsData.length

        const finalResult = 
        {
            totalRevenue: totalRevenue,
            totalProfit: totalProfit,
            avgRevenue: avgRevenue,
            avgProfit: avgProfit,
            totalOrders: statisticsData.length,
            statisticsData: statisticsData
        }

        return finalResult
    },

    async getLateOrderByShopWithStatus(shopId, targetOrderStatus, startTime = undefined, endTime = undefined, isAscending = false)
    {
        const currentTime = new Date().getTime()

        if(targetOrderStatus == OrderStatus.SHIPPING)
        {
            return null
        }

        let endTimeToCheck = new Date()
        let startTimeToCheck = new Date(2000, 0, 1)

        if(startTime != undefined)
        {
            startTimeToCheck = new Date(startTime)
        }
        if(endTime != undefined)
        {
            endTimeToCheck = new Date(endTime)
        }

        let sortState = -1
        if(isAscending == true)
        {
            sortState = 1
        }

        const castedShopId = mongoose.Types.ObjectId.createFromHexString(shopId)

        const pipeline = [
            {
                $match: {
                    shop: castedShopId,
                    orderStatus: {
                    $elemMatch: {
                        status: targetOrderStatus,
                        time: {
                            $gte: startTimeToCheck,
                            $lte: endTimeToCheck
                        }
                    }
                  }
                }
            },
            {
                $addFields: {
                    confirmedStatus: {
                        $arrayElemAt: ["$orderStatus", {
                        $indexOfArray: ["$orderStatus.status", targetOrderStatus]
                    }]
                  }
                }
            },
            {
                $project: {
                    orderStatus: 0
                }
            },
            {
                $sort: {
                    "confirmedStatus.time": sortState
                }
            },
        ]

        const rawOrders =  await Order.aggregate(pipeline)

        if(rawOrders == null)
        {
            return null
        }

        let totalRevenue = 0
        let totalProfit = 0
        const statisticsData = []

        rawOrders.forEach((order) =>
        {
            let isValidOrder = false
            //as an initialized order has the number of status
            const checkingOrderStatus = order.confirmedStatus
            // const timeOfConfirm = checkingOrderStatus.time.getTime()
            const deadlineToCheck = checkingOrderStatus.deadline.getTime()
            const completedTimeToCheck = checkingOrderStatus.complete != null ? checkingOrderStatus.complete.getTime() : null
            // if(checkingOrderStatus.status == targetOrderStatus &&
            //     (timeOfConfirm >= startTimeToCheck && timeOfConfirm <= endTimeToCheck) &&
            //     ((completedTimeToCheck != null && completedTimeToCheck > deadlineToCheck) ||
            //     (completedTimeToCheck == null && currentTime > deadlineToCheck))
            // )
            if(((completedTimeToCheck != null && completedTimeToCheck > deadlineToCheck) || (completedTimeToCheck == null && currentTime > deadlineToCheck)))
            {
                isValidOrder = true
            }

            if(isValidOrder == true)
            {
                const data = JSON.parse(JSON.stringify(order))

                totalRevenue += order.totalPrice
                totalProfit += order.profit

                statisticsData.push(data)
            }
        })


        const avgRevenue = statisticsData.length == 0 ? 0 : totalRevenue / statisticsData.length
        const avgProfit = statisticsData.length == 0 ? 0: totalProfit / statisticsData.length

        const finalResult = 
        {
            totalRevenue: totalRevenue,
            totalProfit: totalProfit,
            avgRevenue: avgRevenue,
            avgProfit: avgProfit,
            totalOrders: statisticsData.length,
            statisticsData: statisticsData
        }

        return finalResult
    },

    async getOnTimeOrderByShopWithStatus(shopId, targetOrderStatus, startTime = undefined, endTime = undefined, isAscending = false)
    {
        const currentTime = new Date().getTime()

        if(targetOrderStatus == OrderStatus.SHIPPING)
        {
            return null
        }

        let endTimeToCheck = new Date()
        let startTimeToCheck = new Date(2000, 0, 1)

        if(startTime != undefined)
        {
            startTimeToCheck = new Date(startTime)
        }
        if(endTime != undefined)
        {
            endTimeToCheck = new Date(endTime)
        }

        let sortState = -1
        if(isAscending == true)
        {
            sortState = 1
        }

        const castedShopId = mongoose.Types.ObjectId.createFromHexString(shopId)

        const pipeline = [
            {
                $match: {
                    shop: castedShopId,
                    orderStatus: {
                    $elemMatch: {
                        status: targetOrderStatus,
                        time: {
                            $gte: startTimeToCheck,
                            $lte: endTimeToCheck
                        }
                    }
                  }
                }
            },
            {
                $addFields: {
                    confirmedStatus: {
                        $arrayElemAt: ["$orderStatus", {
                        $indexOfArray: ["$orderStatus.status", targetOrderStatus]
                    }]
                  }
                }
            },
            {
                $project: {
                    orderStatus: 0
                }
            },
            {
                $sort: {
                    "confirmedStatus.time": sortState
                }
            },
        ]

        const rawOrders =  await Order.aggregate(pipeline)

        if(rawOrders == null)
        {
            return null
        }

        let totalRevenue = 0
        let totalProfit = 0
        const statisticsData = []

        rawOrders.forEach((order) =>
        {
            let isValidOrder = false
            //as an initialized order has the number of status
            const checkingOrderStatus = order.confirmedStatus
            // const timeOfConfirm = checkingOrderStatus.time.getTime()
            const deadlineToCheck = checkingOrderStatus.deadline.getTime()
            const completedTimeToCheck = checkingOrderStatus.complete != null ? checkingOrderStatus.complete.getTime() : null

            if(((completedTimeToCheck != null && completedTimeToCheck <= deadlineToCheck) ||
                (completedTimeToCheck == null && currentTime <= deadlineToCheck)))
            {
                isValidOrder = true
            }

            if(isValidOrder == true)
            {
                const data = JSON.parse(JSON.stringify(order))

                totalRevenue += order.totalPrice
                totalProfit += order.profit

                statisticsData.push(data)
            }
        })


        const avgRevenue = statisticsData.length == 0 ? 0 : totalRevenue / statisticsData.length
        const avgProfit = statisticsData.length == 0 ? 0: totalProfit / statisticsData.length

        const finalResult = 
        {
            totalRevenue: totalRevenue,
            totalProfit: totalProfit,
            avgRevenue: avgRevenue,
            avgProfit: avgProfit,
            totalOrders: statisticsData.length,
            statisticsData: statisticsData
        }

        return finalResult
    },

    async getOrdersWithOnWaitingForStatus(shopId, targetOrderStatus, startTime = undefined, endTime = undefined, isAscending = false)
    {
        let endTimeToCheck = new Date()
        let startTimeToCheck = new Date(2000, 0, 1)

        if(endTime != undefined)
        {
            endTimeToCheck = new Date(endTime)
        }
        if(startTime != undefined)
        {
            startTimeToCheck = new Date(startTime)
        }

        let sortState = -1
        if(isAscending == true)
        {
            sortState = 1
        }

        const castedShopId = mongoose.Types.ObjectId.createFromHexString(shopId)

        const pipeline = [
            {
                $match: {
                    shop: castedShopId,
                    orderStatus: {
                        $elemMatch: {
                                status: targetOrderStatus,
                                time: {
                                    $gte: startTimeToCheck,
                                    $lte: endTimeToCheck
                                },
                                complete: {$eq: null}
                            }   
                    }
                }
            },
            {
                $addFields: {
                    confirmedStatus: {
                        $arrayElemAt: ["$orderStatus", {
                        $indexOfArray: ["$orderStatus.status", targetOrderStatus]
                    }]
                  }
                }
            },
            {
                $project: {
                    orderStatus: 0
                }
            },
            {
                $sort: {
                    "confirmedStatus.time": sortState
                }
            },
        ]

        const rawOrders = await Order.aggregate(pipeline)
        if(rawOrders == null)
        {
            return null
        }

        let totalRevenue = 0
        let totalProfit = 0
        const statisticsData = []

        rawOrders.forEach((order) =>
        {
            const data = JSON.parse(JSON.stringify(order))

            totalRevenue += order.totalPrice
            totalProfit += order.profit

            statisticsData.push(data)
        })

        const avgRevenue = statisticsData.length == 0 ? 0 : totalRevenue / statisticsData.length
        const avgProfit = statisticsData.length == 0 ? 0: totalProfit / statisticsData.length

        const finalResult = 
        {
            totalRevenue: totalRevenue,
            totalProfit: totalProfit,
            avgRevenue: avgRevenue,
            avgProfit: avgProfit,
            totalOrders: statisticsData.length,
            statisticsData: statisticsData
        }

        return finalResult
    },

    async getTotalReceivedOrders(shopId, startTime = undefined, endTime = undefined, step = undefined)
    {
        const targetOrderStatus = OrderStatus.PENDING
        const orderStatistics = await this.getOrderByShopWithStatus(shopId, targetOrderStatus, startTime, endTime, true)
        if(orderStatistics == null)
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



        let targetIntervals = [[startTimeToCheck, endTimeToCheck]]
        
        if(step != undefined)
        {
            targetIntervals = SupportDateService.getClosedIntervals(startTimeToCheck, endTimeToCheck, step)
        }

        const getStatisticForEachInterval = () =>
        {
            const mapOfIntervals = new Map()
            targetIntervals.forEach((interval, index) =>
            {
                const initValue = {
                    interval: interval,
                    revenue: 0,
                    profit: 0,
                    orders: 0,
                    statisticsData: []
                }

                mapOfIntervals.set(index, initValue)
            })

            let boundaryToChange = targetIntervals[0][1]
            let indexOfInterval = 0
            let indexOfOrder = 0

            for(; indexOfOrder < orderStatistics.statisticsData.length && indexOfInterval < targetIntervals.length; )
            {
                const targetOrderRecord = orderStatistics.statisticsData[indexOfOrder]
                const timeToCheck = new Date(targetOrderRecord.confirmedStatus.time)
                
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
                    currentStatistics.revenue += targetOrderRecord.totalPrice
                    currentStatistics.profit += targetOrderRecord.profit
                    currentStatistics.orders += 1
                    currentStatistics.statisticsData.push(targetOrderRecord)
                    mapOfIntervals.set(indexOfInterval, currentStatistics)

                    indexOfOrder += 1
                }
            }

            const result = []

            targetIntervals.forEach((interval, index) =>
            {
                const statistic = mapOfIntervals.get(index)

                result.push(statistic)
            })

            return result
        }

        const statisticsDataForEachInterval = getStatisticForEachInterval()

        const finalResult = {
            totalRevenue: orderStatistics.totalRevenue,
            totalProfit: orderStatistics.totalProfit,
            avgRevenue: orderStatistics.avgRevenue,
            avgProfit: orderStatistics.avgProfit,
            totalOrders: orderStatistics.totalOrders,
            statisticsData: statisticsDataForEachInterval
        }

        return finalResult
    },

    async getLatePendingAndProcessingOrdersBySeller(shopId, startTime, endTime, isAscending = false)
    {
        const latePendingOrdersStatistics = await this.getLateOrderByShopWithStatus(shopId, OrderStatus.PENDING, startTime, endTime, isAscending)
        if(latePendingOrdersStatistics == null)
        {
            return null
        }

        const lateProcessingOrdersStatistics = await this.getLateOrderByShopWithStatus(shopId, OrderStatus.PROCESSING, startTime, endTime, isAscending)
        if(lateProcessingOrdersStatistics == null)
        {
            return null
        }

        const totalRevenue = latePendingOrdersStatistics.totalRevenue + lateProcessingOrdersStatistics.totalRevenue
        const totalProfit = latePendingOrdersStatistics.totalProfit + lateProcessingOrdersStatistics.totalProfit
        const totalOrders = latePendingOrdersStatistics.totalOrders + lateProcessingOrdersStatistics.totalOrders
        const avgRevenue = latePendingOrdersStatistics.avgRevenue + lateProcessingOrdersStatistics.avgRevenue
        const avgProfit = latePendingOrdersStatistics.avgProfit + lateProcessingOrdersStatistics.avgProfit

        const statisticsData = latePendingOrdersStatistics.statisticsData.concat(lateProcessingOrdersStatistics.statisticsData)

        const finalResult = 
        {
            totalRevenue: totalRevenue,
            totalProfit: totalProfit,
            totalOrders: totalOrders,
            avgRevenue: avgRevenue,
            avgProfit: avgProfit,
            statisticsData: statisticsData
        }

        return finalResult
    },

    async getOnTimePendingAndProcessingOrdersBySeller(shopId, startTime, endTime, isAscending = false)
    {
        const onTimePendingOrdersStatistics = await this.getOnTimeOrderByShopWithStatus(shopId, OrderStatus.PENDING, startTime, endTime, isAscending)
        if(onTimePendingOrdersStatistics == null)
        {
            return null
        }

        const onTimeProcessingOrdersStatistics = await this.getOnTimeOrderByShopWithStatus(shopId, OrderStatus.PROCESSING, startTime, endTime, isAscending)
        if(onTimeProcessingOrdersStatistics == null)
        {
            return null
        }

        const mapOfOnTimeOrders = new Map()

        onTimePendingOrdersStatistics.statisticsData.forEach((orderRecord, index) =>
        {
            mapOfOnTimeOrders.set(orderRecord._id, index)
        })

        let totalRevenue = 0
        let totalProfit = 0
        let totalOrders = 0
        let avgRevenue = 0
        let avgProfit = 0

        const statisticsData = []

        onTimeProcessingOrdersStatistics.statisticsData.forEach((orderRecord) =>
        {
            const orderRecordId = orderRecord._id

            if(mapOfOnTimeOrders.get(orderRecordId) != undefined)
            {
                totalRevenue += orderRecord.totalPrice
                totalProfit += orderRecord.profit
    
                statisticsData.push(orderRecord)
            }
        })

        totalOrders = statisticsData.length

        if(totalOrders > 0)
        {
            avgRevenue = totalRevenue / totalOrders
            avgProfit = totalProfit / totalOrders
        }

        const finalResult = 
        {
            totalRevenue: totalRevenue,
            totalProfit: totalProfit,
            totalOrders: totalOrders,
            avgRevenue: avgRevenue,
            avgProfit: avgProfit,
            statisticsData: statisticsData
        }

        return finalResult
    },

    async getOnWaitingPendingAndProcessingOrdersBySeller(shopId, startTime, endTime, isAscending = false)
    {
        const onWaitingPendingOrdersStatistics = await this.getOrdersWithOnWaitingForStatus(shopId, OrderStatus.PENDING, startTime, endTime, isAscending)
        if(onWaitingPendingOrdersStatistics == null)
        {
            return null
        }

        const onWaitingProcessingOrdersStatistics = await this.getOrdersWithOnWaitingForStatus(shopId, OrderStatus.PROCESSING, startTime, endTime, isAscending)
        if(onWaitingProcessingOrdersStatistics == null)
        {
            return null
        }

        const totalRevenue = onWaitingPendingOrdersStatistics.totalRevenue + onWaitingProcessingOrdersStatistics.totalRevenue
        const totalProfit = onWaitingPendingOrdersStatistics.totalProfit + onWaitingProcessingOrdersStatistics.totalProfit
        const totalOrders = onWaitingPendingOrdersStatistics.totalOrders + onWaitingProcessingOrdersStatistics.totalOrders
        const avgRevenue = onWaitingPendingOrdersStatistics.avgRevenue + onWaitingProcessingOrdersStatistics.avgRevenue
        const avgProfit = onWaitingPendingOrdersStatistics.avgProfit + onWaitingProcessingOrdersStatistics.avgProfit

        const statisticsData = onWaitingPendingOrdersStatistics.statisticsData.concat(onWaitingProcessingOrdersStatistics.statisticsData)

        const finalResult = 
        {
            totalRevenue: totalRevenue,
            totalProfit: totalProfit,
            totalOrders: totalOrders,
            avgRevenue: avgRevenue,
            avgProfit: avgProfit,
            statisticsData: statisticsData
        }

        return finalResult
    },

    async getSalesByShop(shopId, startTime = undefined, endTime = undefined)
    {
        let endTimeToCheck = new Date()
        let startTimeToCheck = new Date(2000, 0, 1)

        if(startTime != undefined)
        {
            startTimeToCheck = new Date(startTime)
        }
        if(endTime != undefined)
        {
            endTimeToCheck = new Date(endTime)
        }

        const targetOrderStatus = OrderStatus.PROCESSING

        const castedShopId = mongoose.Types.ObjectId.createFromHexString(shopId)
        const pipeline = [
            {
                $match: {
                    shop: castedShopId,
                    orderStatus: {
                        $elemMatch: {
                            status: targetOrderStatus,
                            time: {
                                $gte: startTimeToCheck,
                                $lte: endTimeToCheck
                            }
                    }
                  }
                }
            },
            {
                $addFields: {
                    confirmedStatus: {
                        $arrayElemAt: ["$orderStatus", {
                            $indexOfArray: ["$orderStatus.status", targetOrderStatus]
                    }]
                  }
                }
            },
            {
                $project: {
                    orderStatus: 0
                }
            },
            {
                $sort: {
                    "confirmedStatus.time": 1
                }
            },
        ]

        const rawOrders =  await Order.aggregate(pipeline)

        if(rawOrders == null)
        {
            return null
        }


        let totalRevenue = 0
        let totalProfit = 0
        const statisticsData = []

        rawOrders.forEach((order) =>
        {
            // let lowerBoundStatus = null
            // //as an initialized order has the number of status
            // for(let i = order.orderStatus.length - 1; i >= 0; i--)
            // {
            //     const checkingOrderStatus = order.orderStatus[i]
            //     if(checkingOrderStatus.status == OrderStatus.PROCESSING)
            //     {
            //         lowerBoundStatus = checkingOrderStatus
            //         break
            //     }
            // }

            // const upperBoundStatus = order.orderStatus[order.orderStatus.length - 1]

            // if(lowerBoundStatus != null)
            // {
            //     if((lowerBoundStatus.time > endTimeToCheck) == false && (upperBoundStatus.time < startTimeToCheck) == false)
            //     {
            //         const data = JSON.parse(JSON.stringify(order))
            //         totalRevenue += order.totalPrice
            //         totalProfit += order.profit
    
            //         statisticsData.push(data)
            //     }
            // }

            const data = JSON.parse(JSON.stringify(order))
            totalRevenue += order.totalPrice
            totalProfit += order.profit

            statisticsData.push(data)
        })

        const avgRevenue = statisticsData.length == 0 ? 0 : totalRevenue / statisticsData.length
        const avgProfit = statisticsData.length == 0 ? 0: totalProfit / statisticsData.length

        const finalResult = 
        {
            totalRevenue: totalRevenue,
            totalProfit: totalProfit,
            avgRevenue: avgRevenue,
            avgProfit: avgProfit,
            totalOrders: statisticsData.length,
            statisticsData: statisticsData
        }

        return finalResult
    },

    async getGlobalCompletedOrdersWithStatus(targetOrderStatus, startTime, endTime, isAscending = false)
    {
        let startTimeToCheck = new Date(2000, 0, 1)
        let endTimeToCheck = new Date()
        
        if(startTime != undefined && startTime != null)
        {
            startTimeToCheck = new Date(startTime)
        }
        if(endTime != undefined && endTime != null)
        {
            endTimeToCheck = new Date(endTime)
        }

        let sortState = -1
        if(isAscending == true)
        {
            sortState = 1
        }

        const pipeline = [
            {
                $match: {
                    orderStatus: {
                        $elemMatch: {
                            status: targetOrderStatus,
                            time: {
                                $gte: startTimeToCheck,
                                $lte: endTimeToCheck
                            },
                            complete: {$ne: null}
                    }
                  }
                }
            },
            {
                $addFields: {
                    confirmedStatus: {
                        $arrayElemAt: ["$orderStatus", {
                            $indexOfArray: ["$orderStatus.status", targetOrderStatus]
                        }]
                    }
                }
            },
            {
                $project: {
                    orderStatus: 0
                }
            },
            {
                $sort: {
                    "confirmedStatus.time": sortState
                }
            },
        ]

        const rawOrders = await Order.aggregate(pipeline)

        if(rawOrders == null)
        {
            return null
        }

        let totalRevenue = 0
        let totalProfit = 0
        const statisticsData = []

        rawOrders.forEach((order) =>
        {
            const data = JSON.parse(JSON.stringify(order))

            totalRevenue += order.totalPrice
            totalProfit += order.profit

            statisticsData.push(data)
        })

        const avgRevenue = statisticsData.length == 0 ? 0 : totalRevenue / statisticsData.length
        const avgProfit = statisticsData.length == 0 ? 0: totalProfit / statisticsData.length

        const finalResult = 
        {
            totalRevenue: totalRevenue,
            totalProfit: totalProfit,
            avgRevenue: avgRevenue,
            avgProfit: avgProfit,
            totalOrders: statisticsData.length,
            statisticsData: statisticsData
        }

        return finalResult
    },

    async getGlobalOrdersWithStatus(targetOrderStatus, startTime, endTime, isAscending = false)
    {
        let startTimeToCheck = new Date(2000, 0, 1)
        let endTimeToCheck = new Date()
        
        if(startTime != undefined && startTime != null)
        {
            startTimeToCheck = new Date(startTime)
        }
        if(endTime != undefined && endTime != null)
        {
            endTimeToCheck = new Date(endTime)
        }

        let sortState = -1
        if(isAscending == true)
        {
            sortState = 1
        }

        const pipeline = [
            {
                $match: {
                    orderStatus: {
                        $elemMatch: {
                            status: targetOrderStatus,
                            time: {
                                $gte: startTimeToCheck,
                                $lte: endTimeToCheck
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    confirmedStatus: {
                        $arrayElemAt: ["$orderStatus", {
                            $indexOfArray: ["$orderStatus.status", targetOrderStatus]
                        }]
                    }
                }
            },
            {
                $project: {
                    orderStatus: 0
                }
            },
            {
                $sort: {
                    "confirmedStatus.time": sortState
                }
            },
        ]

        const rawOrders = await Order.aggregate(pipeline)

        if(rawOrders == null)
        {
            return null
        }

        let totalRevenue = 0
        let totalProfit = 0
        const statisticsData = []

        rawOrders.forEach((order) =>
        {
            const data = JSON.parse(JSON.stringify(order))

            totalRevenue += order.totalPrice
            totalProfit += order.profit

            statisticsData.push(data)
        })

        const avgRevenue = statisticsData.length == 0 ? 0 : totalRevenue / statisticsData.length
        const avgProfit = statisticsData.length == 0 ? 0: totalProfit / statisticsData.length

        const finalResult = 
        {
            totalRevenue: totalRevenue,
            totalProfit: totalProfit,
            avgRevenue: avgRevenue,
            avgProfit: avgProfit,
            totalOrders: statisticsData.length,
            statisticsData: statisticsData
        }

        return finalResult
    },

}

export default StatisticsOrderService