import axios from "axios"


const PORT = process.env.SHOP_PORT
const BASE_PATH = process.env.BASE_PATH
const publicAPIURL = `${BASE_PATH}:${PORT}`

const ShopSupportService = 
{

    async getListOfShopInfosByShopIds(shopIds)
    {
        const url = `${publicAPIURL}/system/shops`
        const requestBody = {
            ids: shopIds,
            useDesign: true,
            useShopDetail: true
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
            console.log("Axios error at getListOfShopInfosByShopIds")
            return null
        }
    },

}

export default ShopSupportService