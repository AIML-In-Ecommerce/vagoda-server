import axios from "axios"

const publicAPIURL = "http://14.225.218.109:3006/"
// const publicAPIURL = "http://localhost:3006/"

const ProductService = 
{

    async getProductByIds(ids)
    {
        const url = publicAPIURL + "products/list"
        try
        {
            const requestBody = 
            {
                ids: ids
            }

            const response = await axios.post(url, requestBody,
                {
                    method: "POST"
                }
            )

            if(response.status == 200)
            {
                const data = response.data
                return data.data
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

export default ProductService