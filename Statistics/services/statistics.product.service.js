import redisClient from "../configs/redis.config.js"
import ProductAccess from "../models/access/productAcess.model.js"
import { Product } from "../models/product/product.model.js"
import Review from "../models/review/review.model.js"
import { CachePrefix, OrderStatus, ProductAccessType } from "../shared/enums.js"
import SupportDateService from "../support/date.service.js"
import StatisticsAccessService from "./statistics.access.service.js"
import StatisticsOrderService from "./statistics.order.service.js"
import nodeFpgrowth from 'node-fpgrowth'

const DEFAULT_MAX_TOP_PRODUCTS_IN_SALES = 10

const StatisticsProductService = 
{

    async getTopProductInSalesBySeller(shopId, amount = undefined, startTime = undefined, endTime = undefined, useProductInfo = false, keepMissingItem = false)
    {
        const targetOrderStatus = OrderStatus.PROCESSING
        const orderStatistics = await StatisticsOrderService.getOrderByShopWithStatus(shopId, targetOrderStatus, startTime, endTime)
        if(orderStatistics == null)
        {
            return null
        }

        const productCount = new Map()

        orderStatistics.statisticsData.forEach((order) =>
        {
            order.products.forEach((product) =>
            {
                const productId = product.product
                const productPrice = product.purchasedPrice*product.quantity
                const productCountValue = productCount.get(productId)
                if(productCountValue == undefined) //need to initialize
                {
                    const initValue = {
                        count: product.quantity,
                        value: productPrice
                    }
                    productCount.set(productId, initValue)
                }
                else
                {
                    const newPrice = productCountValue.value + product.purchasedPrice*product.quantity
                    const newCount = productCountValue.count + product.quantity
                    const newValue = 
                    {
                        count: newCount,
                        value: newPrice
                    }
                    productCount.set(productId, newValue)
                }
            })

        })

        let synthesizedProductCount = []
        productCount.forEach((value, key) =>
        {
            const synthesizedValue = 
            {
                _id: key,
                count: value.count,
                value: value.value
            }
            synthesizedProductCount.push(synthesizedValue)
        })

        synthesizedProductCount.sort((a, b) => b.count - a.count)

        if(amount != undefined)
        {
            synthesizedProductCount = synthesizedProductCount.slice(0, amount)
        }

        const productIds = synthesizedProductCount.map((item) =>
        {
            return item._id
        })

        const mapOfProductInfos = new Map()
        const productInfos = await Product.find({_id: {$in: productIds}})

        productInfos.forEach((product) =>
        {
            const clonedProduct = JSON.parse(JSON.stringify(product))
            mapOfProductInfos.set(clonedProduct._id, clonedProduct)
        })

        const finalResult = []
        productIds.forEach((productId) =>
        {
            const productInfo = mapOfProductInfos.get(productId)

            let name = "Removed item"

            if(productInfo == undefined && keepMissingItem == false)
            {
                return
            }

            if(productInfo != undefined)
            {
                name = productInfo.name
            }

            const countValue = productCount.get(productId)

            const record = 
            {
                _id: productId,
                title: name,
                value: countValue.value,
                count: countValue.count
            }

            if(useProductInfo == true)
            {
                record.productInfo = productInfo ? productInfo : null
            }

            finalResult.push(record)
        })

        return finalResult
    },

    async getSoldAmountOfProductsInAnIntervalOfTime(shopId, productIds, startTime = undefined, endTime = undefined, step = undefined)
    {
        const targetOrderStatus = OrderStatus.PROCESSING
        const completedOrderStatistics = await StatisticsOrderService.getCompletedOrderByShopWithStatus(shopId, 
            targetOrderStatus, startTime, endTime, true)
        
        if(completedOrderStatistics == null)
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

        let totalSoldProducts = 0

        const getStatisticForEachInterval = () =>
        {
            const mapOfIntervals = new Map()
            targetIntervals.forEach((interval, index) =>
            {
                const initValue = {
                    interval: interval,
                    mapOfProductStatistics: new Map()
                }
                mapOfIntervals.set(index, initValue)
            })

            let indexOfOrder = 0
            let indexOfInterval = 0
            let boundaryToChange = targetIntervals[0][1]

            for(; indexOfOrder < completedOrderStatistics.statisticsData.length && indexOfInterval < targetIntervals.length;)
            {
                const targetOrderRecord = completedOrderStatistics.statisticsData[indexOfOrder]
                const timeToCheck = new Date(targetOrderRecord.confirmedStatus.time)

                if(timeToCheck > boundaryToChange)
                {
                    indexOfInterval += 1
                    boundaryToChange = targetIntervals[indexOfInterval][1]
                }
                else if(timeToCheck >= targetIntervals[indexOfInterval][0] && timeToCheck <= targetIntervals[indexOfInterval][1])
                {
                    const intervalStatistics = mapOfIntervals.get(indexOfInterval)
                    const mapOfProductStatistics = intervalStatistics.mapOfProductStatistics

                    targetOrderRecord.products.forEach((itemRecord) =>
                    {
                        const productId = itemRecord.product
                        const newQuantity = itemRecord.quantity
                        const newPurchasedPrice = itemRecord.purchasedPrice

                        totalSoldProducts += newQuantity

                        const productStatistic = mapOfProductStatistics.get(productId)
                        if(productStatistic == undefined)
                        {
                            //init
                            const initValue = {
                                product: productId,
                                count: newQuantity,
                                revenue: newPurchasedPrice*newQuantity
                            }
                            mapOfProductStatistics.set(productId, initValue)
                        }
                        else
                        {
                            productStatistic.count += newQuantity
                            productStatistic.revenue = newQuantity*newPurchasedPrice
                            mapOfProductStatistics.set(productId, productStatistic)
                        }
                    })

                    intervalStatistics.mapOfProductStatistics = mapOfProductStatistics
                    mapOfIntervals.set(indexOfInterval, intervalStatistics)

                    indexOfOrder += 1
                }
                else
                {
                    indexOfInterval += 1
                }
            }

            const result = targetIntervals.map((interval, index) =>
            {
                const intervalStatistics = mapOfIntervals.get(index)
                const listOfProductStatistics = Array.from(intervalStatistics.mapOfProductStatistics.values())
                intervalStatistics.statisticsData = listOfProductStatistics
                intervalStatistics.mapOfProductStatistics = undefined

                return intervalStatistics
            })

            return result
        }

        const statisticsData = getStatisticForEachInterval()

        const finalResult = {
            totalSoldProducts: totalSoldProducts,
            statisticsData: statisticsData
        }

        return finalResult
    },

    async getSoldAmountOfAllProductsInAnIntervalOfTime(shopId, startTime = undefined, endTime = undefined, step = undefined)
    {
        const targetOrderStatus = OrderStatus.PROCESSING
        const completedOrderStatistics = await StatisticsOrderService.getCompletedOrderByShopWithStatus(shopId, 
            targetOrderStatus, startTime, endTime)
        
        if(completedOrderStatistics == null)
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

        let totalSoldProducts = 0

        const getStatisticForEachInterval = () =>
        {
            const mapOfIntervals = new Map()
            targetIntervals.forEach((interval, index) =>
            {
                const initValue = {
                    interval: interval,
                    mapOfProductStatistics: new Map()
                }
                mapOfIntervals.set(index, initValue)
            })

            let indexOfOrder = 0
            let indexOfInterval = 0
            let boundaryToChange = targetIntervals[0][1]

            for(; indexOfOrder < completedOrderStatistics.statisticsData.length && indexOfInterval < targetIntervals.length;)
            {
                const targetOrderRecord = completedOrderStatistics.statisticsData[indexOfOrder]
                const timeToCheck = new Date(targetOrderRecord.confirmedStatus.time)

                if(timeToCheck > boundaryToChange)
                {
                    indexOfInterval += 1
                    boundaryToChange = targetIntervals[indexOfInterval][1]
                }
                else if(timeToCheck >= targetIntervals[indexOfInterval][0] && timeToCheck <= targetIntervals[indexOfInterval][1])
                {
                    const intervalStatistics = mapOfIntervals.get(indexOfInterval)
                    const mapOfProductStatistics = intervalStatistics.mapOfProductStatistics

                    targetOrderRecord.products.forEach((itemRecord) =>
                    {
                        const productId = itemRecord.product
                        const newQuantity = itemRecord.quantity
                        const newPurchasedPrice = itemRecord.purchasedPrice

                        totalSoldProducts += newQuantity

                        const productStatistic = mapOfProductStatistics.get(productId)
                        if(productStatistic == undefined)
                        {
                            //init
                            const initValue = {
                                product: productId,
                                count: newQuantity,
                                revenue: newPurchasedPrice*newQuantity
                            }
                            mapOfProductStatistics.set(productId, initValue)
                        }
                        else
                        {
                            productStatistic.count += newQuantity
                            productStatistic.revenue = newQuantity*newPurchasedPrice
                            mapOfProductStatistics.set(productId, productStatistic)
                        }
                    })

                    intervalStatistics.mapOfProductStatistics = mapOfProductStatistics
                    mapOfIntervals.set(indexOfInterval, intervalStatistics)

                    indexOfOrder += 1
                }
                else
                {
                    indexOfInterval += 1
                }
            }

            const result = targetIntervals.map((interval, index) =>
            {
                const intervalStatistics = mapOfIntervals.get(index)
                const listOfProductStatistics = Array.from(intervalStatistics.mapOfProductStatistics.values())
                intervalStatistics.statisticsData = listOfProductStatistics
                intervalStatistics.mapOfProductStatistics = undefined

                return intervalStatistics
            })

            return result
        }

        const statisticsData = getStatisticForEachInterval()

        const finalResult = {
            totalSoldProducts: totalSoldProducts,
            statisticsData: statisticsData
        }

        return finalResult
    },

    async getViewsAndViewersOfProducts(shopId, productIds, targetAccessType = undefined, startTime = undefined, endTime = undefined, step = undefined)
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

        let rawAccessedProducts = null
        
        if(targetAccessType == undefined)
        {
            rawAccessedProducts = await ProductAccess.find({shop: shopId, product: {$in: productIds},
                                                            time: {$gte: startTimeToCheck, $lte: endTimeToCheck}})
        }
        else
        {
            rawAccessedProducts = await ProductAccess.find({shop: shopId, product: {$in: productIds}, accessType: targetAccessType,
                                                            time: {$gte: startTimeToCheck, $lte: endTimeToCheck}}).sort({time: 1})
        }
        
        if(rawAccessedProducts == null)
        {
            return null
        }

        console.log("access count: ", rawAccessedProducts.length)
        const totalViews = rawAccessedProducts.length

        let targetIntervals = []

        if(step == undefined)
        {
            targetIntervals = [[startTimeToCheck, endTimeToCheck]]
        }
        else
        {
            targetIntervals = SupportDateService.getClosedIntervals(startTimeToCheck, endTimeToCheck, step)
        }

        const mapOfIntervals = new Map()
        targetIntervals.forEach((interval, index) =>
        {
            const initValue = {
                interval: interval,
                mapOfProductsStatistics: new Map(),
                groupOfViews_Products: new Map()
            }

            productIds.forEach((productId) =>
            {
                initValue.mapOfProductsStatistics.set(productId, {
                    views: 0,
                    viewers: 0,
                    authViewers: []
                })
            })

            mapOfIntervals.set(index, initValue)
        })

        let indexOfInterval = 0
        let indexOfAccess = 0
        let boundaryToChange = targetIntervals[0][1]

        for(; indexOfAccess < rawAccessedProducts.length && indexOfInterval < targetIntervals.length;)
        {
            //initialize the storage that helps to access the counting result quickly
            const intervalStatistics = mapOfIntervals.get(indexOfInterval)
            // "id" => [record_of_ProductAccess]
            const groupOfViews_Products = intervalStatistics.groupOfViews_Products

            const record = rawAccessedProducts[indexOfAccess]
            const timeToCheck = new Date(record.time)

            if(timeToCheck > boundaryToChange)
            {
                indexOfInterval += 1
                boundaryToChange = targetIntervals[indexOfInterval]
            }
            else if(timeToCheck >= targetIntervals[indexOfInterval][0] && timeToCheck <= targetIntervals[indexOfInterval][1])
            {
                const userId = record.user != null ? record.user.toString() : null
                const sessionUserId = record.sessionUser != null ? record.sessionUser.toString() : null
                const productId = record.product.toString()
    
                if(userId != null)
                {
                    const combinedId = userId + "+" + productId + "+" + "true"
                    //an array or undefined
                    const currentValue = groupOfViews_Products.get(combinedId)
    
                    if(currentValue == undefined)
                    {
                        //initialize the first value in an array of record
                        const initValue = [JSON.parse(JSON.stringify(record))]
                        groupOfViews_Products.set(combinedId, initValue)
                    }
                    else
                    {
                        const newValue = JSON.parse(JSON.stringify(record))
                        currentValue.push(newValue)
                        groupOfViews_Products.set(combinedId, currentValue)
                    }
                }
                else if(sessionUserId != null)
                {
                    const combinedId = sessionUserId + "+" + productId + "+" + "false"
                    //an array or undefined
                    const currentValue = groupOfViews_Products.get(combinedId)
    
                    if(currentValue == undefined)
                    {
                        //initialize the first value in an array of record
                        const initValue = [JSON.parse(JSON.stringify(record))]
                        groupOfViews_Products.set(combinedId, initValue)
                    }
                    else
                    {
                        const newValue = JSON.parse(JSON.stringify(record))
                        currentValue.push(newValue)
                        groupOfViews_Products.set(combinedId, currentValue)
                    }
                }

                intervalStatistics.groupOfViews_Products = groupOfViews_Products
                mapOfIntervals.set(indexOfInterval, intervalStatistics)

                indexOfAccess += 1
            }
            else
            {
                indexOfInterval += 1
            }
        }

        const statisticsData = targetIntervals.map((interval, index) =>
        {
            const intervalStatistics = mapOfIntervals.get(index)
            const groupOfViews_Products = intervalStatistics.groupOfViews_Products
            const mapOfProductsStatistics = intervalStatistics.mapOfProductsStatistics

            groupOfViews_Products.forEach((value, key) =>
            {
                const splitedKey = key.split("+")
                const viewerId = splitedKey[0]
                const productId = splitedKey[1]
                const isAuthUser = splitedKey[2] == "true"
    
                const viewsOfProduct = value.length
    
                const currentValueOfProductStatistics = mapOfProductsStatistics.get(productId)
                if(currentValueOfProductStatistics != undefined)
                {
                    const newViews = currentValueOfProductStatistics.views + viewsOfProduct
                    const newViewers = currentValueOfProductStatistics.viewers + 1
                    const currentAuthViewers = currentValueOfProductStatistics.authViewers
    
                    if(isAuthUser == true)
                    {
                        currentAuthViewers.push(viewerId)
                    }
    
                    const newValueOfProductStatistics = {
                        views: newViews,
                        viewers: newViewers,
                        authViewers: currentAuthViewers
                    }
    
                    mapOfProductsStatistics.set(productId, newValueOfProductStatistics)
                }
            })

            intervalStatistics.groupOfViews_Products = undefined
            let viewers = 0
            let views = 0

            const productStatisticsData = productIds.map((productId) =>
            {
                const productStatisticsValue = mapOfProductsStatistics.get(productId)

                viewers += productStatisticsValue.viewers
                views += productStatisticsValue.views
                const result = {
                    productId: productId,
                    views: productStatisticsValue.views,
                    viewers: productStatisticsValue.viewers,
                    authViewers: productStatisticsValue.authViewers
                }

                return result
            })

            intervalStatistics.statisticsData = productStatisticsData
            intervalStatistics.interval = interval
            intervalStatistics.mapOfProductsStatistics = undefined
            
            return intervalStatistics
        })

        const finalResult = {
            totalViews: totalViews,
            statisticsData: statisticsData
        }

        return finalResult
    },

    async getAddToCartRatio(shopId, productIds, startTime = undefined, endTime = undefined)
    {
        const viewsAndViewersStatistics = await this.getViewsAndViewersOfProducts(shopId, productIds, ProductAccessType.WATCH_DETAIL, startTime, endTime)
        if(viewsAndViewersStatistics == null)
        {
            return null
        }

        const addToCartStatistics = await this.getViewsAndViewersOfProducts(shopId, productIds, ProductAccessType.ADD_TO_CART, startTime, endTime)
        if(addToCartStatistics == null)
        {
            return null
        }

        /**
         *  {
                interval: [ 1999-12-31T17:00:00.000Z, 2024-07-17T08:47:27.475Z ],
                mapOfProductsStatistics: undefined,
                groupOfViews_Products: undefined,
                statisticsData: record[]
            }
         */
        //record =  {
            //     productId: string,
            //     views: number,
            //     viewers: number,
            //     authViewers: string[]
            // }

        //since addToCartStatistics.statisticsData[i].productId == viewsAndViewersStatistics.statisticsData[i].productId
        // 0 <= i <= length

        const finalResult = []

        for(let i = 0; i < addToCartStatistics.statisticsData.length ; i++)
        {
            const addToCartIntervalRecord = addToCartStatistics.statisticsData[i]
            const viewsAndViewersIntervalRecord = viewsAndViewersStatistics.statisticsData[i]
            const productId = addToCartIntervalRecord.statisticsData[0].productId

            const viewerCount = viewsAndViewersIntervalRecord.statisticsData[0].viewers
            const addToCartCount = addToCartIntervalRecord.statisticsData[0].viewers
            let ratio = null

            if(viewerCount != 0)
            {
                ratio = Math.round(addToCartCount / viewerCount)
            }
            
            const result = {
                productId: productId,
                viewerCount: viewerCount,
                addToCartCount: addToCartCount,
                ratio: ratio
            }

            finalResult.push(result)
        }

        return finalResult
    },

    async getAmountOfBuyersOfProducts(shopId, productIds, startTime, endTime, step = undefined)
    {
        const targetOrderStatus = OrderStatus.PROCESSING
        const statisticOrderData = await StatisticsOrderService.getCompletedOrderByShopWithStatus(shopId, targetOrderStatus, startTime, endTime, true)
        if(statisticOrderData == null)
        {
            return null
        }

        const rawAccessedProducts = await StatisticsAccessService.getAccessProductRecordsByShopId(shopId, startTime, endTime, undefined, undefined, true)

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
        if(step != undefined && step != null && statisticOrderData.statisticsData.length > 1)
        {
            targetIntervals = SupportDateService.getClosedIntervals(startTimeToCheck, endTimeToCheck, step)
        }

        const getStatisticForEachInterval = () =>
        {
            const mapOfIntervals = new Map()

            targetIntervals.forEach((interval, index) =>
            {
                const mapOfProductStatistics = new Map()
                productIds.forEach((targetProductId) =>
                {
                    const initProductStatistics = {
                        product: targetProductId,
                        sold: 0,
                        revenue: 0,
                        views: 0,
                        authViewers: [],
                        buyers: new Map(),
                        conversion: null,
                        orders: []
                    }
                    
                    mapOfProductStatistics.set(targetProductId, initProductStatistics)
                })

                const initValue = {
                    interval: interval,
                    totalProductSold: 0,
                    totalProductRevenue: 0,
                    // mapOfUsers: new Map(),
                    mapOfViewersOfProducts: new Map(),
                    mapOfProducts: mapOfProductStatistics,
                    mapOfUsersBoughtProduct: new Map()
                }

                mapOfIntervals.set(index, initValue)
            })

            let indexOfInterval = 0
            let indexOfOrder = 0
            let boundaryToChange = targetIntervals[0][1]

            for(; indexOfOrder < statisticOrderData.statisticsData.length && indexOfInterval < targetIntervals.length; )
            {
                const targetOrderRecord = statisticOrderData.statisticsData[indexOfOrder]
                const timeToCheck = new Date(targetOrderRecord.confirmedStatus.time)

                if(timeToCheck > boundaryToChange)
                {
                    indexOfInterval += 1
                    boundaryToChange = targetIntervals[indexOfInterval][1]
                }
                else if(timeToCheck >= targetIntervals[indexOfInterval][0] && timeToCheck <= targetIntervals[indexOfInterval][1])
                {
                    const userId = targetOrderRecord.user
                    const intervalStatistics = mapOfIntervals.get(indexOfInterval)
                    const mapOfUsersBoughtProduct = intervalStatistics.mapOfUsersBoughtProduct
                    // const mapOfUsers = intervalStatistics.mapOfUsers

                    targetOrderRecord.products.forEach((item) =>
                    {
                        const productId = item.product
                        const sold = item.quantity
                        const revenue = item.purchasedPrice*sold
                        const combinedKey = `${userId}+${productId}`

                        const userProductStatistics = mapOfUsersBoughtProduct.get(combinedKey)
                        if(userProductStatistics == undefined)
                        {
                            //init new value
                            const newUserProductValue = {
                                sold: sold,
                                revenue: revenue,
                                orders: [targetOrderRecord]
                            }

                            mapOfUsersBoughtProduct.set(combinedKey, newUserProductValue)
                        }
                        else
                        {
                            userProductStatistics.sold += sold
                            userProductStatistics.revenue += revenue
                            userProductStatistics.orders.push(targetOrderRecord)
                        }
                    })

                    // mapOfUsers.set(userId, {})
                    mapOfIntervals.set(indexOfInterval, intervalStatistics)

                    indexOfOrder += 1
                }
                else
                {
                    break
                }
            }

            let indexOfAccess = 0
            //reset the index of interval and the boundaryToChange value
            indexOfInterval = 0
            boundaryToChange = targetIntervals[0][1]

            for(; indexOfAccess < rawAccessedProducts.length;)
            {
                const targetAccessRecord = rawAccessedProducts[indexOfAccess]
                const timeToCheck = new Date(targetAccessRecord.time)

                if(timeToCheck > boundaryToChange)
                {
                    indexOfInterval += 1
                    boundaryToChange = targetIntervals[indexOfInterval][1]
                }
                else if(timeToCheck >= targetIntervals[indexOfInterval][0] && timeToCheck <= targetIntervals[indexOfInterval][1])
                {
                    const intervalStatistics = mapOfIntervals.get(indexOfInterval)
                    const mapOfViewersOfProducts = intervalStatistics.mapOfViewersOfProducts

                    const targetProductId = targetAccessRecord.product
                    let targetUserId = "NullUserId"
                    let isAuthUser = false
                    if(targetAccessRecord.user != null)
                    {
                        targetUserId = targetAccessRecord.user
                        isAuthUser = true
                    }
                    else
                    {
                        targetUserId = targetAccessRecord.sessionUser
                        isAuthUser = false
                    }

                    const combinedKey = `${targetUserId}+${targetProductId}`

                    const viewersOfProductsStatistics = mapOfViewersOfProducts.get(combinedKey)
                    if(viewersOfProductsStatistics == undefined)
                    {
                        const initValue = {
                            view: 1,
                            isAuthUser: isAuthUser
                        }

                        mapOfViewersOfProducts.set(combinedKey, initValue)
                    }
                    else
                    {
                        viewersOfProductsStatistics.view += 1
                    }

                    intervalStatistics.mapOfViewersOfProducts = mapOfViewersOfProducts
                    mapOfIntervals.set(indexOfInterval, intervalStatistics)

                    indexOfAccess += 1
                }
                else
                {
                    break;
                }
            }


            mapOfIntervals.forEach((intervalStatistics, intervalIndex) =>
            {
                const mapOfUsersBoughtProduct = intervalStatistics.mapOfUsersBoughtProduct
                const mapOfViewersOfProducts = intervalStatistics.mapOfViewersOfProducts
                // const mapOfUsers = intervalStatistics.mapOfUsers
                const mapOfProducts = intervalStatistics.mapOfProducts

                mapOfUsersBoughtProduct.forEach((productStatistics, combinedKey) =>
                {
                    //combinedKey = userId + productId
                    const keys = combinedKey.split("+")
                    const userId = keys[0]
                    const productId = keys[1]

                    // mapOfUsers.set(userId, {})
                    const currentProductStatistics = mapOfProducts.get(productId)
                    if(currentProductStatistics != undefined)
                    {
                        currentProductStatistics.sold += productStatistics.sold
                        currentProductStatistics.revenue += productStatistics.revenue
                        currentProductStatistics.orders = currentProductStatistics.orders.concat(productStatistics.orders)
                        currentProductStatistics.buyers.set(userId, false)

                        mapOfProducts.set(productId, currentProductStatistics)
                    }
                })

                mapOfViewersOfProducts.forEach((viewersStatistics, combinedKey) =>
                {
                    const keys = combinedKey.split("+")
                    const userId = keys[0]
                    const productId = keys[1]
                    const viewCount = viewersStatistics.view
                    const isAuthUser = viewersStatistics.isAuthUser

                    //required products
                    const currentProductStatistics = mapOfProducts.get(productId)
                    if(currentProductStatistics != undefined)
                    {
                        currentProductStatistics.views += viewCount
                        if(isAuthUser == true)
                        {
                            currentProductStatistics.authViewers.push(userId)
                        }
                    }
                })

                intervalStatistics.mapOfViewersOfProducts.clear()
                intervalStatistics.mapOfUsersBoughtProduct.clear()

                intervalStatistics.mapOfViewersOfProducts = undefined
                intervalStatistics.mapOfUsersBoughtProduct = undefined

                //let's calculate conversion of each product

                mapOfProducts.forEach((productStatistics) =>
                {
                    let conversion = null
                    
                    const viewersHaveOrders = []
                    productStatistics.authViewers.forEach((viewerId) =>
                    {
                        if(productStatistics.buyers.get(viewerId) != undefined)
                        {
                            viewersHaveOrders.push(viewerId)
                        }
                    })

                    productStatistics.buyers.clear()

                    productStatistics.buyers = viewersHaveOrders
                    if(productStatistics.authViewers.length > 0)
                    {
                        conversion = productStatistics.buyers.length / productStatistics.authViewers.length
                    }

                    productStatistics.conversion = conversion
                })

                intervalStatistics.mapOfProducts = mapOfProducts
            })

            const result = targetIntervals.map((interval, index) =>
            {
                const intervalStatistics = mapOfIntervals.get(index)

                const statisticsData = []
                intervalStatistics.mapOfProducts.forEach((productStatistics, key) =>
                {
                    intervalStatistics.totalProductSold += productStatistics.sold
                    intervalStatistics.totalProductRevenue += productStatistics.revenue
                    statisticsData.push(productStatistics)
                })

                intervalStatistics.mapOfProducts.clear()
                intervalStatistics.mapOfProducts = undefined
                intervalStatistics.statisticsData = statisticsData

                return intervalStatistics
            })

            return result
        }

        const statisticsDataForEachInterval = getStatisticForEachInterval()

        return statisticsDataForEachInterval
    },

    async getTopProductsInGlobalSales(amount = undefined, startTime = undefined, endTime = undefined, useProductInfo = false, useCompensation = false, keepMissingItem = false)
    {
        const targetOrderStatus = OrderStatus.PROCESSING
        const orderStatistics = await StatisticsOrderService.getGlobalOrdersWithStatus(targetOrderStatus, startTime, endTime)
        if(orderStatistics == null)
        {
            return null
        }

        const productCount = new Map()

        orderStatistics.statisticsData.forEach((order) =>
        {
            order.products.forEach((product) =>
            {
                const productId = product.product
                const productPrice = product.purchasedPrice*product.quantity
                const productCountValue = productCount.get(productId)
                if(productCountValue == undefined) //need to initialize
                {
                    const initValue = {
                        count: product.quantity,
                        value: productPrice
                    }
                    productCount.set(productId, initValue)
                }
                else
                {
                    const newPrice = productCountValue.value + product.purchasedPrice*product.quantity
                    const newCount = productCountValue.count + product.quantity
                    const newValue = 
                    {
                        count: newCount,
                        value: newPrice
                    }
                    productCount.set(productId, newValue)
                }
            })

        })

        let synthesizedProductCount = []
        productCount.forEach((value, key) =>
        {
            const synthesizedValue = 
            {
                _id: key,
                count: value.count,
                value: value.value
            }
            synthesizedProductCount.push(synthesizedValue)
        })

        synthesizedProductCount.sort((a, b) => b.count - a.count)

        const productIds = synthesizedProductCount.map((item) =>
        {
            return item._id
        })

        const productInfos = await Product.find({_id: {$in: productIds}})

        const mapOfProductInfos = new Map()
        productInfos.forEach((product) =>
        {
            const clonedProduct = JSON.parse(JSON.stringify(product))
            mapOfProductInfos.set(clonedProduct._id, clonedProduct)
        })

        //use productId in productIds array to ensure that we can get sorted products infos
        let finalResult = []

        productIds.forEach((productId) =>
        {
            const productInfo = mapOfProductInfos.get(productId)

            if(productInfo == undefined && keepMissingItem == false)
            {
                return
            }

            let title = productInfo ? productInfo.name : "Removed item"
            const countValue = productCount.get(productId)

            const record = 
            {
                _id: productId,
                title: title,
                value: countValue.value,
                count: countValue.count
            }

            if(useProductInfo == true)
            {
                record.productInfo = productInfo
            }

            finalResult.push(record)
        })


        let compensationProducts = []

        if(useCompensation == true)
        {
            const rawCompensationProductsInfos = await Product.find({_id: {$nin: Array.from(productCount.keys())}})

            compensationProducts = rawCompensationProductsInfos.map((record) =>
            {
                const clonedRecord = JSON.parse(JSON.stringify(record))

                const result = 
                {
                    _id: clonedRecord._id,
                    title: clonedRecord.name,
                    value: 0,
                    count: 0
                }

                if(useProductInfo == true)
                {
                    result.productInfo = clonedRecord
                }

                return result
            })
        }

        finalResult = finalResult.concat(compensationProducts)

        if(amount != undefined)
        {
            finalResult = finalResult.slice(0, amount)
        }

        return finalResult
    },

    async getFrequentItemsetsAnIntervalOfTime(minSupport, startTime = undefined, endTime = undefined)
    {
        const targetOrderStatus = OrderStatus.PENDING
        const orderStatistics = await StatisticsOrderService.getGlobalOrdersWithStatus(targetOrderStatus, startTime, endTime)
        if(orderStatistics == null)
        {
            return null
        }

        const mapOfProductsToIndex = new Map()
        const listOfItemSets = []
        const currentIndex = 0

        orderStatistics.statisticsData.forEach((orderRecord) =>
        {
            const mapOfProductsIds = new Map()
            for(let i = 0; i < orderRecord.products.length ; i++)
            {
                const productId = orderRecord.products[i].product

                if(mapOfProductsIds.get(productId) == undefined)
                {
                    mapOfProductsIds.set(productId, {})
                }

                if(mapOfProductsIds.get(productId) == undefined)
                {
                    mapOfProductsToIndex.set(productId, currentIndex)
                    currentIndex += 1
                }
            }

            listOfItemSets.push(Array.from(mapOfProductsIds.keys()))
        })

        const fpgrowth = new nodeFpgrowth.FPGrowth(minSupport)

        const frequentItemsets = await fpgrowth.exec(listOfItemSets)

        return frequentItemsets
    },

    async getFrequentItemsToSuggest(productId, startTime, endTime)
    {
        const frequentItemsets = await this.getFrequentItemsetsAnIntervalOfTime(0.0, startTime, endTime)
        if(frequentItemsets == null)
        {
            return null
        }

        let itemsetsIncludeProductId = frequentItemsets.filter((itemset) => 
        {
            return (itemset.items.includes(productId) && itemset.items.length == 2)
        })

        itemsetsIncludeProductId = itemsetsIncludeProductId.map((itemset) =>
        {
           return  itemset.items.filter((value) => value != productId)
        })

        const productIds = []
        itemsetsIncludeProductId.forEach((itemset) =>
        {
            itemset.forEach((item) => 
            {
                productIds.push(item)
            })
        })
        
        const productInfos = await Product.find({_id: {$in: productIds}})

        return productInfos
    },

    async getReviewsOfProductsInRanges(shopId, targetProductIds = undefined, ratingRanges = undefined, startTime = undefined, endTime = undefined, useProductInfo = undefined, useReviewInfo = false)
    {
        let rawProducts = null
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

        let useRanges = false

        if(targetProductIds != undefined && targetProductIds != null && targetProductIds.length > 0)
        {
            rawProducts = await Product.find({shop: shopId, _id: {$in: targetProductIds}})
        }
        else
        {
            rawProducts = await Product.find({shop: shopId})
        }

        if(ratingRanges != undefined || ratingRanges != null || Array.isArray(ratingRanges) == true)
        {
            useRanges = true
            //sort ratingRanges
            for(let i = 0; i < ratingRanges.length; i++)
            {
                ratingRanges[i].sort((a, b) => a - b)
            }
        }

        const mapOfProductInfoIndex = new Map()
        
        rawProducts.forEach((productInfo, index) =>
        {
            mapOfProductInfoIndex.set(productInfo._id.toString(), index)
        })

        const mapOfReviewIndexAccordingToRating = new Map()

        const rawReviews = await Review.find({product: {$in: Array.from(mapOfProductInfoIndex.keys())}, 
                createdAt: {
                    $gte: startTimeToCheck,
                    $lte: endTimeToCheck
                }
            })

        
        rawReviews.forEach((review, index) =>
        {
            const rating = review.rating
            const currentListOfReviewIndex = mapOfReviewIndexAccordingToRating.get(rating)
            if(currentListOfReviewIndex == undefined)
            {
                mapOfReviewIndexAccordingToRating.set(rating, [index])
            }
            else
            {
                currentListOfReviewIndex.push(index)
                mapOfReviewIndexAccordingToRating.set(rating, currentListOfReviewIndex)
            }
        })

        const availableRatings = Array.from(mapOfReviewIndexAccordingToRating.keys()).sort((a,b) => a - b)

        /**
         * targetRatingAccordingToAvalableRatings is an array that store relevant ranges of rating reviews
         * for example, [ [ 1, 2 ], [ 4, 5 ] ] means
         * the first provided ranges (input range at the index 0) of ratingRanges should count reviews whose rating are 1 and 2,
         * the second provided range (input range at the index 1) of ratingRanges should count reviews whose rating are 4 and 5
         */
        let targetRatingAccordingToAvalableRatings = null
        if(useRanges == true)
        {
            targetRatingAccordingToAvalableRatings = []
            ratingRanges.forEach((range) =>
            {
                const lowerBoundary = range[0] ? range[0] : 0
                const upperBoundary = range[1] ? range[1] : availableRatings[availableRatings.length - 1]

                let targetStartRangeIndex = 0
                let targetEndRangeIndex = availableRatings.length - 1

                for(let i=0; i < availableRatings.length; i++)
                {
                    if(availableRatings[i] >= lowerBoundary)
                    {
                        targetStartRangeIndex = i
                        break
                    }
                }

                for(let i=availableRatings.length - 1; i >= 0; i--)
                {
                    if(availableRatings[i] <= upperBoundary)
                    {
                        targetEndRangeIndex = i
                        break
                    }
                }

                const relevantRatingRanges = availableRatings.slice(targetStartRangeIndex, targetEndRangeIndex + 1)
                targetRatingAccordingToAvalableRatings.push(relevantRatingRanges)
            })
        }

        const finalResult = []

        if(useRanges)
        {
            targetRatingAccordingToAvalableRatings.forEach((relevantRatings, index) =>
            {
                const range = ratingRanges[index]
                const mapOfProductReviews = new Map()
                let totalReviews = 0
                // let targetProductInfo = null

                relevantRatings.forEach((rating) =>
                {
                    const targetReviewIndexs = mapOfReviewIndexAccordingToRating.get(rating)
                    if(targetReviewIndexs)
                    {
                        totalReviews += targetReviewIndexs.length
                        const getRecord = () =>
                        {
                            if(useReviewInfo == true)
                            {
                                targetReviewIndexs.forEach((index) =>
                                {
                                    const targetReview = JSON.parse(JSON.stringify(rawReviews[index]))
                                    const currentCount = mapOfProductReviews.get(targetReview.product)
                                    if(currentCount == undefined)
                                    {
                                        mapOfProductReviews.set(targetReview.product, {
                                            product: targetReview.product,
                                            count: 1,
                                            reviews: [targetReview]
                                        })
                                    }
                                    else
                                    {
                                        currentCount.count = currentCount.count + 1
                                        currentCount.reviews.push(targetReview)
                                        mapOfProductReviews.set(targetReview.product, currentCount)
                                    }
                                })
                            }
                            else
                            {
                                targetReviewIndexs.forEach((index) =>
                                {
                                    const targetReview = JSON.parse(JSON.stringify(rawReviews[index]))
                                    const currentCount = mapOfProductReviews.get(targetReview.product)
                                    if(currentCount == undefined)
                                    {
                                        mapOfProductReviews.set(targetReview.product, {
                                            product: targetReview.product,
                                            count: 1,
                                            reviews: [targetReview._id]
                                        })
                                    }
                                    else
                                    {
                                        currentCount.count = currentCount.count + 1
                                        currentCount.reviews.push(targetReview._id)
                                        mapOfProductReviews.set(targetReview.product, currentCount)
                                    }
                                })
                            }
                        }
                        getRecord()
                    }
                })

            const resultRecord = {
                range: range,
                totalReviews: totalReviews,
                statisticsData: Array.from(mapOfProductReviews.values())
            }

            finalResult.push(resultRecord)
            })
        }
        else
        {
            availableRatings.forEach((rating) =>
            {
                const range = [rating, rating]
                const mapOfProductReviews = new Map()
                let totalReviews = 0
                const reviewIndexs = mapOfReviewIndexAccordingToRating.get(rating)
                if(reviewIndexs != undefined)
                {
                    totalReviews = reviewIndexs.length
                    const getRecord = () =>
                    {
                        if(useReviewInfo == true)
                        {
                            reviewIndexs.forEach((reviewIndex) =>
                            {
                                const targetReview = JSON.parse(JSON.stringify(rawReviews[reviewIndex]))
                                const currentCount = mapOfProductReviews.get(targetReview.product)
                                if(currentCount == undefined)
                                {
                                    const initCount = {
                                        product: targetReview.product,
                                        count: 1,
                                        reviews: [targetReview]
                                    }
    
                                    mapOfProductReviews.set(targetReview.product, initCount)
                                }
                                else
                                {
                                    currentCount.count = currentCount.count + 1
                                    currentCount.reviews.push(targetReview)
                                    mapOfProductReviews.set(targetReview.product, currentCount)
                                }
                            })
                        }
                        else
                        {
                            reviewIndexs.forEach((reviewIndex) =>
                            {
                                const targetReview = JSON.parse(JSON.stringify(rawReviews[reviewIndex]))
                                const currentCount = mapOfProductReviews.get(targetReview.product)
                                if(currentCount == undefined)
                                {
                                    const initCount = {
                                        product: targetReview.product,
                                        count: 1,
                                        reviews: [targetReview._id]
                                    }
    
                                    mapOfProductReviews.set(targetReview.product, initCount)
                                }
                                else
                                {
                                    currentCount.count = currentCount.count + 1
                                    currentCount.reviews.push(targetReview._id)
                                    mapOfProductReviews.set(targetReview.product, currentCount)
                                }
                            })
                        }
                    }

                    getRecord()
                }

                const resultRecord = {
                    range: range,
                    totalReviews: totalReviews,
                    statisticsData: Array.from(mapOfProductReviews.values())
                }

                finalResult.push(resultRecord)
            })
        }

        return finalResult
    },

}

export default StatisticsProductService