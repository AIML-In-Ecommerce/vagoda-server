import axios from "axios"

const publicAPIURL = "http://14.225.218.109:3008/"
// const publicAPIURL = "http://localhost:3008/"

const PromotionService = 
{

    async getPromotionByIds(ids)
    {
        const url = publicAPIURL + "promotions"
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