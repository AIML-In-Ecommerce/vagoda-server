


// const publicUserAPI = "http://14.225.218.109:3004/shop/"
const publicAPIURL = "http://localhost:3004/"

const ShopService = 
{

    async getShopInfo(shopId)
    {
        const url = publicAPIURL + "shop/" + shopId

        try
        {
            const response = await fetch(url, 
                {
                    method: "GET"
                }
            )
            if(response.status == 200)
            {
                const data = await response.json().data

                return data
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
        const url = publicAPIURL + "shops/"

        const requestBody = JSON.stringify(shopInfos)

        try
        {
            const response = await fetch(url, 
                {
                    method: "POST",
                    body: requestBody
                }
            )
            if(response.status == 200)
            {
                const data = await response.json()

                return data
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