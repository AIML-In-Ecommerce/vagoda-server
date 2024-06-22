import axios from "axios"
import { DiscountType } from "../shared/enums"

const PORT = process.env.PROMOTION_PORT
const BASE_PATH = process.env.BASE_PATH
const publicAPIURL = `${BASE_PATH}:${PORT}`

const PromotionService = 
{

    async getPromotionByIds(ids)
    {
        const url = publicAPIURL + "/promotion/list"
        try
        {
            const requestBody = 
            {
                promotionIds: ids
            }

            const response = await axios.post(url, requestBody,
                {
                    headers:
                    {
                        "origin": `${publicAPIURL}`
                    }
                }
            )

            if(response.status == 200)
            {
                const data = await response.data
                return data.data
            }
            else
            {
                return null;
            }
        }
        catch(error)
        {
            console.log("Axios error at getPromotionByIds")
            return null;
        }


    },

    calculateDiscountValue(targetPromotionInfo, finalPrice)
    {
        let discountValue = 0
        if(targetPromotionInfo.discountTypeInfo.type == DiscountType.DIRECT_PRICE)
        {
          discountValue = targetPromotionInfo.discountTypeInfo.value
        }
        else if(targetPromotionInfo.discountTypeInfo.type == DiscountType.PERCENTAGE)
        {
          const expectedDiscount = finalPrice / 100 * targetPromotionInfo.discountTypeInfo.value
          discountValue = expectedDiscount > targetPromotionInfo.discountTypeInfo.limitAmountToReduce ? targetPromotionInfo.discountTypeInfo.limitAmountToReduce : expectedDiscount
        }

        return discountValue
    },

}

export default PromotionService