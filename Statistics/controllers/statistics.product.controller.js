import createError from 'http-errors'
import StatisticsProductService from '../services/statistics.product.service.js'


const StatisticsProductController = 
{
    async getTopProductInSalesBySeller(req, res, next)
    {
        try
        {
            const shopId = req.body.shopId
            const startTime = req.body.startTime
            const endTime = req.body.endTime
            const amount = req.body.amount

            const statistics = await StatisticsProductService.getTopProductInSalesBySeller(shopId, amount, startTime, endTime)
            if(statistics == null)
            {
                return next(createError.MethodNotAllowed("Cannot get the statistics"))
            }

            return res.json(
                {
                    message: "Get top sales of products successfully",
                    data: statistics
                }
            )
        }
        catch(error)
        {
            console.log(error)
            return next(createError.InternalServerError(error.message))
        }
    }
}

export default StatisticsProductController