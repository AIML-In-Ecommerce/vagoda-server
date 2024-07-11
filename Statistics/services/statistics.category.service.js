
import { Product } from "../models/product/product.model.js"
import SubCategory from "../models/product/subCategory.model.js"
import { OrderStatus } from "../shared/enums.js"
import StatisticsOrderService from "./statistics.order.service.js"
import StatisticsProductService from "./statistics.product.service.js"

const StatisticsCategoryService = 
{

    async getTopInSalesSubCategoriesOfShop(shopId, startTime, endTime)
    {
        const targetOrderStatus = OrderStatus.PROCESSING
        const rawOrders = await StatisticsOrderService.getCompletedOrderByShopWithStatus(shopId, targetOrderStatus, startTime, endTime)
        if(rawOrders == null)
        {
            return null
        }
        
        return {}
    },

    async getTopInSalesSubCategories(amount, startTime, endTime, useCompensation = false)
    {
        //re-calculate top sales of sub-category 
        const topProductsInGlobalSalesStatistics = await StatisticsProductService.getTopProductsInGlobalSales(undefined, startTime, endTime, false, useCompensation, false)
        if(topProductsInGlobalSalesStatistics == null)
        {
            return null
        }

        //since topProductInGlobalSalesStatistics is an descending array, we donot have to sort it

        const mapOfProductSales = new Map()
        topProductsInGlobalSalesStatistics.forEach((recordOfProduct, index) =>
        {
            mapOfProductSales.set(recordOfProduct._id, index)
        })

        const targetProductIds = Array.from(mapOfProductSales.keys())

        const rawProducts = await Product.find({_id: {$in: targetProductIds}})
        if(rawProducts == null)
        {
            return null
        }

        const mapOfSubCategoryCount = new Map()

        rawProducts.forEach((product) =>
        {
            const productId = product._id.toString()
            const subCategory = JSON.parse(JSON.stringify(product.subCategory))

            const currentValueOfSubCategoryCount = mapOfSubCategoryCount.get(subCategory._id)
            if(currentValueOfSubCategoryCount != undefined)
            {
                currentValueOfSubCategoryCount.productIds.push(productId)
                mapOfSubCategoryCount.set(subCategory._id, currentValueOfSubCategoryCount)
            }
            else
            {
                //initialize the first value
                const initRecord = 
                {
                    subCategory: subCategory,
                    productIds: [productId],
                    sold: 0,
                    revenue: 0
                }

                mapOfSubCategoryCount.set(subCategory._id, initRecord)
            }
        })

        mapOfSubCategoryCount.forEach((value, key) =>
        {
            let totalNewSold = 0
            let totalNewRevenue = 0
            value.productIds.forEach((productId) =>
            {
                const productSalesIndex = mapOfProductSales.get(productId)
                if(productSalesIndex != undefined)
                {
                    totalNewSold += topProductsInGlobalSalesStatistics[productSalesIndex].count
                    totalNewRevenue += topProductsInGlobalSalesStatistics[productSalesIndex].value
                }
            })

            value.sold = value.sold + totalNewSold
            value.revenue = value.revenue + totalNewRevenue
        })

        let listOfSubCategories = Array.from(mapOfSubCategoryCount.values())

        listOfSubCategories.sort((a,b) => b.sold - a.sold)

        let compensationSubCategories = []

        if(useCompensation == true)
        {
            const rawSubCategories = await SubCategory.find({_id: {$nin: Array.from(mapOfSubCategoryCount.keys())}})

            rawSubCategories.forEach((record) =>
            {
                const clonedSubCategory = JSON.parse(JSON.stringify(record))

                clonedSubCategory.productIds = []
                clonedSubCategory.sold = 0
                clonedSubCategory.revenue = 0

                compensationSubCategories.push(clonedSubCategory)
            })
        }

        listOfSubCategories = listOfSubCategories.concat(compensationSubCategories)

        if(amount != undefined)
        {
            listOfSubCategories = listOfSubCategories.slice(0, amount)
        }

        return listOfSubCategories
    },



}

export default StatisticsCategoryService