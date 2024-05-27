import { PaymentMethod } from "../shared/enums.js"


const PayemntInfoGenerator = 
{
    generateCODPaymentInfo()
    {
        const paymentInfo = 
        {
            kind: PaymentMethod.COD,
            name: PaymentMethod.COD,
        }

        return paymentInfo
    },

    generateZaloPayPaymentInfo()
    {
        const paymentInfo = {
            kind: PaymentMethod.ZALOPAY,
            name: PaymentMethod.ZALOPAY,
            zpTransId: undefined,
            zpUserId: undefined,
            appTransId: undefined,
            isPaid: undefined,
            paidAt: undefined
        }

        return paymentInfo
    },

    ///update
    
    generateCOD_UpdatePaymentInfo(data)
    {
        const paymentInfo = 
        {
            kind: PaymentMethod.COD,
            name: PaymentMethod.COD,
            isPaid: data.isPaid,
            paidAt: new Date(data.paidAt)
        }

        return paymentInfo
    },

    generateZaloPay_UpdatePaymentInfo(data)
    {
        const paymentInfo = {
            kind: PaymentMethod.ZALOPAY,
            name: PaymentMethod.ZALOPAY,
            zpTransId: data.zpTransId,
            zpUserId: data.zpUserId,
            appTransId: data.appTransId,
            isPaid: data.isPaid,
            paidAt: new Date(data.paidAt)
        }

        return paymentInfo
    }

}

export default PayemntInfoGenerator