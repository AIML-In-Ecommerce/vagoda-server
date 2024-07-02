import redisClient from "../configs/redis.config.js"
import ProductAccess from "../models/access/productAcess.model.js"
import { Product } from "../models/product/product.model.js"
import { CachePrefix, OrderStatus, ProductAccessType } from "../shared/enums.js"
import StatisticsOrderService from "./statistics.order.service.js"
import nodeFpgrowth from 'node-fpgrowth'

const DEFAULT_MAX_TOP_PRODUCTS_IN_SALES = 10

const StatisticsProductService = 
{

    async getTopProductInSalesBySeller(shopId, amount = undefined, startTime = undefined, endTime = undefined, useProductInfo = false)
    {
        const targetOrderStatus = OrderStatus.PROCESSING
        const orderStatistics = await StatisticsOrderService.getOrderByShopWithStatus(shopId, targetOrderStatus, startTime, endTime)
        if(orderStatistics == null)
        {
            return null
        }

        const productCount = new Map()

        orderStatistics.statisticData.forEach((order) =>
        {
            order.products.forEach((product) =>
            {
                const productId = product.product.toString()
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
        // else
        // {
        //     synthesizedProductCount = synthesizedProductCount.slice(0, DEFAULT_MAX_TOP_PRODUCTS_IN_SALES)
        // }

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

        const finalResult = productIds.map((productId) =>
        {
            const productInfo = mapOfProductInfos.get(productId)
            const countValue = productCount.get(productId)

            const record = 
            {
                _id: productId,
                title: productInfo.name,
                value: countValue.value,
                count: countValue.count
            }

            if(useProductInfo == true)
            {
                record.productInfo = productInfo
            }

            return record
        })

        return finalResult
    },

    async getSoldAmountOfProductsInAnIntervalOfTime(shopId, productIds, startTime = undefined, endTime = undefined)
    {
        const targetOrderStatus = OrderStatus.PROCESSING
        const completedOrderStatistics = await StatisticsOrderService.getCompletedOrderByShopWithStatus(shopId, 
            targetOrderStatus, startTime, endTime)
        
        if(completedOrderStatistics == null)
        {
            return null
        }

        const mapOfProductsCount = new Map()
        productIds.forEach((productId) =>
        {
            mapOfProductsCount.set(productId, {
                count: 0,
                revenue: 0
            })
        })

        completedOrderStatistics.statisticData.forEach((order) =>
        {
            const products = order.products

            products.forEach((product) =>
            {
                //since the order object is now a pure object, so we donot have to use product._id.toString()
                const productId = product._id
                const currentValue = mapOfProductsCount.get(productId)
                if(currentValue != undefined)
                {
                    const newCount = currentValue.count + product.quantity
                    const newRevenue = currentValue.revenue + product.quantity*product*purchasedPrice
                    mapOfProductsCount.set(productId, {
                        cout: newCount,
                        revenue: newRevenue
                    })
                }
            })
        })

        const detailData = []
        let totalSoldProduct = 0

        mapOfProductsCount.forEach((value, key) =>
        {
            totalSoldProduct += value.count

            const record = {
                productId: key,
                count: value.count,
                revenue: value.revenue
            }

            detailData.push(record)
        })

        const finalResult = {
            totalSoldProduct: totalSoldProduct,
            detail: detailData
        }

        return finalResult
    },

    async getSoldAmountOfAllProductsInAnIntervalOfTime(shopId, startTime, endTime)
    {
        const targetOrderStatus = OrderStatus.PROCESSING
        const completedOrderStatistics = await StatisticsOrderService.getCompletedOrderByShopWithStatus(shopId, 
            targetOrderStatus, startTime, endTime)
        
        if(completedOrderStatistics == null)
        {
            return null
        }

        const mapOfProductsCount = new Map()

        completedOrderStatistics.statisticData.forEach((order) =>
        {
            const products = order.products

            products.forEach((product) =>
            {
                const productId = product._id
                const currentValue = mapOfProductsCount.get(productId)
                if(currentValue != undefined)
                {
                    const newCount = currentValue.count + product.quantity
                    const newRevenue = currentValue.revenue + product.quantity*product.purchasedPrice

                    mapOfProductsCount.set(productId, {
                        count: newCount,
                        revenue: newRevenue
                    })
                }
                else
                {
                    //have to create the initialized value
                    const count = product.quantity
                    const revenue = product.quantity*product.purchasedPrice

                    mapOfProductsCount.set(productId, {
                        count: count,
                        revenue: revenue
                    })
                }
            })
        })

        let totalSoldProduct = 0
        const detailData = []

        mapOfProductsCount.forEach((value, key) =>
        {
            totalSoldProduct += value.count

            const record = {
                productId: key,
                count: value.count,
                revenue: value.revenue
            }

            detailData.push(record)
        })

        const finalResult = 
        {
            totalSoldProduct: totalSoldProduct,
            detail: detailData
        }

        return finalResult
    },

    async getViewsAndViewersOfProducts(shopId, productIds, targetAccessType = undefined, startTime = undefined, endTime = undefined)
    {
        let startTimeToCheck = new Date(2000, 1, 1)
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
                                                            time: {$gte: startTimeToCheck, $lte: endTimeToCheck}})
        }
        
        if(rawAccessedProducts == null)
        {
            return null
        }

        const totalViews = rawAccessedProducts.length

        //initialize the storage that helps to access the counting result quickly
        const mapOfProductsStatistics = new Map()
        productIds.forEach((productId) =>
        {
            mapOfProductsStatistics.set(productId, {
                views: 0,
                viewers: 0,
                authViewers: []
            })
        })

        // "id" => [record_of_ProductAccess]
        const groupOfViews_Products = new Map()
        
        rawAccessedProducts.forEach((record) =>
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
        })


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

        const statisticData = productIds.map((productId) =>
        {
            const productStatisticsValue = mapOfProductsStatistics.get(productId)
            const result = {
                productId: productId,
                views: productStatisticsValue.views,
                viewers: productStatisticsValue.viewers,
                authViewers: productStatisticsValue.authViewers
            }

            return result
        })

        const finalResult = {
            totalViews: totalViews,
            statisticData: statisticData
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

        //record =  {
            //     productId: string,
            //     views: number,
            //     viewers: number,
            //     authViewers: string[]
            // }

        //since addToCartStatistics.statisticData[i].productId == viewsAndViewersStatistics.statisticsData[i].productId
        // 0 <= i <= length

        const finalResult = []

        for(let i = 0; i < addToCartStatistics.statisticData.length ; i++)
        {
            const addToCartRecord = addToCartStatistics.statisticData[i]
            const viewsAndViewersRecord = viewsAndViewersStatistics.statisticData[i]
            const productId = addToCartRecord.productId

            const viewerCount = viewsAndViewersRecord.viewers
            const addToCartCount = addToCartRecord.viewers
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

    async getAmountOfBuyersOfProducts(shopId, productIds, startTime, endTime)
    {
        const targetOrderStatus = OrderStatus.PROCESSING
        const statisticOrderData = await StatisticsOrderService.getCompletedOrderByShopWithStatus(shopId, targetOrderStatus, startTime, endTime)
        if(statisticOrderData == null)
        {
            return null
        }

        const mapOfProductsStatistics = new Map()
        productIds.forEach((productId) =>
        {
            mapOfProductsStatistics.set(productId, {
                productId: productId,
                sold: 0,
                revenue: 0,
                buyers: [],
                statisticData: []
            })
        })

        const groupOfViews_Products = new Map()

        statisticOrderData.statisticData.forEach((order) =>
        {
            const userId = order.user
            order.products.forEach((item) =>
            {
                const productId = item.product
                const combinedId = userId + "+" + productId
                const currentValue = groupOfViews_Products.get(combinedId)
                const record = {
                    orderId: order._id,
                    sold: item.quantity,
                    purchasedPrice: item.purchasedPrice,
                    revenue: item.quantity*item.purchasedPrice
                }

                if(currentValue == undefined)
                {
                    //initialize the first value
                    groupOfViews_Products.set(combinedId, [record])
                }
                else
                {
                    currentValue.push(record)
                    groupOfViews_Products.set(combinedId, currentValue)
                }
            })

        })

        groupOfViews_Products.forEach((value, key) =>
        {
            const splitedKey = key.split("+")
            const buyerId = splitedKey[0]
            const targetProductId = splitedKey[1]

            /**
             * record = {
                    orderId: order._id,
                    sold: item.quantity,
                    purchasedPrice: item.purchasedPrice,
                    revenue: item.quantity*item.purchasedPrice
                }
             */

            //currentValue = {
            //     productId: string,
            //     sold: number,
            //     revenue: number,
            //     buyers: string[],
            //     statisticData: record[]
            // }
            const currentValue = mapOfProductsStatistics.get(targetProductId)
            if(currentValue != undefined)
            {
                const productId = currentValue.productId
                let newSold = currentValue.sold
                let newRevenue = currentValue.revenue
                const newBuyers = currentValue.buyers
                let newStatisticData = currentValue.statisticData

                value.forEach((record) =>
                {
                    newSold += record.sold
                    newRevenue += record.revenue
                })

                newBuyers.push(buyerId)
                newStatisticData = newStatisticData.concat(value)

                const newValue = 
                {
                    productId: productId,
                    sold: newSold,
                    revenue: newRevenue,
                    buyers: newBuyers,
                    statisticData: newStatisticData
                }

                mapOfProductsStatistics.set(productId, newValue)
            }

        })

        let totalQueryOrders = statisticOrderData.totalOrders
        let totalRelevantOrders = 0
        let totalSold = 0
        let totalRevenue = 0
        let totalBuyers = 0

        const statisticData = productIds.map((productId) =>
        {
            const productStatistic = mapOfProductsStatistics.get(productId)
            totalSold += productStatistic.sold
            totalRevenue += productStatistic.revenue
            totalBuyers += productStatistic.buyers.length
            totalRelevantOrders += productStatistic.statisticData.length

            return productStatistic
        })

        const finalResult = 
        {
            totalQueryOrders: totalQueryOrders,
            totalRelevantOrders: totalRelevantOrders,
            totalSold: totalSold,
            totalRevenue: totalRevenue,
            totalBuyers: totalBuyers,
            statisticData: statisticData
        }

        return finalResult
    },

    async getTopProductsInGlobalSales(amount = undefined, startTime = undefined, endTime = undefined, useProductInfo = false)
    {
        const targetOrderStatus = OrderStatus.PROCESSING
        const orderStatistics = await StatisticsOrderService.getGlobalOrdersWithStatus(targetOrderStatus, startTime, endTime)
        if(orderStatistics == null)
        {
            return null
        }

        const productCount = new Map()

        orderStatistics.statisticData.forEach((order) =>
        {
            order.products.forEach((product) =>
            {
                const productId = product.product.toString()
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
        // else
        // {
        //     synthesizedProductCount = synthesizedProductCount.slice(0, DEFAULT_MAX_TOP_PRODUCTS_IN_SALES)
        // }

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
        const finalResult = productIds.map((productId) =>
        {
            const productInfo = mapOfProductInfos.get(productId)
            const countValue = productCount.get(productId)

            const record = 
            {
                _id: productId,
                title: productInfo.name,
                value: countValue.value,
                count: countValue.count
            }

            if(useProductInfo == true)
            {
                record.productInfo = productInfo
            }

            return record
        })

        return finalResult
    },

    async getFrequentItemsetsAnIntervalOfTime(minSupport, startTime = undefined, endTime = undefined)
    {
        const targetOrderStatus = OrderStatus.PROCESSING
        const orderStatistics = await StatisticsOrderService.getGlobalOrdersWithStatus(targetOrderStatus, startTime, endTime)
        if(orderStatistics == null)
        {
            return null
        }

        const mapOfProductsToIndex = new Map()
        const listOfItemSets = []
        const currentIndex = 0

        orderStatistics.statisticData.forEach((orderRecord) =>
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
        const frequentItemsets = await this.getFrequentItemsetsAnIntervalOfTime(0.2, startTime, endTime)
        if(frequentItemsets == null)
        {
            return null
        }

        const itemsetsIncludeProductId = frequentItemsets.filter((itemset) => 
        {
            return itemset.items.includes(productId)
        })

        console.log(itemsetsIncludeProductId)
        
        return {}
    },  

}

export default StatisticsProductService