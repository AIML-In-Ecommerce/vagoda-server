


const publicAPIURL = "http://14.225.218.109:3004/"
// const publicAPIURL = "http://localhost:3004/"

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


    },

    async getShopInfos(shopInfos)
    {
        const url = publicAPIURL + "shops/"

        const requestBody = 
        {
            ids: shopInfos,
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