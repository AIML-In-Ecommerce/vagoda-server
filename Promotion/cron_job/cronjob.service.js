import Promotion from "../promotion.model.js"
import PromotionStatusService from "../support/promotion_status.service.js"


const DEFAULT_AMOUNT_WILL_GET = 500

const CronJobService = 
{
    async checkAndUpdateGlobalPromotionStatus()
    {
        const currentDate = new Date()
        let isReachingLimit = false
        
        for(let index = 0; isReachingLimit == false; index++)
        {
            const rawPromotions = await Promotion.find().skip(index*DEFAULT_AMOUNT_WILL_GET).limit(DEFAULT_AMOUNT_WILL_GET)
            if(rawPromotions.length < 1)
            {
                isReachingLimit = true
                console.log("Updated...")
            }
            else
            {
                for(let i = 0; i < rawPromotions.length; i++)
                {
                    const createAt = rawPromotions[i].createAt
                    const activeDate = rawPromotions[i].activeDate
                    const expiredDate = rawPromotions[i].expiredDate
                    const quantity = rawPromotions[i].quantity
                    const redeemedTotal = rawPromotions[i].redeemedTotal
                    const targetStatus = PromotionStatusService.getPromotionStatusByCondition(currentDate, createAt, activeDate, expiredDate, quantity, redeemedTotal)

                    rawPromotions[i].status = targetStatus
                    await rawPromotions[i].save()
                }
            }
        }
    }
}

export default CronJobService