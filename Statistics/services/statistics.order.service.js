import mongoose from "mongoose"
import Order from "../models/order/order.model.js"
import { OrderStatus } from "../shared/enums.js"
import SupportDateService from "../support/date.service.js"


const StatisticsOrderService = 
{
    
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
        const statisticData = []

        rawOrders.forEach((order) =>
        {
            const data = JSON.parse(JSON.stringify(order))

            totalRevenue += order.totalPrice
            totalProfit += order.profit

            statisticData.push(data)
        })

        const avgRevenue = statisticData.length == 0 ? 0 : totalRevenue / statisticData.length
        const avgProfit = statisticData.length == 0 ? 0: totalProfit / statisticData.length

        const finalResult = 
        {
            totalRevenue: totalRevenue,
            totalProfit: totalProfit,
            avgRevenue: avgRevenue,
            avgProfit: avgProfit,
            totalOrders: statisticData.length,
            statisticData: statisticData
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
        const statisticData = []

        rawOrders.forEach((order) =>
        {
            const data = JSON.parse(JSON.stringify(order))

            totalRevenue += order.totalPrice
            totalProfit += order.profit
            
            statisticData.push(data)
        })

        const avgRevenue = statisticData.length == 0 ? 0 : totalRevenue / statisticData.length
        const avgProfit = statisticData.length == 0 ? 0: totalProfit / statisticData.length

        const finalResult = 
        {
            totalRevenue: totalRevenue,
            totalProfit: totalProfit,
            avgRevenue: avgRevenue,
            avgProfit: avgProfit,
            totalOrders: statisticData.length,
            statisticData: statisticData
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
        const statisticData = []

        rawOrders.forEach((order) =>
        {
            const data = JSON.parse(JSON.stringify(order))
            totalRevenue += order.totalPrice
            totalProfit += order.profit

            statisticData.push(data)
        })

        const avgRevenue = statisticData.length == 0 ? 0 : totalRevenue / statisticData.length
        const avgProfit = statisticData.length == 0 ? 0: totalProfit / statisticData.length

        const finalResult = 
        {
            totalRevenue: totalRevenue,
            totalProfit: totalProfit,
            avgRevenue: avgRevenue,
            avgProfit: avgProfit,
            totalOrders: statisticData.length,
            statisticData: statisticData
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
        const statisticData = []

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

                statisticData.push(data)
            }
        })


        const avgRevenue = statisticData.length == 0 ? 0 : totalRevenue / statisticData.length
        const avgProfit = statisticData.length == 0 ? 0: totalProfit / statisticData.length

        const finalResult = 
        {
            totalRevenue: totalRevenue,
            totalProfit: totalProfit,
            avgRevenue: avgRevenue,
            avgProfit: avgProfit,
            totalOrders: statisticData.length,
            statisticData: statisticData
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
        const statisticData = []

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

                statisticData.push(data)
            }
        })


        const avgRevenue = statisticData.length == 0 ? 0 : totalRevenue / statisticData.length
        const avgProfit = statisticData.length == 0 ? 0: totalProfit / statisticData.length

        const finalResult = 
        {
            totalRevenue: totalRevenue,
            totalProfit: totalProfit,
            avgRevenue: avgRevenue,
            avgProfit: avgProfit,
            totalOrders: statisticData.length,
            statisticData: statisticData
        }

        return finalResult
    },

    async getOrdersWithOnWaitingForStatus(shopId, targetOrderStatus, startTime = undefined, endTime = undefined, isAscending = false)
    {
        let endTimeToCheck = new Date()
        let startTimeToCheck = new Date(2000, 0, 1)

        if(endTimeToCheck != undefined)
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
        const statisticData = []

        rawOrders.forEach((order) =>
        {
            const data = JSON.parse(JSON.stringify(order))

            totalRevenue += order.totalPrice
            totalProfit += order.profit

            statisticData.push(data)
        })

        const avgRevenue = statisticData.length == 0 ? 0 : totalRevenue / statisticData.length
        const avgProfit = statisticData.length == 0 ? 0: totalProfit / statisticData.length

        const finalResult = 
        {
            totalRevenue: totalRevenue,
            totalProfit: totalProfit,
            avgRevenue: avgRevenue,
            avgProfit: avgProfit,
            totalOrders: statisticData.length,
            statisticData: statisticData
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

        if(step == undefined || orderStatistics.statisticData.length == 0)
        {
            return orderStatistics
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

        const targetIntervals = SupportDateService.getClosedIntervals(startTimeToCheck, endTimeToCheck, step)

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
                    statisticData: []
                }

                mapOfIntervals.set(index, initValue)
            })

            let boundaryToChange = targetIntervals[0][1]
            let indexOfInterval = 0
            let indexOfOrder = 0

            for(; indexOfOrder < orderStatistics.statisticData.length && indexOfInterval < targetIntervals.length; )
            {
                const targetOrderRecord = orderStatistics.statisticData[indexOfOrder]
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
                    currentStatistics.statisticData.push(targetOrderRecord)
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
            statisticData: statisticsDataForEachInterval
        }

        return finalResult
    },

    async getLatePendingAndProcessingOrdersBySeller(shopId, startTime, endTime, isAscending = undefined)
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

        const statisticData = latePendingOrdersStatistics.statisticData.concat(lateProcessingOrdersStatistics.statisticData)

        const finalResult = 
        {
            totalRevenue: totalRevenue,
            totalProfit: totalProfit,
            totalOrders: totalOrders,
            avgRevenue: avgRevenue,
            avgProfit: avgProfit,
            statisticData: statisticData
        }

        return finalResult
    },

    async getOnTimePendingAndProcessingOrdersBySeller(shopId, startTime, endTime, isAscending = undefined)
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

        const totalRevenue = onTimePendingOrdersStatistics.totalRevenue + onTimeProcessingOrdersStatistics.totalRevenue
        const totalProfit = onTimePendingOrdersStatistics.totalProfit + onTimeProcessingOrdersStatistics.totalProfit
        const totalOrders = onTimePendingOrdersStatistics.totalOrders + onTimeProcessingOrdersStatistics.totalOrders
        const avgRevenue = onTimePendingOrdersStatistics.avgRevenue + onTimeProcessingOrdersStatistics.avgRevenue
        const avgProfit = onTimePendingOrdersStatistics.avgProfit + onTimeProcessingOrdersStatistics.avgProfit

        const statisticData = onTimePendingOrdersStatistics.statisticData.concat(onTimeProcessingOrdersStatistics.statisticData)

        const finalResult = 
        {
            totalRevenue: totalRevenue,
            totalProfit: totalProfit,
            totalOrders: totalOrders,
            avgRevenue: avgRevenue,
            avgProfit: avgProfit,
            statisticData: statisticData
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
        const statisticData = []

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
    
            //         statisticData.push(data)
            //     }
            // }

            const data = JSON.parse(JSON.stringify(order))
            totalRevenue += order.totalPrice
            totalProfit += order.profit

            statisticData.push(data)
        })

        const avgRevenue = statisticData.length == 0 ? 0 : totalRevenue / statisticData.length
        const avgProfit = statisticData.length == 0 ? 0: totalProfit / statisticData.length

        const finalResult = 
        {
            totalRevenue: totalRevenue,
            totalProfit: totalProfit,
            avgRevenue: avgRevenue,
            avgProfit: avgProfit,
            totalOrders: statisticData.length,
            statisticData: statisticData
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
        const statisticData = []

        rawOrders.forEach((order) =>
        {
            const data = JSON.parse(JSON.stringify(order))

            totalRevenue += order.totalPrice
            totalProfit += order.profit

            statisticData.push(data)
        })

        const avgRevenue = statisticData.length == 0 ? 0 : totalRevenue / statisticData.length
        const avgProfit = statisticData.length == 0 ? 0: totalProfit / statisticData.length

        const finalResult = 
        {
            totalRevenue: totalRevenue,
            totalProfit: totalProfit,
            avgRevenue: avgRevenue,
            avgProfit: avgProfit,
            totalOrders: statisticData.length,
            statisticData: statisticData
        }

        return finalResult
    },

    async getGlobalOrdersWithStatus(targetOrderStatus, startTime, endTime, isAscending = undefined)
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
        const statisticData = []

        rawOrders.forEach((order) =>
        {
            const data = JSON.parse(JSON.stringify(order))

            totalRevenue += order.totalPrice
            totalProfit += order.profit

            statisticData.push(data)
        })

        const avgRevenue = statisticData.length == 0 ? 0 : totalRevenue / statisticData.length
        const avgProfit = statisticData.length == 0 ? 0: totalProfit / statisticData.length

        const finalResult = 
        {
            totalRevenue: totalRevenue,
            totalProfit: totalProfit,
            avgRevenue: avgRevenue,
            avgProfit: avgProfit,
            totalOrders: statisticData.length,
            statisticData: statisticData
        }

        return finalResult
    },

}

export default StatisticsOrderService