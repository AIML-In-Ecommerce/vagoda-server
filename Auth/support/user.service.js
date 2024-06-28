import axios from "axios"



const PORT = process.env.USER_PORT
const BASE_PATH = process.env.BASE_PATH
const publicAPIURL = `${BASE_PATH}:${PORT}`

const UserService = 
{

    /**
     * 
     * @param {object} registerObject 
     * email: string,
     * password: string,
     * fullName: string,
     * accountType: string
     * @returns {object {accountId, userId}}
     */
    async registerAccountAndUserInfo(registerObject)
    {
        try
        {
            const url = publicAPIURL + "/system/user/register"
            const requestBody = 
            {
                email: registerObject.email,
                password: registerObject.password,
                fullName: registerObject.fullName,
                accountType: registerObject.accountType
            }
    
            const response = await axios.post(url, requestBody, {
                headers:
                {
                    "origin": `${publicAPIURL}`
                }
            })

            if(response.status == 200 || response.status == 201)
            {
                return response.data.data
            }
            else
            {
                return null
            }
        }
        catch(error)
        {
            console.log("Axios error registerAccountAndUserInfo")
            return null
        }
    },

    async deleteUserInfo(targetUserId)
    {
        const url = publicAPIURL + `/system/user/${targetUserId}`
        try
        {
            const response = await axios.delete(url, {
                headers:
                {
                    "origin": `${publicAPIURL}`
                }
            })

            if(response.status == 200 || response.status == 201)
            {
                return response.data
            }
            else
            {
                return null
            }
        }
        catch(error)
        {
            console.log("Axios error deleteUserInfo")

            return null
        }
    },

    async getUserInfoByAccountId(accountId)
    {
        const url = publicAPIURL + "/system/user_info"
        try
        {
            const response = await axios.get(url,
                {
                    params:
                    {
                        accountId: accountId,
                        useAddress: false
                    },
                    headers:
                    {
                        "origin": `${publicAPIURL}`
                    }
                }
            )

            if(response.status == 200)
            {
                return response.data.data
            }
            else
            {
                return null
            }
        }
        catch(error)
        {
            console.log("Axios error at getUserInfoByAccountId")
            return null
        }
    },

    async getUserInfoByUserId(userId)
    {
        const url = publicAPIURL + "/system/user_info"
        try
        {
            const response = await axios.get(url,
                {
                    params:
                    {
                        userId: userId,
                        useAddress: false
                    },
                    headers:
                    {
                        "origin": `${publicAPIURL}`
                    }
                }
            )

            if(response.status == 200)
            {
                return response.data.data
            }
            else
            {
                return null
            }
        }
        catch(error)
        {
            console.log("Axios error at getUserInfoByUserId")
            return null
        }
    }
}

export default UserService