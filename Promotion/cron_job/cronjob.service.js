import Promotion from "../promotion.model.js"


const DEFAULT_AMOUNT_WILL_GET = 500

const CronJobService = 
{
    async checkAndUpdateGlobalPromotionStatus()
    {
        let lastPromotionId = null
        let isReachingLimit = false
        
        for(let index = 0; isReachingLimit == false; i++)
        {
            const rawPromotions = await Promotion.find().
        }
    }
}

export default CronJobService