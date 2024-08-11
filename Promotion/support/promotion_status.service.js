import { PromotionStatus } from "../shared/enums.js"


const PromotionStatusService = 
{
    getPromotionStatusByCondition(currentDate, createAt, activeDate, expiredDate, quantity, redeemedTotal)
    {
        const currentDateToEx = new Date(currentDate)
        const createAtToEx = new Date(createAt)
        const activeDateToEx = new Date(activeDate)
        const expiredDateToEx = new Date(expiredDate)

        let targetStatus = ""
        if(redeemedTotal >= quantity)
        {
            targetStatus = PromotionStatus.NOT_AVAILABLE
        }
        if(currentDateToEx < activeDateToEx)
        {
            targetStatus = PromotionStatus.UPCOMMING
        }
        if(currentDateToEx >= activeDate && currentDateToEx <= expiredDateToEx)
        {
            targetStatus = PromotionStatus.IN_PROGRESS
        }
        if(currentDateToEx >= expiredDateToEx)
        {
            targetStatus = PromotionStatus.EXPIRED
        }

        return targetStatus
    }
}

export default PromotionStatusService