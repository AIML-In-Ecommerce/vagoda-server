import BankStatementCronJob from "./jobs/bankstatement.job.js"


const listOfJobs = [
    new BankStatementCronJob()
]


export class CronJobManager
{
    constructor()
    {
        this.listOfJobs = listOfJobs
    }

    start()
    {
        this.listOfJobs.forEach((jobGenerator, keyIndex) =>
        {
            jobGenerator.initialize(true, keyIndex, true)
        })

        this.listOfJobs.forEach((jobWorker) =>
        {
            jobWorker.start()
        })
    }
}

const defaultCronJobManager = new CronJobManager()

export default defaultCronJobManager