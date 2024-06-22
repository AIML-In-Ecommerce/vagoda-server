import axios from "axios"
import { AccountRegisterType } from "../../User/shared/enums.js"

const PORT = process.env.USER_PORT
const BASE_PATH = process.env.BASE_PATH
const publicAPIURL = `${BASE_PATH}:${PORT}`


const AccountService = 
{
    async deleteAccount(targetAccountId)
    {
        const url = publicAPIURL + `/system/account/${targetAccountId}`

        try
        {
            const responses = await axios.delete(url, 
                {
                    headers:
                    {
                        "origin": `${publicAPIURL}`
                    }
                }
            )
            if(responses.status == 200 || responses.status == 201)
            {
                console.log(responses.data)
                return responses.data
            }
            else
            {
                return null
            }

        }
        catch(error)
        {
            console.log("Axios error at deleteAccount")
            return null
        }


    },

    async getAccountByEmail(email)
    {
        const url = publicAPIURL + "/system/account/email"
        const requestBody = 
        {
            email: email,
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
                return response.data.data
            }
            else
            {
                return null
            }
        }
        catch(error)
        {
            console.log("Axios error getAccountByEmail")
            return null;
        }
    },

    async createAccount(email, password, accountType)
    {
        const url = publicAPIURL + "/system/account/"
        const requestBody = 
        {
            email: email,
            password: password,
            accountType: accountType,
            registerType: AccountRegisterType.STANDARD
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
                return response.data.data
            }
            else
            {
                return null
            }
        }
        catch(error)
        {
            console.log("Axios error getAccountByEmail")
            return null;
        }
    },
}

export default AccountService