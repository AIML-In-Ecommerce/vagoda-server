import createHttpError from "http-errors"
import BankStatementService from "../service/bankstatement.service.js"


const BankStatementController = 
{
    async getAllStatementOfShop(req, res, next)
    {
        try
        {
            const shopId = req.body.shopId

            if(shopId == undefined)
            {
                return next(createHttpError.BadRequest("Missing required parameter"))
            }
    
            const index = req.body.index
            const amount = req.body.amount
    
            const statements = await BankStatementService.getAllBankStatementOfShop(shopId, index, amount)
            if(statements == null)
            {
                return next(createHttpError.MethodNotAllowed("Cannot get statements"))
            }

            const total = statements.length
            let totalPages = 0
            if(Number.isInteger(amount) && amount > 0)
            {
                totalPages = (total / amount) + (total % amount)
            }

            return res.json({
                message: "Get statements successfully",
                data: {
                    total: total,
                    totalPages: totalPages,
                    statements: statements
                }
            })
        }
        catch(error)
        {
            console.log(error)
            return next(createHttpError.InternalServerError(error.message))
        }
    },

    async getStatementDetail(req, res, next)
    {
        try
        {
            const statementId = req.body.id
            const index = req.body.index
            const amount = req.body.amount

            if(statementId == undefined)
            {
                return next(createHttpError.BadRequest("Missing required parameter"))
            }

            const detail = await BankStatementService.getStatementDetail(statementId, index, amount)
            if(detail == null)
            {
                return next(createHttpError.MethodNotAllowed())
            }

            const total = detail.productStatements.length
            const totalPages = Number.isInteger(amount) ? total / amount + total % amount : 0

            const finalResult = {
                total: total,
                totalPages: totalPages,
                totalAmount: detail.totalAmount,
                totalRevenue:detail.totalRevenue,
                statementPeriod: detail.period,
                statementDate: detail.statementDate,
                productStatements: detail.productStatements
            }

            return res.json({
                message: "Get bank statement successfully",
                data: finalResult
            })
        }
        catch(error)
        {
            console.log(error)
            return next(createHttpError.InternalServerError(error.message))
        }
    }
}

export default BankStatementController