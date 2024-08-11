import { CronJob } from "cron"
import BankStatementService from "../../service/bankstatement.service.js"

class BankStatementCronJob
{
    constructor(key = undefined, isAutoRestarted = false)
    {
        this.key = key ? key : null
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
            cronTime: `* * * 16,${finalDateOfMonth} * *`,
            // cronTime: "*/2 * * * * *",
            onTick: async () =>
            {
                await BankStatementService.generateBankStatementRecord(startDate, undefined)
                // console.log(new Date().getSeconds())
                if(isOnceTimeJob == true)
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
        const newJob = new BankStatementCronJob(this.key, this.isAutoRestarted)
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