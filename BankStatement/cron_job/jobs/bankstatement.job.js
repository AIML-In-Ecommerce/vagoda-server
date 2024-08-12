import { CronJob } from "cron"
import BankStatementService from "../../service/bankstatement.service.js"
import { TransactionType } from "../../shared/enums.js"
import { generateTransactionRecordProp } from "../../model/transaction.model.js"
import TransactionService from "../../service/transaction.service.js"
// import moment from "moment"

class BankStatementCronJob
{
    constructor(key = undefined, isAutoRestarted = false, isOnceTimeJob = false)
    {
        this.key = key ? key : null
        this.isOnceTimeJob = isOnceTimeJob
        this.isAutoRestarted = isAutoRestarted
        this.jobs = []
        this.numberDateOfMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    }

    initialize(isOnceTimeJob = undefined, key = undefined, isAutoRestarted = undefined)
    {
        if(key != undefined)
        {
            this.key = key
        }
        if(isAutoRestarted != undefined)
        {
            this.isAutoRestarted = isAutoRestarted
        }
        if(isOnceTimeJob != undefined)
        {
            this.isOnceTimeJob = isOnceTimeJob
        }

        this.isAutoRestarted = isAutoRestarted

        const date = new Date()
        const currentYear = date.getFullYear()
        const currentMonthIndex = date.getMonth()

        if (((currentYear % 4 == 0) && (currentYear % 100 != 0) && (currentYear % 400 != 0)) || (currentYear % 100 == 0 && currentYear % 400 == 0))
        {
            this.numberDateOfMonth[1] = 29 //February in a Leap year
        }

        const finalDateOfMonth = this.numberDateOfMonth[currentMonthIndex]

        this.jobs.push(CronJob.from({
            // second|minute|hour|day_of_month|month|day_of_week
            cronTime: `* * * 11,21,${finalDateOfMonth} * *`,
            // cronTime: "*/2 * * * * *",
            onTick: async () =>
            {
                const bankStatements = await BankStatementService.generateBankStatementRecord(startDate, undefined)

                if(bankStatements != null)
                {
                    for(let i = 0; i < bankStatements.length; i++)
                    {
                        const category = `Doanh thu`
                        const type = TransactionType.INCOME
                        const shopId = bankStatements[i].shopId.toString()
                        const description = `${bankStatements[i].name} (${bankStatements[i].period})`
                        const money = bankStatements[i].revenue

                        const recordProp = generateTransactionRecordProp(shopId, type, category, description, money, undefined, undefined)
                        await TransactionService.create(recordProp)
                    }
                }

                if(this.isOnceTimeJob == true)
                {
                    this.#stop()
                }
            },
        }))
    }

    start()
    {
        if(this.jobs.length > 0)
        {
            console.log("BankStatementJob starting...")
            this.jobs[0].start()
        }
    }

    #stop()
    {
        if(this.jobs.length > 0)
        {
            this.jobs[0].stop()
            console.log("BankStatementJob stopped...")

            this.#regenerate()
            if(this.isAutoRestarted == false)
            {
                return
            }

            console.log("BankStatementJob restarting...")
            this.#restart()
        }
    }

    #regenerate()
    {
        const newJob = new BankStatementCronJob(this.key, this.isAutoRestarted, this.isOnceTimeJob)
        this.jobs.push(newJob)
        this.jobs.shift()
    }

    #restart()
    {
        this.jobs[0].initialize()
        this.jobs[0].start()
    }
}


export default BankStatementCronJob