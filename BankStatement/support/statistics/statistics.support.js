import 'axios'
import axios from 'axios'


const publicAPIURL = `${process.env.BASE_PATH}:${process.env.STATISTICS_PORT}`
const originURL = `${process.env.BASE_PATH}:${process.env.BANK_STATEMENT_PORT}`

const SupportStatisticsService = 
{
    async getAllCompletedOrdersInAnIntervalOfTime(targetOrderStatus, startTime, endTime, step)
    {
        const url = `${publicAPIURL}/statistics/order/global/latest_status`
        const requestBody = {
            targetOrderStatus: targetOrderStatus,
            startTime: startTime,
            endTime: endTime,
            step: step
        }

        try
        {
            const response = await axios.post(url, requestBody, 
                {
                    headers: {
                        "origin": `${publicAPIURL}`
                    }
                }
            )

            if(response.status == 200 || response.status == 201)
            {
                const data = response.data
                return data.data
            }
            else
            {
                return null
            }
        }
        catch(error)
        {
            console.log("Axios error at getAllCompletedOrdersInAnIntervalOfTime")
            return null
        }
    },
}


export default SupportStatisticsService