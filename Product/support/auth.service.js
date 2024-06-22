import axios from "axios"


const PORT = process.env.AUTH_PORT
const BASE_PATH = process.env.BASE_PATH
const publicAPIURL = `${BASE_PATH}:${PORT}`

const AuthService = 
{

    async verifyAccessToken(token, sentTime)
    {
        const url = `${publicAPIURL}/system/auth/verify/access_token`
        const requestBody = 
        {
            accessToken: token,
            sentTime: sentTime
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
                console.log("Invalid token")
                return null
            }
        }
        catch(error)
        {
            console.log("Axios error at verifyIncommingToken")
            return null
        }
    }

}


export default AuthService