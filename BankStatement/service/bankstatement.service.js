import Order from "../../Order/order.model.js"
import BankStatementModel, { generateStatementRecord } from "../model/bank_statement.model.js"
import { OrderStatus } from "../shared/enums.js"
import SupportOrderService from "../support/order/order.support.service.js"
import SupportStatisticsService from "../support/statistics/statistics.support.js"

const NULL_COLOR_CONVENTION = "NULL_COLOR"
const NULL_SIZE_CONVENTION ="NULL_SIZE"

const BankStatementService = 
{
    async generateBankStatementRecord(startTime, endTime, executeTime)
    {
        if(startTime == undefined || endTime == undefined)
        {
            return 
        }

        let executeTimeToDo = new Date()
        let startTimeToDo = new Date(startTime)
        let endTimeToDo = new Date(endTime)

        if(executeTime != undefined && executeTime != null)
        {
            executeTimeToDo = new Date(executeTime)
        }

        const targetOrderStatus = OrderStatus.COMPLETED

        const globalRawOrders = await SupportStatisticsService.getAllCompletedOrdersInAnIntervalOfTime(targetOrderStatus, startTime, endTime, undefined)
        const rawOrders = globalRawOrders.statisticsData[0].statisticsData

        const groupOfOrderIndexByShopId = new Map()

        rawOrders.forEach((orderRecord, index) =>
        {
            const shopId = orderRecord.shop

            const currentIndexList = groupOfOrderIndexByShopId.get(shopId)
            if(currentIndexList == undefined)
            {
                groupOfOrderIndexByShopId.set(shopId, [index])
            }   
            else
            {
                currentIndexList.push(index)
                groupOfOrderIndexByShopId.set(shopId, currentIndexList)
            }
        })

        const targetRecords = []

        groupOfOrderIndexByShopId.forEach((listOfIndex, shopId) =>
        {
            let revenue = 0
            let originRevenue = 0
            const orders = []
            let season = 1

            if(executeTimeToDo.getMonth() > endTimeToDo.getMonth())
            {
                season = 2
            }

            const name = `Sao kê kì ${season} Tháng ${endTimeToDo.getMonth()}-${endTimeToDo.getFullYear()}`
            const period = `${startTimeToDo.getDate()}/${startTimeToDo.getMonth() + 1}/${startTimeToDo.getFullYear()} - ${endTimeToDo.getDate()}/${endTimeToDo.getMonth() + 1}/${endTimeToDo.getFullYear()}`

            listOfIndex.forEach((index) =>
            {
                const orderRecord = rawOrders[index]
                orders.push(orderRecord._id)
                revenue += orderRecord.profit
                originRevenue += orderRecord.totalPrice
            })

            const record = generateStatementRecord(shopId, name, executeTimeToDo, startTimeToDo, endTimeToDo, period, orders, revenue, originRevenue)

            targetRecords.push(record)
        })

        await BankStatementModel.create(targetRecords)
    },

    async getAllBankStatementOfShop(shopId, index = undefined, amount = undefined, isAscending = true)
    {
        let indexToExecute = index - 1
        if(indexToExecute < 0)
        {
            indexToExecute = 0
        }

        let sortType = 1
        if(isAscending == false)
        {
            sortType = -1
        }

        let rawStatements = []
        if(index != undefined && amount != undefined)
        {
            rawStatements = await BankStatementModel.find({shopId: shopId})
                                                    .sort({statementDate: sortType})
                                                    .skip(indexToExecute).limit(amount)
        }
        else
        {
            rawStatements = await BankStatementModel.find({shopId: shopId}).sort({statementDate: sortType})
        }


        if(rawStatements == null)
        {
            return null
        }

        if(rawStatements.length == 0)
        {
            return []
        }

        return rawStatements
    },

    async getStatementDetail(statementId, index, amount)
    {
        const rawStatement = await BankStatementModel.findOne({_id: statementId})
        if(rawStatement == null)
        {
            return null
        }

        const targetOrderIds = rawStatement.orders.map((targetOrderId) =>
        {
            return targetOrderId.toString()
        })

        const orderInfos = await SupportOrderService.getOrdersByIds(targetOrderIds)
        if(orderInfos == null)
        {
            return null
        }

        let totalRow = 0
        let totalAmount = 0
        let totalRevenue = rawStatement.revenue

        const mapOfProducts = new Map()

        orderInfos.forEach((orderInfo) =>
        {
            const products = orderInfo.products
            products.forEach((productItem) => {
                
                const color = productItem.color != null ? productItem.color.color.value : NULL_COLOR_CONVENTION
                const size = productItem.size != null ? productItem.size : NULL_SIZE_CONVENTION
                const combinedKey = productItem._id + "+" + color + "+" + size

                const currentStatisticsOfProduct = mapOfProducts.get(combinedKey)
                
                if(currentStatisticsOfProduct == undefined)
                {
                    //initialize
                    const statistics = {
                        _id: productItem._id,
                        product_name: productItem.name,
                        product_avatar: productItem.images.length > 0 ? productItem.images[0] : "",
                        price: productItem.purchasedPrice,
                        system_fee: productItem.platformFee,
                        color: productItem.color,
                        size: productItem.size,
                        original_price: productItem.originalPrice,
                        original_revenue: productItem.purchasedPrice * productItem.quantity,
                        amount: productItem.quantity,
                        revenue: (productItem.purchasedPrice - productItem.platformFee) * productItem.quantity,
                    }

                    mapOfProducts.set(productItem._id, statistics)
                }
                else
                {
                    currentStatisticsOfProduct.amount += productItem.quantity
                    currentStatisticsOfProduct.original_revenue += (productItem.purchasedPrice * productItem.quantity)
                    currentStatisticsOfProduct.revenue += ((productItem.purchasedPrice - productItem.platformFee) * productItem.quantity)
                }
            })
        })

        let productStatements = []

        mapOfProducts.forEach((statistics, conbinedKey) =>
        {
            productStatements.push(statistics)
            totalAmount += statistics.amount
            totalRow += 1
        })

        if(Number.isInteger(index) && Number.isInteger(amount))
        {
            const indexToExecute = index < 1 ? 0 : index - 1

            productStatements = productStatements.slice(indexToExecute*amount, (indexToExecute + 1)*amount)
        }

        return {
            totalAmount: totalAmount,
            totalRevenue: totalRevenue,
            productStatements: productStatements
        }
    },  
}

export default BankStatementService