import axios from "axios"

// const publicAPIURL = "http://14.225.218.109:3004/"
const publicAPIURL = "http://localhost:3004/"

const ShopService = 
{

    /**
     * @param {string} shopName 
     * @param {string} accountId 
     */
    async createShopInfo(shopName, accountId)
    {
        const url = publicAPIURL + "shop"
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
        const url = publicAPIURL + "shop/account"
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