import mongoose from "mongoose"
import Order from "../models/order/order.model.js"
import { OrderStatus } from "../shared/enums.js"


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
    async getOrderByShopWithStatus(shopId, targetOrderStatus, startTime = undefined, endTime = undefined)
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

        // const rawOrders =  await Order.find({shop: shopId})
        const rawOrders =  await Order.find({shop: shopId, 
            orderStatus: {
                $elemMatch: {
                    status: targetOrderStatus,
                    time: {
                        $gte: startTimeToCheck,
                        $lte: endTimeToCheck
                    }
                }
            }
        })
        
        if(rawOrders == null)
        {
            return null
        }

        let totalRevenue = 0
        let totalProfit = 0
        const statisticData = []

        rawOrders.forEach((order) =>
        {
            let confirmedOrderStatus = null
            //as an initialized order has the number of status
            for(let i = order.orderStatus.length - 1; i >= 0; i--)
            {
                const checkingOrderStatus = order.orderStatus[i]
                // const timeOfConfirm = checkingOrderStatus.time.getTime()
 
                // if(checkingOrderStatus.status == targetOrderStatus &&
                //     (timeOfConfirm >= startTimeToCheck && timeOfConfirm <= endTimeToCheck))
                // {
                //     confirmedOrderStatus = checkingOrderStatus
                //     break;
                // }
                if(checkingOrderStatus.status == targetOrderStatus)
                {
                    confirmedOrderStatus = checkingOrderStatus
                    break;
                }
            }

            if(confirmedOrderStatus != null)
            {
                const data = JSON.parse(JSON.stringify(order))
                data.orderStatus = undefined
                data.confirmedTime = confirmedOrderStatus

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
    async getCompletedOrderByShopWithStatus(shopId, targetOrderStatus, startTime = undefined, endTime = undefined)
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

        const rawOrders =  await Order.find({shop: shopId, 
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
        })

        if(rawOrders == null)
        {
            return null
        }

        let totalRevenue = 0
        let totalProfit = 0
        const statisticData = []

        rawOrders.forEach((order) =>
        {
            let confirmedOrderStatus = null
            //as an initialized order has the number of status
            for(let i = order.orderStatus.length - 1; i >= 0; i--)
            {
                const checkingOrderStatus = order.orderStatus[i]
                // const timeOfConfirm = checkingOrderStatus.time.getTime()
 
                // if(checkingOrderStatus.status == targetOrderStatus &&
                //     (timeOfConfirm >= startTimeToCheck && timeOfConfirm <= endTimeToCheck)
                //     && checkingOrderStatus.complete != null
                // )
                if(checkingOrderStatus.status == targetOrderStatus) 
                {
                    confirmedOrderStatus = checkingOrderStatus
                    break;
                }
            }

            if(confirmedOrderStatus != null)
            {
                const data = JSON.parse(JSON.stringify(order))
                data.orderStatus = undefined
                data.confirmedTime = confirmedOrderStatus

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

    async getOrderByShopWithLatestStatus(shopId, targetOrderStatus, startTime = undefined, endTime = undefined)
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

        const orderAggregatePipline = [
            {
                $match: {
                    shop: mongoose.Types.ObjectId(shopId)
                }
            },
            {
                $project: {
                    orderStatus: 1,
                    user: 1,
                    shop: 1,
                    products: 1,
                    promotion: 1,
                    paymentMethod: 1,
                    shippingFee: 1,
                    totalPrice: 1,
                    profit: 1,
                    shippingAddress: 1,
                    lastStatus: {
                    $arrayElemAt: ["$orderStatus", -1]
                    }
                }
            },
            {
                $match: {
                    "lastStatus.status": targetOrderStatus,
                    "lastStatus.time": {
                        $gte: startTimeToCheck,
                        $lte: endTimeToCheck
                    }
                }
            },
            {
                $project: {
                    lastStatus: 0
                }
            }
        ]
        const rawOrders =  await Order.aggregate(orderAggregatePipline)

        if(rawOrders == null)
        {
            return null
        }

        let totalRevenue = 0
        let totalProfit = 0
        const statisticData = []

        rawOrders.forEach((order) =>
        {
            let confirmedOrderStatus = null
            //as an initialized order has the number of status
            const latestStatus = order.orderStatus[order.orderStatus.length - 1]
            // const confirmedTime = latestStatus.time.getTime()
            // if(latestStatus.status == targetOrderStatus &&
            //     (confirmedTime >= startTimeToCheck && confirmedTime <= endTimeToCheck)
            // )
            if(latestStatus.status == targetOrderStatus)
            {
                confirmedOrderStatus = latestStatus
            }

            if(confirmedOrderStatus != null)
            {

                const data = JSON.parse(JSON.stringify(order))
                data.orderStatus = undefined
                data.confirmedTime = confirmedOrderStatus

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

    async getLateOrderByShopWithStatus(shopId, targetOrderStatus, startTime = undefined, endTime = undefined)
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

        const rawOrders =  await Order.find({shop: shopId, 
            orderStatus: {
                $elemMatch: {
                    status: targetOrderStatus,
                    time: {
                        $gte: startTimeToCheck,
                        $lte: endTimeToCheck
                    }
                }
            }
        })

        if(rawOrders == null)
        {
            return null
        }

        let totalRevenue = 0
        let totalProfit = 0
        const statisticData = []

        rawOrders.forEach((order) =>
        {
            let confirmedOrderStatus = null
            //as an initialized order has the number of status
            for(let i = order.orderStatus.length - 1; i >= 0; i--)
            {
                const checkingOrderStatus = order.orderStatus[i]
                // const timeOfConfirm = checkingOrderStatus.time.getTime()
                const deadlineToCheck = checkingOrderStatus.deadline.getTime()
                const completedTimeToCheck = checkingOrderStatus.complete != null ? checkingOrderStatus.complete.getTime() : null
                // if(checkingOrderStatus.status == targetOrderStatus &&
                //     (timeOfConfirm >= startTimeToCheck && timeOfConfirm <= endTimeToCheck) &&
                //     ((completedTimeToCheck != null && completedTimeToCheck > deadlineToCheck) ||
                //     (completedTimeToCheck == null && currentTime > deadlineToCheck))
                // )
                if(checkingOrderStatus.status == targetOrderStatus &&
                    ((completedTimeToCheck != null && completedTimeToCheck > deadlineToCheck) ||
                    (completedTimeToCheck == null && currentTime > deadlineToCheck))
                )
                {
                    confirmedOrderStatus = checkingOrderStatus
                    break;
                }
            }

            if(confirmedOrderStatus != null)
            {
                const data = JSON.parse(JSON.stringify(order))
                data.orderStatus = undefined
                data.confirmedTime = confirmedOrderStatus

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

    async getOnTimeOrderByShopWithStatus(shopId, targetOrderStatus, startTime = undefined, endTime = undefined)
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

        const rawOrders =  await Order.find({shop: shopId, 
            orderStatus: {
                $elemMatch: {
                    status: targetOrderStatus,
                    time: {
                        $gte: startTimeToCheck,
                        $lte: endTimeToCheck
                    }
                }
            }
        })

        if(rawOrders == null)
        {
            return null
        }

        let totalRevenue = 0
        let totalProfit = 0
        const statisticData = []

        rawOrders.forEach((order) =>
        {
            let confirmedOrderStatus = null
            //as an initialized order has the number of status
            for(let i = order.orderStatus.length - 1; i >= 0; i--)
            {
                const checkingOrderStatus = order.orderStatus[i]
                // const timeOfConfirm = checkingOrderStatus.time.getTime()
                const deadlineToCheck = checkingOrderStatus.deadline.getTime()
                const completedTimeToCheck = checkingOrderStatus.complete != null ? checkingOrderStatus.complete.getTime() : null
                // if(checkingOrderStatus.status == targetOrderStatus &&
                //     (timeOfConfirm >= startTimeToCheck && timeOfConfirm <= endTimeToCheck) &&
                //     ((completedTimeToCheck != null && completedTimeToCheck <= deadlineToCheck) ||
                //     (completedTimeToCheck == null && currentTime <= deadlineToCheck))
                // )
                if(checkingOrderStatus.status == targetOrderStatus &&
                    ((completedTimeToCheck != null && completedTimeToCheck <= deadlineToCheck) ||
                    (completedTimeToCheck == null && currentTime <= deadlineToCheck))
                )
                {
                    confirmedOrderStatus = checkingOrderStatus
                    break;
                }
            }

            if(confirmedOrderStatus != null)
            {
                const data = JSON.parse(JSON.stringify(order))
                data.orderStatus = undefined
                data.confirmedTime = confirmedOrderStatus

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

    async getOrdersWithOnWaitingForStatus(shopId, targetOrderStatus, startTime = undefined, endTime = undefined)
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

        const rawOrders = await Order.find({shop: shopId, 
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
        })
        if(rawOrders == null)
        {
            return null
        }

        let totalRevenue = 0
        let totalProfit = 0
        const statisticData = []

        rawOrders.forEach((order) =>
        {
            let confirmedOrderStatus = null
            //as an initialized order has the number of status
            for(let i = order.orderStatus.length - 1; i >= 0; i--)
            {
                const checkingOrderStatus = order.orderStatus[i]
                const timeOfConfirm = checkingOrderStatus.time.getTime()
                const completedTimeToCheck = checkingOrderStatus.complete != null ? checkingOrderStatus.complete.getTime() : null
                // if(checkingOrderStatus.status == targetOrderStatus &&
                //     (timeOfConfirm >= startTimeToCheck && timeOfConfirm <= endTimeToCheck) &&
                //     (completedTimeToCheck == null)
                // )
                if(checkingOrderStatus.status == targetOrderStatus)
                {
                    confirmedOrderStatus = checkingOrderStatus
                    break;
                }
            }

            if(confirmedOrderStatus != null)
            {
                const data = JSON.parse(JSON.stringify(order))
                data.orderStatus = undefined
                data.confirmedTime = confirmedOrderStatus

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

    async getTotalReceivedOrders(shopId, startTime = undefined, endTime = undefined)
    {
        const targetOrderStatus = OrderStatus.PENDING
        const orderStatistics = await this.getOrderByShopWithStatus(shopId, targetOrderStatus, startTime, endTime)
        if(orderStatistics == null)
        {
            return null
        }

        return orderStatistics
    },

    async getLatePendingAndProcessingOrdersBySeller(shopId, startTime, endTime)
    {
        const latePendingOrdersStatistics = await this.getLateOrderByShopWithStatus(shopId, OrderStatus.PENDING, startTime, endTime)
        if(latePendingOrdersStatistics == null)
        {
            return null
        }

        const lateProcessingOrdersStatistics = await this.getLateOrderByShopWithStatus(shopId, OrderStatus.PROCESSING, startTime, endTime)
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

    async getOnTimePendingAndProcessingOrdersBySeller(shopId, startTime, endTime)
    {
        const onTimePendingOrdersStatistics = await this.getOnTimeOrderByShopWithStatus(shopId, OrderStatus.PENDING, startTime, endTime)
        if(onTimePendingOrdersStatistics == null)
        {
            return null
        }

        const onTimeProcessingOrdersStatistics = await this.getOnTimeOrderByShopWithStatus(shopId, OrderStatus.PROCESSING, startTime, endTime)
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

        const rawOrders =  await Order.find({shop: shopId})

        if(rawOrders == null)
        {
            return null
        }


        let totalRevenue = 0
        let totalProfit = 0
        const statisticData = []

        rawOrders.forEach((order) =>
        {
            let lowerBoundStatus = null
            //as an initialized order has the number of status
            for(let i = order.orderStatus.length - 1; i >= 0; i--)
            {
                const checkingOrderStatus = order.orderStatus[i]
                if(checkingOrderStatus.status == OrderStatus.PROCESSING)
                {
                    lowerBoundStatus = checkingOrderStatus
                    break
                }
            }

            const upperBoundStatus = order.orderStatus[order.orderStatus.length - 1]

            if(lowerBoundStatus != null)
            {
                if((lowerBoundStatus.time > endTimeToCheck) == false && (upperBoundStatus.time < startTimeToCheck) == false)
                {
                    const data = JSON.parse(JSON.stringify(order))
                    totalRevenue += order.totalPrice
                    totalProfit += order.profit
    
                    statisticData.push(data)
                }
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

    async getGlobalCompletedOrdersWithStatus(targetOrderStatus, startTime, endTime)
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

        const rawOrders = await Order.find({
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
        })

        if(rawOrders == null)
        {
            return null
        }

        let totalRevenue = 0
        let totalProfit = 0
        const statisticData = []

        rawOrders.forEach((order) =>
        {
            let confirmedOrderStatus = null
            //as an initialized order has the number of status
            for(let i = order.orderStatus.length - 1; i >= 0; i--)
            {
                const checkingOrderStatus = order.orderStatus[i]

                if(checkingOrderStatus.status == targetOrderStatus)
                {
                    confirmedOrderStatus = checkingOrderStatus
                    break;
                }
            }

            if(confirmedOrderStatus != null)
            {
                const data = JSON.parse(JSON.stringify(order))
                data.orderStatus = undefined
                data.confirmedTime = confirmedOrderStatus

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

    async getGlobalOrdersWithStatus(targetOrderStatus, startTime, endTime)
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

        const rawOrders = await Order.find({
            orderStatus: {
                $elemMatch: {
                    status: targetOrderStatus,
                    time: {
                        $gte: startTimeToCheck,
                        $lte: endTimeToCheck
                    }
                }
            }
        })

        if(rawOrders == null)
        {
            return null
        }

        let totalRevenue = 0
        let totalProfit = 0
        const statisticData = []

        rawOrders.forEach((order) =>
        {
            let confirmedOrderStatus = null
            //as an initialized order has the number of status
            for(let i = order.orderStatus.length - 1; i >= 0; i--)
            {
                const checkingOrderStatus = order.orderStatus[i]

                if(checkingOrderStatus.status == targetOrderStatus)
                {
                    confirmedOrderStatus = checkingOrderStatus
                    break;
                }
            }

            if(confirmedOrderStatus != null)
            {
                const data = JSON.parse(JSON.stringify(order))
                data.orderStatus = undefined
                data.confirmedTime = confirmedOrderStatus

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

}

export default StatisticsOrderService