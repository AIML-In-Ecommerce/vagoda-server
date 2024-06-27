import createHttpError from "http-errors"
import AuthService from "../support/auth.service.js"
import { AccountType } from "../shared/enums.js"

export const AuthorizedUserIdInHeader = "A-User-Id"
export const A_SESSION_USER_ID_IN_HEADERS = "A-Session-User-Id"


const SESSION_ID_COOKIE_KEY = String(process.env.SESSION_COOKIE_KEY) || "ssid"

const VerificationService = 
{

    async verifyBuyerRole(req, res, next)
    {
        const sentTime = new Date()

        const bearerToken = req.header("Authorization")
        if(bearerToken == undefined)
        {
            return next(createHttpError.Unauthorized())
        }

        const accessToken = bearerToken.split(" ")[1]

        //veridy incomming token
        const tokenInfo = await AuthService.verifyAccessToken(accessToken, sentTime)
        if(tokenInfo == null)
        {
            return next(createHttpError.Unauthorized())
        }

        //check role
        if(tokenInfo.userRole != AccountType.BUYER)
        {
            return next(createHttpError.Forbidden("Forbidden access"))
        }

        req.headers[`${AuthorizedUserIdInHeader}`] = tokenInfo.userId
        next()
    },

    async verifySystemRole(req, res, next)
    {
        console.log("System validator")
        const base_path = process.env.BASE_PATH
        const origin = req.headers.origin

        if(origin.includes(base_path) == false)
        {
            console.log("not a request from the system")
            return next(createHttpError.Forbidden())
        }

        //request verification to AuthService
        console.log("a request from the system")
        next()
    },

    async verifySellerRole(req, res, next)
    {
        const sentTime = new Date()

        const bearerToken = req.header("Authorization")
        if(bearerToken == undefined)
        {
            return next(createHttpError.Unauthorized())
        }

        const accessToken = bearerToken.split(" ")[1]

        //veridy incomming token
        const tokenInfo = await AuthService.verifyAccessToken(accessToken, sentTime)
        if(tokenInfo == null)
        {
            return next(createHttpError.Unauthorized())
        }

        //check role
        if(tokenInfo.userRole != AccountType.SHOP)
        {
            return next(createHttpError.Forbidden("Forbidden access"))
        }

        req.headers[`${AuthorizedUserIdInHeader}`] = tokenInfo.userId

        next()
    },

    async verifySessionId(req, res, next)
    {
        const sessionId = req.body.ssid

        const verifiedData = await AuthService.verifySessionId(sessionId)
        if(verifiedData == null)
        {
            return next(createHttpError.Unauthorized("Invalid sessionId value"))
        }

        req.headers[`${A_SESSION_USER_ID_IN_HEADERS}`] = verifiedData.uuid
        next()
    },

    allow(req, res, next)
    {
        console.log("allow request to go in the open router")
        next()
    },
}

export default VerificationService