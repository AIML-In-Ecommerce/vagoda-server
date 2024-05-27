import { PaymentMethod } from "../shared/enums.js"
import InitOrderGenerators from '../generators/init.status.generator.js'

const OrderStatusInitForPaymentMethods = 
[
    {paymentMethodCode: PaymentMethod.ZALOPAY, generator: InitOrderGenerators.generateStatusWhenWaitingZaloPay},
    {paymentMethodCode: PaymentMethod.COD, generator: InitOrderGenerators.generateStatusWhenCOD},

]

class InitOrderStatusGeneratorProvider
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

const initOrderStatusGeneratorProvider = new InitOrderStatusGeneratorProvider()

initOrderStatusGeneratorProvider.initialize()

export default initOrderStatusGeneratorProvider