
// const publicUserAPI = "http://14.225.218.109:3008/"
const publicAPIURL = "http://localhost:3008/"

const ProductService = 
{

    async getProductByIds(ids)
    {
        const url = publicAPIURL + "/products/list"
        try
        {
            const stringifyString = JSON.stringify(ids)

            const response = await fetch(url,
                {
                    method: "POST",
                    body: stringifyString
                }
            )

            if(response.status == 200)
            {
                const data = await response.json().data
                return data
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