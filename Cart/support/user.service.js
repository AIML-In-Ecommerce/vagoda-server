import axios from 'axios'

const PORT = process.env.USER_PORT
const BASE_PATH = process.env.BASE_PATH
const publicAPIURL = `${BASE_PATH}:${PORT}`

const UserService = 
{
    async getUserInfo(userId)
    {
        const url = publicAPIURL + "/system/user_info"

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
                const data = await response.data
                return data.data
            }
            else
            {
                return null
            }
        }
        catch(err)
        {
            console.log(err)
            return null
        }
    }
}

export default UserService