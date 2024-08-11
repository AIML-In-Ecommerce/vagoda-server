import mongoose from "mongoose";

const transactionType = ["income", "expense"];

const TransactionSchema = new mongoose.Schema({
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  category: {
    type: String,
    default: "",
  },
  // transaction type:  enum transaction type: {income, expense}
  type: {
    type: String,
    required: true,
    enum: Object.values(transactionType),
  },

  description: {
    type: String,
    default: "",
  },
  money: {
    type: Number,
    required: true,
    default: 0,
  },
  balance: {
    type: Number,
    required: true,
    default: 0,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

const Transaction = mongoose.model("Transaction", TransactionSchema);

export default Transaction;

// const BankStatementSchema = new mongoose.Schema({
//     shopId: {
//         type: mongoose.Schema.Types.ObjectId,
//         required: true
//     },
//     name: {
//         type: String,
//         default: ""
//     },
//     statementDate: {
//         type: Date,
//         required: true,
//         default: Date.now
//     },
//     startOfPeriod: {
//         type: Date,
//         required: true
//     },
//     endOfPeriod: {
//         type: Date,
//         required: true
//     },
//     period: {
//         type: String,
//         default: ""
//     },
//     orders: {
//         type: [mongoose.Schema.Types.ObjectId],
//         required: true
//     },
//     revenue: {
//         type: Number,
//         required: true,
//         default: 0
//     },
//     originRevenue: {
//         type: Number,
//         required: true,
//         default: 0
//     }
// })

// const BankStatementModel = mongoose.model("BankStatement", BankStatementSchema)

// export function generateStatementRecord(shopId, name, statementDate, startOfPeriod, endOfPeriod, period, orders, revenue, originRevenue)
// {
//     const recordProp = {
//         shopId: shopId,
//         name: name,
//         statementDate: statementDate,
//         startOfPeriod: startOfPeriod,
//         endOfPeriod: endOfPeriod,
//         period: period,
//         orders: orders,
//         revenue: revenue,
//         originRevenue: originRevenue
//     }

//     return recordProp
// }

// export default BankStatementModel
