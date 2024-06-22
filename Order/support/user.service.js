import axios from "axios"


const PORT = process.env.USER_PORT
const BASE_PATH = process.env.BASE_PATH
const publicAPIURL = `${BASE_PATH}:${PORT}`

const UserService = 
{
    async getUserInfo(userId, useAddress)
    {
        const url = publicAPIURL + "/system/user_info"

        try
        {
            const response = await axios.get(url, {
                method: "GET",
                headers: {
                    "origin": `${publicAPIURL}`
                },
                params:
                {
                    userId: userId,
                    useAddress: useAddress,
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
            console.log("Axios error at getUserInfo")
            return null
        }
    },

    async getListOfUserInfos(userIds, useAddress)
    {
        const url = publicAPIURL + "/system/user_info/list"
        const requestBody = 
        {
            userIds: userIds,
            useAddress: useAddress
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
            
            if(response.status == 200 || response.status == 201)
            {
                const data = response.data
                return data.data
            }
            else
            {
                console.log("Not success in getListOfUserInfos")
                return null
            }
        }
        catch(error)
        {
            console.log("Axios error in getListOfUserInfos")
            return null
        }
    },
}

export default UserService