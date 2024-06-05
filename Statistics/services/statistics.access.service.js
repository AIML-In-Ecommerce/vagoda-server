import { CachePrefix, ProductAccessType } from "../shared/enums.js"
import redisClient from "../configs/redis.config.js"
import { Product } from "../models/product/product.model.js"
import ProductAccess, { generateProductAccessRecordProp } from "../models/access/productAcess.model.js"


const ExpiryTimeOfCacheSearchedProducts = 60*3 //minutes 
const NumberOfSearchedProductTaken = 10

const StatisticsAccessService =
{
    async setAccessProductByBuyer(buyerId, productId, shopId, accessType, execTime)
    {
        const searchTime = new Date(execTime)
        const cacheKey = `${CachePrefix.UserSearchedProductPrefix}${buyerId}`
        const currentCacheProductList = await redisClient.get(cacheKey)

        const productInfo = await Product.findById(productId)

        if(currentCacheProductList == null)
        {
            const newSearchedProductList = [productInfo]
            // const newSearchedProductList = [productId]
            const newRecordProps = generateProductAccessRecordProp(productId, searchTime, accessType, shopId, buyerId, undefined)
            await redisClient.set(cacheKey, JSON.stringify(newSearchedProductList), {EX: ExpiryTimeOfCacheSearchedProducts})
            const newSearchedProductAccessRecord = new ProductAccess(newRecordProps)
            await newSearchedProductAccessRecord.save()
            return newSearchedProductList
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
            return productList
        }

        //if not -> store info to ProductAccessModel
        const newRecordProps = generateProductAccessRecordProp(productId, searchTime, accessType, shopId, buyerId, undefined)

        productList.push(productInfo)
        const newRecord = new ProductAccess(newRecordProps)
        await newRecord.save()

        await redisClient.set(cacheKey, JSON.stringify(productList), {EX: ExpiryTimeOfCacheSearchedProducts})

        return productList
    },

    async getAccessProductsByBuyer(buyerId, amount, accessType = undefined, startTime = undefined, endTime = undefined)
    {
        let startTimeToCheck = 0
        let endTimeToCheck = new Date(Date.now())

        const cacheKey = `${CachePrefix.UserSearchedProductPrefix}${buyerId}`
        const cacheValue = await redisClient.get(cacheKey)

        if(cacheValue != null)
        {
            return JSON.parse(cacheValue)
        }

        if(accessType != undefined && Object.values(ProductAccessType).includes(accessType) == false)
        {
            return null
        }

        let rawAccessedProducts = null

        if(accessType != undefined)
        {
            rawAccessedProducts = await ProductAccess.find({user: buyerId, accessType: accessType})
                                                    .sort({time: -1})
                                                    .limit(amount)
        }
        else
        {
            rawAccessedProducts = await ProductAccess.find({user: buyerId})
                                                    .sort({time: -1})
                                                    .limit(amount)
        }

        if(rawAccessedProducts == null)
        {
            return null
        }
        if(rawAccessedProducts.length == 0)
        {
            console.log("empty searched product")
            return []
        }

        if(startTime != undefined)
        {
            startTimeToCheck = new Date(startTime)
        }
        if(endTime)
        {
            endTimeToCheck = new Date(endTime)
        }

        let accessProductIds = []

        rawAccessedProducts.forEach((record) =>
        {
            const timeToCheck = record.time.getTime()
            if(timeToCheck >= startTimeToCheck && timeToCheck <= endTimeToCheck)
            {
                accessProductIds.push(record._id.toString())
            }
        })

        const productList = await Product.find({_id: {$in: accessProductIds}})
        return productList
    },

    async getAccessProductsWithShopId(shopId, amount = undefined, accessType = undefined, startTime = undefined, endTime = undefined)
    {
        let startTimeToCheck = 0
        let endTimeToCheck = new Date(Date.now())

        let rawAccessedProducts = null
        if(accessType != undefined && Object.values(ProductAccessType).includes(accessType) == false)
        {
            return null
        }

        if(accessType != undefined)
        {
            rawAccessedProducts = await ProductAccess.find({shop: shopId, accessType: accessType})
                                                        .sort({time: -1})
                                                        .limit(amount)
        }
        else
        {
            rawAccessedProducts = await ProductAccess.find({shop: shopId})
                                                        .sort({time: -1})
                                                        .limit(amount)
        }

        if(rawAccessedProducts == null)
        {
            return null
        }
        if(rawAccessedProducts.length == 0)
        {
            console.log("empty searched product")
            return []
        }

        if(startTime != undefined)
        {
            startTimeToCheck = new Date(startTime)
        }
        if(endTime)
        {
            endTimeToCheck = new Date(endTime)
        }

        let accessProductIds = []

        rawAccessedProducts.forEach((record) =>
        {
            const timeToCheck = record.time.getTime()
            if(timeToCheck >= startTimeToCheck && timeToCheck <= endTimeToCheck)
            {
                accessProductIds.push(record._id.toString())
            }
        })

        const productList = await Product.find({_id: {$in: accessProductIds}})
        return productList
    },

}

export default StatisticsAccessService