import axios from "axios"

const PORT = process.env.PROMOTION_PORT
const BASE_PATH = process.env.BASE_PATH
const publicAPIURL = `${BASE_PATH}:${PORT}`

const PromotionService = 
{

    async getPromotionByIds(ids)
    {
        const url = publicAPIURL + "/promotions"
        try
        {
            const requestBody = 
            {
                ids: ids
            }

            const response = await axios.post(url, requestBody,
                {
                    method: "POST"
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
            console.log(error)

            return null;
        }


    }

}

export default PromotionService