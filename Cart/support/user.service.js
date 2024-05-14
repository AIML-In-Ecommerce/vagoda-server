

// const publicUserAPI = "http://14.225.218.109:3002/"
const publicUserAPI = "http://localhost:3002/"

const UserService = 
{
    async getUserInfo(userId)
    {
        const url = publicUserAPI + "user/info?userId=" + userId

        try
        {
            const response = await fetch(url,
                {
                    method: "GET",
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
            console.log(err)
            return null
        }
    }
}

export default UserService