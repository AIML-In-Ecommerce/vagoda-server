import axios from "axios"


const PORT = process.env.PRODUCT_PORT
const BASE_PATH = process.env.BASE_PATH
const publicAPIURL = `${BASE_PATH}:${PORT}`

const CartService = 
{
    async getCartInfoByUserId(userId)
    {
        const url = publicAPIURL + `/cart/user/${userId}`
        try
        {
            const response = await axios.get(url)
            if(response.status == 200)
            {
                const data = response.data
                return data.data
            }
            else
            {
                console.log(response.status)
                console.log(response.data)
                return null
            }
        }
        catch(error)
        {
            console.log("Axios error at getCartInfoByUserId")
            return null
        }
    },

    async createCart(userId)
    {
        const url = publicAPIURL + "/cart"
        const requestBody = {
            user: userId
        }
        try
        {
            const response = await axios.post(url, requestBody)
            if(response == null)
            {
                return null
            }

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
            
            console.log("Axios error at createCart")
            return null
        }
    },
}

export default CartService