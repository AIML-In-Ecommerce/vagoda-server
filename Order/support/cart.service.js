import axios from "axios"


const PORT = process.env.CART_PORT
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
    }


}

export default CartService