import { PaymentMethod } from "../shared/enums.js"
import { generateStatusWhenCOD, generateStatusWhenWaitingZaloPay } from "../generators/status.generator.js"

const OrderStatusInitForPaymentMethods = 
[
    {paymentMethodCode: PaymentMethod.ZALOPAY, generator: generateStatusWhenWaitingZaloPay},
    {paymentMethodCode: PaymentMethod.COD, generator: generateStatusWhenCOD},

]

class OrderStatusGeneratorProvider
{
    constructor()
    {
        this.generators = new Map()
    }

    initialize()
    {
        OrderStatusInitForPaymentMethods.forEach((item) =>
        {
            this.generators.set(item.paymentMethodCode, item.generator)
        })
    }

    generateOrderStatus(paymentMethodCode)
    {
        const generator = this.generators.get(paymentMethodCode)
        return generator()
    }
}

const orderStatusGeneratorProvider = new OrderStatusGeneratorProvider()

orderStatusGeneratorProvider.initialize()

export default orderStatusGeneratorProvider