import axios from "axios"


// const publicAPIURL = "http://14.225.218.109:3002/"
const publicAPIURL = "http://localhost:3002/"


const AccountService = 
{
    async deleteAccount(targetAccountId)
    {
        const url = publicAPIURL + `account/${targetAccountId}`

        try
        {
            const responses = await axios.delete(url)
            if(responses.status == 200 || responses.status == 201)
            {
                console.log(responses.data)
                return responses.data
            }
            else
            {
                console.log(responses.statusText)
                return null
            }

        }
        catch(error)
        {
            console.log(error)
            return null
        }


    },

    async getAccountByEmail(email)
    {
        const url = publicAPIURL + "account/email"
        const requestBody = 
        {
            email: email,
        }

        try
        {
            const response = await axios.post(url, requestBody)
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
            console.log(error)
            return null;
        }
    }
}

export default AccountService