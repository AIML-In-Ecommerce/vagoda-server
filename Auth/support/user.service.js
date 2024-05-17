import axios from "axios"



// const publicAPIURL = "http://14.225.218.109:3002/"
const publicAPIURL = "http://localhost:3002/"

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
            const url = publicAPIURL + "user/register"
            const requestBody = 
            {
                email: registerObject.email,
                password: registerObject.password,
                fullName: registerObject.fullName,
                accountType: registerObject.accountType
            }
    
            const response = await axios.post(url, requestBody)
            console.log(response.data)
            if(response.status == 200 || response.status == 201)
            {
                return response.data.data
            }
            else
            {
                console.log(response.statusText)
                return null
            }
        }
        catch(error)
        {
            console.log(error)
            return null
        }
    },

    async deleteUserInfo(targetUserId)
    {
        const url = publicAPIURL + "user/info"
        try
        {
            const response = await axios.delete(url, 
                {
                    params:
                    {
                        id: targetUserId
                    }
                }
            )

            if(response.status == 200 || response.status == 201)
            {
                console.log(response.data)
                return response.data
            }
            else
            {
                console.log(response.statusText)
                return null
            }
        }
        catch(error)
        {
            console.log(error)
            return null
        }
    },

    async getUserInfoByAccountId(accountId)
    {
        const url = publicAPIURL + "user/info"
        try
        {
            const response = await axios.get(url,
                {
                    params:
                    {
                        accountId: accountId
                    }
                }
            )

            if(response.status == 200)
            {
                return response.data.data
            }
            else
            {
                console.log(response.statusText)
                return null
            }
        }
        catch(error)
        {
            console.log(error)
            return null
        }
    }
}

export default UserService