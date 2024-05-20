import axios from "axios"

const PORT = process.env.SHOP_PORT
const BASE_PATH = process.env.BASE_PATH
const publicAPIURL = `${BASE_PATH}:${PORT}`

const ShopService = 
{

    /**
     * @param {string} shopName 
     * @param {string} accountId 
     */
    async createShopInfo(shopName, accountId)
    {
        const url = publicAPIURL + "/shop"
        try
        {
            const requestBody =
            {
                name: shopName,
                account: accountId
            }

            const response = await axios.post(url, requestBody)
            console.log(response.data)
            if(response.status == 200 || response.status == 201)
            {
                return response.data.data
            }
            else
            {
                console.log(response.statusText)
                return null
            }
        }
        catch(error)
        {
            console.log(error)
            return null
        }
    },

    async getShopInfoByAccountId(accountId)
    {
        const url = publicAPIURL + "/shop_info"
        try
        {
            const response = await axios.get(url, 
                {
                    params:
                    {
                        accountId: accountId,
                        useShopDetail: false,
                        useDesign: false
                    }
                }
            )
            if(response == null)
            {
                console.log(response.statusText)
                return null
            }

            return response.data.data
        }
        catch(error)
        {
            console.log(error)
            return null
        }
    },
}

export default ShopService