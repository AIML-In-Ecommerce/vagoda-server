import express from 'express'
import BankStatementController from '../controller/bankstatement.controller.js'

const bankstatementRouter = express.Router()

// bank statement router

bankstatementRouter.post("/statement/of_shop", BankStatementController.getAllStatementOfShop)
bankstatementRouter.post("/statement/detail", BankStatementController.getStatementDetail)


export default bankstatementRouter