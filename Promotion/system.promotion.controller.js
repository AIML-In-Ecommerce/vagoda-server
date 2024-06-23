import createError from "http-errors"
import PromotionService from "./promotion.service.js"


const SystemPromotionController = 
{
    async updateUsedPromotionsQuantity(req, res, next)
    {
        try
        {
            const promotionIds = req.body.promotionIds
            
            const updatedPromotionIds = await PromotionService.updateUsedPromotionsQuantity(promotionIds)
            if(updatedPromotionIds == null)
            {
                return next(createError.BadRequest("Cannot update specified promotions"))
            }

            return res.json({
                message: "Update promotions successfully",
                data: updatedPromotionIds
            })
        }
        catch(error)
        {
            console.log(error)
            return next(createError.InternalServerError(error.message));
        }
    },


}

export default SystemPromotionController