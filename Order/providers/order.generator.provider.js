import OrderGenerators from "../generators/order.generator.js"
import { PaymentMethod } from "../shared/enums.js"


const OrderGeneratorInitForPaymentMethod = 
[
    {paymentMethodCode: PaymentMethod.COD, generator: OrderGenerators.generateOrderWhenCOD},
    {paymentMethodCode: PaymentMethod.ZALOPAY, generator: OrderGenerators.generateOrderWhenZaloPay}
]


class OrderGeneratorProvider
{
    constructor()
    {
        this.generators = new Map()
    }

    initialize()
    {
        OrderGeneratorInitForPaymentMethod.forEach((item) =>
        {
            this.generators.set(item.paymentMethodCode, item.generator)
        })
    }

    getGenerator(paymentMethodId)
    {
        return this.generators.get(paymentMethodId)
    }
}

const orderGeneratorProvider = new OrderGeneratorProvider()
orderGeneratorProvider.initialize()

export default orderGeneratorProvider