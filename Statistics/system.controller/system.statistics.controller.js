import createHttpError from "http-errors"
import StatisticsOrderService from "../services/statistics.order.service.js"


const StatisticsSystemController = 
{

    async getGlobalOrdersWithStatus(req, res, next)
    {
        try
        {
            const targetOrderStatus = req.body.targetOrderStatus
            const startTime = req.body.startTime
            const endTime = req.body.endTime
            const step = req.body.step

            const statistics = await StatisticsOrderService.getGlobalOrdersWithStatus(targetOrderStatus, startTime, endTime, true)
            const convertedResult = StatisticsOrderService.fromOrderStatisticsToCloseIntervals(statistics, startTime, endTime, step)
            if(convertedResult == null)
            {
                return next(createHttpError.MethodNotAllowed("Cannot get the statistics"))
            }

            return res.json(
                {
                    message: "Get the statistics successfully",
                    data: convertedResult
                }
            )
        }
        catch(error)
        {
            console.log(error)
            return next(createHttpError.InternalServerError(error.message))
        }
    },
}


export default StatisticsSystemController