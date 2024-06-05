import axios from "axios"


const PORT = process.env.PAYMENT_PORT
const BASE_PATH = process.env.BASE_PATH
const publicAPIURL = `${BASE_PATH}:${PORT}`

const PaymentService = 
{
    async getZaloPayURL(userId, amount, products, orderIds)
    {
        const url = publicAPIURL + "/zalopay/payment"
        const requestBody = 
        {
            products: products,
            userId: userId,
            orderIds: orderIds,
            amount: amount
        }

        try
        {
            const response = await axios.post(url, requestBody)
            
            return response.data
        }
        catch(error)
        {
            console.log("Axios error at getZaloPayURL")
            return null
        }
    },


}

export default PaymentService