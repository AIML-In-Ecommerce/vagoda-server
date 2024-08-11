import axios from "axios"


const targetURL = `${process.env.BASE_PATH}:${process.env.ORDER_PORT}`
const originURL = `${process.env.BASE_PATH}:${process.env.BANK_STATEMENT_PORT}`

const SupportOrderService = 
{
    async getOrdersByIds(orderIds)
    {
        const url = `${targetURL}/system/order/list_of_orders`
        const requestBody = {
            orderIds: orderIds
        }

        try
        {
            const responses = await axios.post(url, requestBody, {
                headers: {
                    "origin": `${originURL}`
                }
            })

            if(responses.status == 200 || responses.status == 201)
            {
                const data = responses.data
                return data.data
            }
        }
        catch(error)
        {
            console.log("Axios error at getOrdersByIds")
            return null
        }
    }
}


export default SupportOrderService