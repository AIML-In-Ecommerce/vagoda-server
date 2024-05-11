

// const publicUserAPI = "http://14.225.218.109:3002/user/"
const publicUserAPI = "http://localhost:3002/user/"

const UserService = 
{
    async getUserInfo(userId)
    {
        const url = publicUserAPI + userId

        try
        {
            const response = await fetch(url)

            if(response.status == 200)
            {
                const data = await response.json()
                return data
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