import axios from "axios"


const PORT = process.env.ORDER_PORT
const BASE_PATH = process.env.BASE_PATH
const publicAPIURL = `${BASE_PATH}:${PORT}`

const OrderService = 
{

    async updateWaitingPaymentStatus(userId, orderIds, zpTransId, paidAt, appTransId, zpUserId)
    {
        const url = publicAPIURL + "/system/order/zalopay/update_callback"
        try
        {
            const requestBody = {
                userId: userId,
                orderIds: orderIds,
                zpTransId: zpTransId,
                appTransId: appTransId,
                zpUserId: zpUserId,
                paidAt: paidAt
            }

            const response = await axios.post(url, requestBody, 
                {
                    headers:
                    {
                        "origin": `${publicAPIURL}`
                    }
                }
            )
            if(response.status != 200)
            {
                return null
            }

            const data = response.data
            return data.data
        }
        catch(error)
        {
            console.log("Axios error at updateWaitingPaymentStatus")
            return null
        }
    }


}

export default OrderService