import axios from "axios"



const PORT = process.env.SHOP_PORT
const BASE_PATH = process.env.BASE_PATH
const publicAPIURL = `${BASE_PATH}:${PORT}`

const ShopService = 
{

    async getShopInfo(shopId)
    {
        const url = publicAPIURL + "/shop"

        try
        {
            const response = await axios.get(url, 
                {
                    method: "GET",
                    params: 
                    {
                        id: shopId,
                        useShopDetail: false,
                        useDesign: false
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
                return null
            }
        }
        catch(err)
        {
            return null
        }


    },

    async getShopInfos(shopInfos)
    {
        const url = publicAPIURL + "/shops/"

        const requestBody = 
        {
            ids: shopInfos,
            useShopDetail: false,
            useDesign: false
        }

        const stringifiedRequestBody = JSON.stringify(requestBody)

        try
        {
            const response = await fetch(url, 
                {
                    method: "POST",
                    body: stringifiedRequestBody,
                    headers:
                    {
                        "Content-Type": "application/json"
                    }
                }
            )
            if(response.status == 200)
            {
                const data = await response.json()

                return data.data
            }
            else
            {
                return null
            }
        }
        catch(err)
        {
            return null
        }
    }

}

export default ShopService