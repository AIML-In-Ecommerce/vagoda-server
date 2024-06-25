import axios from "axios"

const PORT = process.env.PRODUCT_PORT
const BASE_PATH = process.env.BASE_PATH
const publicAPIURL = `${BASE_PATH}:${PORT}`

const ProductService = 
{

    async getProductByIds(ids)
    {
        const url = publicAPIURL + "/products/list"
        try
        {
            const requestBody = 
            {
                ids: ids
            }

            const response = await axios.post(url, requestBody,
                {
                    headers:
                    {
                        "origin": `${publicAPIURL}`
                    }
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
    },

    async increaseSoldAmountOfManyProducts(updateInfos)
    {
        const url = publicAPIURL + "/system/products/sold_amount/increase"
        try
        {
            const requestBody = 
            {
                updateInfos: updateInfos
            }

            const response = await axios.put(url, requestBody,
                {
                    headers:
                    {
                        "origin": `${publicAPIURL}`
                    }
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
            console.log("Axios Error at increaseSoldAmountOfManyProducts")

            return null;
        }
    },

    async decreaseSoldAmountOfManyProducts(updateInfos)
    {
        const url = publicAPIURL + "/system/products/sold_amount/decrease"
        try
        {
            const requestBody = 
            {
                updateInfos: updateInfos
            }

            const response = await axios.put(url, requestBody,
                {
                    headers:
                    {
                        "origin": `${publicAPIURL}`
                    }
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
            console.log("Axios Error at decreaseSoldAmountOfManyProducts")

            return null;
        }
    },

}

export default ProductService