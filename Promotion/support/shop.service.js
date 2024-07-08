import axios from 'axios'

const PORT = process.env.SHOP_PORT
const BASE_PATH = process.env.BASE_PATH
const publicAPIURL = `${BASE_PATH}:${PORT}`

const SupportShopService = 
{
    async getShopInfoByShopId(shopId, useDesign, useShopDetail)
    {
        const url = `${publicAPIURL}/system/shop_info`
        
        try
        {
            const response = await axios.get(url, {
                params: {
                    shopId: shopId,
                    useDesign: useDesign,
                    useShopDetail: useShopDetail
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
            console.log("Axios error at getShopInfoByShopId")
            return null
        }
    },

    async getShopInfosByShopIds(shopIds, useDesign, useShopDetail)
    {
        const url = `${publicAPIURL}/system/shops`
        
        try
        {
            const response = await axios.get(url, {
                params: {
                    ids: shopIds,
                    useDesign: useDesign,
                    useShopDetail: useShopDetail
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
            console.log("Axios error at getShopInfosByShopIds")
            return null
        }
    },
}

export default SupportShopService