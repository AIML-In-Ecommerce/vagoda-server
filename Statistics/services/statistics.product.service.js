import { Product } from "../models/product/product.model.js"
import { OrderStatus } from "../shared/enums.js"
import StatisticsOrderService from "./statistics.order.service.js"

const DEFAULT_MAX_TOP_PRODUCTS_IN_SALES = 10

const StatisticsProductService = 
{

    async getTopProductInSalesBySeller(shopId, amount = undefined, startTime = undefined, endTime = undefined)
    {
        const targetOrderStatus = OrderStatus.PENDING
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

        synthesizedProductCount = synthesizedProductCount.sort((a, b) => a.count - b.count)

        if(amount != undefined)
        {
            synthesizedProductCount = synthesizedProductCount.slice(0, amount)
        }
        else
        {
            synthesizedProductCount = synthesizedProductCount.slice(0, DEFAULT_MAX_TOP_PRODUCTS_IN_SALES)
        }

        const productIds = synthesizedProductCount.map((item) =>
        {
            return item._id
        })

        const productInfos = await Product.find({_id: {$in: productIds}})

        const finalResult = productInfos.map((product) =>
        {
            const productId = product.id.toString()
            const countValue = productCount.get(productId)

            const record = 
            {
                _id: productId,
                title: product.name,
                value: countValue.value,
                count: countValue.count
            }

            return record
        })

        return finalResult
    },



}

export default StatisticsProductService