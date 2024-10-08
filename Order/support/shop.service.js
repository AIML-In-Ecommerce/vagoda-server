import axios from "axios"



const PORT = process.env.SHOP_PORT
const BASE_PATH = process.env.BASE_PATH
const publicAPIURL = `${BASE_PATH}:${PORT}`

const ShopService = 
{

    async getShopInfo(shopId)
    {
        const url = publicAPIURL + "/system/shop_info"

        try
        {
            const response = await axios.get(url, 
                {
                    headers:
                    {
                        "origin": `${publicAPIURL}`
                    },
                    params: 
                    {
                        shopId: shopId,
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
            console.log("Axios error at getShopInfos")
            return null
        }


    },

    async getShopInfos(shopInfos)
    {
        const url = publicAPIURL + "/system/shops"

        const requestBody = 
        {
            ids: shopInfos,
            useShopDetail: false,
            useDesign: false
        }

        try
        {
            const response = await axios.post(url, requestBody, 
                {
                    headers: {
                        "origin": `${publicAPIURL}`
                    }
                }
            )
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
        catch(err)
        {
            console.log("Axios error at getShopInfos")
            return null
        }
    }

}

export default ShopService