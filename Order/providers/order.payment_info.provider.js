import PayemntInfoGenerator from "../generators/payment_info.generator.js"
import { PaymentMethod } from "../shared/enums.js"


const initProps = 
[
    {paymentCode: PaymentMethod.COD, generator: PayemntInfoGenerator.generateCODPaymentInfo},
    {paymentCode: PaymentMethod.ZALOPAY, generator: PayemntInfoGenerator.generateZaloPayPaymentInfo},
    
]

const updateProps = 
[
    {paymentCode: PaymentMethod.COD, generator: PayemntInfoGenerator.generateCOD_UpdatePaymentInfo},
    {paymentCode: PaymentMethod.ZALOPAY, generator: PayemntInfoGenerator.generateZaloPay_UpdatePaymentInfo},

]


class OrderPaymentInfoProvider
{
    constructor()
    {
        this.initModeGenerators = new Map()
        this.updateModeGenerators = new Map()
    }

    initialize()
    {
        initProps.forEach((item) =>
        {
            this.initModeGenerators.set(item.paymentCode, item.generator)
        })

        updateProps.forEach((item) =>
        {
            this.updateModeGenerators.set(item.paymentCode, item.generator)
        })
    }

    getInitializedPaymentInfoSchema(paymentCode)
    {
        const generator = this.initModeGenerators.get(paymentCode)
        return generator()
    }

    getUpdatedPaymentInfoSchema(paymentCode, updateData)
    {
        const generator = this.updateModeGenerators.get(paymentCode)
        return generator(updateData)
    }
}

const orderPaymentInfoProvider = new OrderPaymentInfoProvider()

orderPaymentInfoProvider.initialize()

export default orderPaymentInfoProvider