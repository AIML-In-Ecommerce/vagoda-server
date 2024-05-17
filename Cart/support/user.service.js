import axios from 'axios'

// const publicAPIURL = "http://14.225.218.109:3002/"
const publicAPIURL = "http://localhost:3002/"

const UserService = 
{
    async getUserInfo(userId)
    {
        const url = publicAPIURL + "user/info?userId=" + userId

        try
        {
            const response = await axios.get(url, {
                method: "GET"
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