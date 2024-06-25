import axios from "axios"


const PORT = process.env.CART_PORT
const BASE_PATH = process.env.BASE_PATH
const publicAPIURL = `${BASE_PATH}:${PORT}`

const CartService = 
{
    async getCartInfoByUserId(userId)
    {
        const url = publicAPIURL + `/system/cart/user`
        try
        {
            const response = await axios.get(url, {
                headers:
                {
                    "origin": `${publicAPIURL}`
                },
                params:
                {
                    userId: userId
                }
            })
            if(response.status == 200)
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
            console.log("Axios error at getCartInfoByUserId")
            return null
        }
    },

    async createCart(userId)
    {
        const url = publicAPIURL + "/system/cart/create"
        const requestBody = {
            user: userId
        }
        try
        {
            const response = await axios.post(url, requestBody, 
                {
                    headers:
                    {
                        "origin": `${publicAPIURL}`
                    }
                }
            )
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