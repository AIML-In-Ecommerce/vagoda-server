import OrderStatusGenerators from "../generators/order.status.generator.js"
import { OrderStatus } from "../shared/enums.js"


const OrderStatusByStatusCode = 
[
    {orderStatusCode: OrderStatus.WAITING_ONLINE_PAYMENT, generator: OrderStatusGenerators.generateWaitingOnlinePaymentStatus},
    {orderStatusCode: OrderStatus.PENDING, generator: OrderStatusGenerators.generatePendingStatus},
    {orderStatusCode: OrderStatus.PROCESSING, generator: OrderStatusGenerators.generateProcessingStatus},
    {orderStatusCode: OrderStatus.SHIPPING, generator: OrderStatusGenerators.generateShippingStatus},
    {orderStatusCode: OrderStatus.COMPLETED, generator: OrderStatusGenerators.generateCompletedStatus},
    {orderStatusCode: OrderStatus.CANCELLED, generator: OrderStatusGenerators.generateCancelledStatus},
]


class OrderStatusGeneratorProvider
{
    constructor()
    {
        this.generators = new Map()
    }

    initialize()
    {
        OrderStatusByStatusCode.forEach((item) =>
        {
            this.generators.set(item.orderStatusCode, item.generator)
        })
    }

    getStatus(statusCode)
    {
        const generator = this.generators.get(statusCode)
        return generator()
    }

    getStatusSequently(currentStatusCode)
    {
        const sequentStatus = Object.values(OrderStatus)
        let targetStatusCode = null
        if(currentStatusCode == OrderStatus.COMPLETED)
        {
            return targetStatusCode;
        }
        //from WAITING_ONLINE_PAYMENT to SHIPPING (i < sequentStatus.length - 2)
        //since COMPLETED is the final status you can get when applying sequent process
        for(let i = 0; i < sequentStatus.length - 2; i++)
        {
            if(currentStatusCode == sequentStatus[i])
            {
                targetStatusCode = sequentStatus[i + 1]
                break
            }
        }

        return this.getStatus(targetStatusCode)
    }


}

const orderStatusGeneratorProvider = new OrderStatusGeneratorProvider()

orderStatusGeneratorProvider.initialize()

export default orderStatusGeneratorProvider