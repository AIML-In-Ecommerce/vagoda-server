import axios from "axios"


const PORT = process.env.PRODUCT_PORT
const BASE_PATH = process.env.BASE_PATH
const publicAPIURL = `${BASE_PATH}:${PORT}`

const SupportProductService = 
{
    async getProductInfosByIds(productIds)
    {
        const url = `${publicAPIURL}/products/list`
        const requestBody = {
            ids: productIds
        }
        try
        {
            const response = await axios.post(url, requestBody, {
                headers: {
                    "origin": `${publicAPIURL}`
                }
            })

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
            console.log("Axios error at getProductInfosByIds")
            return null
        }
    }
}

export default SupportProductService