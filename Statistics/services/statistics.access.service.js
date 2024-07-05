import { CachePrefix, ProductAccessType } from "../shared/enums.js"
import redisClient from "../configs/redis.config.js"
import { Product } from "../models/product/product.model.js"
import ProductAccess, { generateProductAccessRecordProp } from "../models/access/productAcess.model.js"
import { AccessProductCacheExpiry } from "../shared/redisExpiry.js"


const NumberOfSearchedProductTaken = 10

const StatisticsAccessService =
{
    async setAccessProductByBuyer(buyerId, productId, shopId, accessType, execTime)
    {
        const searchTime = new Date(execTime)
        const startTime = new Date(new Date(searchTime).setDate(searchTime.getDate() - 14))

        const cacheKey = `${CachePrefix.USER_SEARCH_PRODUCT_PREFIX}${buyerId}`
        const currentCacheProductList = await redisClient.get(cacheKey)

        let accessProductInfos = await this.getAccessProductInfosByBuyer(buyerId, undefined, accessType, startTime, searchTime)
        accessProductInfos = JSON.parse(JSON.stringify(accessProductInfos))

        const productInfo = JSON.parse(JSON.stringify(await Product.findById(productId)))


        if(productInfo == null)
        {
            return null
        }

        //can create a new record
        if(currentCacheProductList == null)
        {
            const newRecordProps = generateProductAccessRecordProp(productId, searchTime, accessType, shopId, buyerId, undefined)
            const newSearchedProductAccessRecord = new ProductAccess(newRecordProps)
            await newSearchedProductAccessRecord.save()

            const cacheProducts = [productInfo]

            await redisClient.set(cacheKey, JSON.stringify(cacheProducts), {EX: AccessProductCacheExpiry.EXPIRY_TIME_OF_CACHE_SEARCHED_PRODUCTS})

            return accessProductInfos
        }

        //a list of product
        const productList = JSON.parse(currentCacheProductList)
        
        //check if the product has already been existed in cache
        let isExisted = false
        for(let i = 0; i< productList.length; i++)
        {
            if(productList[i]._id == productId)
            {
                isExisted = true
                break
            }
        }


        if(isExisted == true)
        {
            return accessProductInfos
        }

        //if not -> store info to ProductAccessModel
        const newRecordProps = generateProductAccessRecordProp(productId, searchTime, accessType, shopId, buyerId, undefined)

        const newRecord = new ProductAccess(newRecordProps)
        await newRecord.save()

        productList.push(productInfo)

        await redisClient.set(cacheKey, JSON.stringify(productList), {EX: AccessProductCacheExpiry.EXPIRY_TIME_OF_CACHE_SEARCHED_PRODUCTS})

        return accessProductInfos
    },

    async getAccessProductInfosByBuyer(buyerId, amount, accessType = undefined, startTime = undefined, endTime = undefined)
    {
        const rawAccessedProducts = await this.getAccessProductRecordsByAuthUser(buyerId, startTime, endTime, amount, accessType)

        let accessProductIds = new Map()

        rawAccessedProducts.forEach((record) =>
        {
            accessProductIds.set(record.product, {})
        })

        const uniqueProductIds = Array.from(accessProductIds.keys())
        const productList = await Product.find({_id: {$in: uniqueProductIds}})

        return productList
    },

    async getAccessProductInfosWithShopId(shopId, amount = undefined, accessType = undefined, startTime = undefined, endTime = undefined)
    {

        const rawAccessedProducts = await this.getAccessProductRecordsByShopId(shopId, startTime, endTime, amount, accessType)
        let accessProductIds = new Map()
        
        rawAccessedProducts.forEach((record) =>
        {
            accessProductIds.set(record.product, {})
        })

        const uniqueProductIds = Array.from(accessProductIds.keys())
        const productList = await Product.find({_id: {$in: uniqueProductIds}})

        return productList
    },

    async setAccessProductBySessionId(sessionUserUUID, productId, shopId, accessType, execTime)
    {
        let execTimeToSave = new Date()
        if(execTime != undefined)
        {
            execTimeToSave = new Date(execTime)
        }
        const newRecordProps = generateProductAccessRecordProp(productId, execTimeToSave, accessType, shopId, undefined, sessionUserUUID)

        const newRecord = new ProductAccess(newRecordProps)
        await newRecord.save()
    },

    async getAccessProductRecordsByAuthUser(buyerId, startTime, endTime, amount = undefined, accessType = undefined)
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

        if(accessType != undefined && Object.values(ProductAccessType).includes(accessType) == false)
        {
            return null
        }

        let rawAccessedProducts = null

        if(accessType != undefined)
        {
            rawAccessedProducts = await ProductAccess.find({user: buyerId, accessType: accessType, time: {$gte: startTimeToCheck, $lte: endTimeToCheck}})
                                                    .sort({time: -1})
                                                    // .limit(amount)
        }
        else
        {
            rawAccessedProducts = await ProductAccess.find({user: buyerId, time: {$gte: startTimeToCheck, $lte: endTimeToCheck}})
                                                    .sort({time: -1})
                                                    // .limit(amount)
        }

        if(rawAccessedProducts == null)
        {
            return null
        }

        if(amount != undefined)
        {
            rawAccessedProducts = rawAccessedProducts.slice(0, amount)
        }

        return JSON.parse(JSON.stringify(rawAccessedProducts))
    },

    async getAccessProductRecordsByShopId(shopId, startTime, endTime, amount = undefined, accessType = undefined)
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
        if(accessType != undefined && Object.values(ProductAccessType).includes(accessType) == false)
        {
            return null
        }

        if(accessType != undefined)
        {
            rawAccessedProducts = await ProductAccess.find({shop: shopId, accessType: accessType, time: {$gte: startTimeToCheck, $lte: endTimeToCheck}})
                                                        .sort({time: -1})
                                                        // .limit(amount)
        }
        else
        {
            rawAccessedProducts = await ProductAccess.find({shop: shopId, time: {$gte: startTimeToCheck, $lte: endTimeToCheck}})
                                                        .sort({time: -1})
                                                        // .limit(amount)
        }

        if(rawAccessedProducts == null)
        {
            return null
        }

        if(amount != undefined)
        {
            rawAccessedProducts = rawAccessedProducts.slice(0, amount)
        }

        return JSON.parse(JSON.stringify(rawAccessedProducts))
    }

}

export default StatisticsAccessService