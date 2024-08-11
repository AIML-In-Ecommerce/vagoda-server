import CronJob_UpdatePromotionStatus from "./jobs/update_promotion_status.job.js";


const listOfCronJobs = [
    new CronJob_UpdatePromotionStatus("#update-promotion-status", true, false)
]

export class CronJobController
{
    constructor()
    {
        this.listOfJobs = []
    }

    initialize()
    {
        this.listOfJobs = listOfCronJobs
    }

    start()
    {
        if(this.listOfJobs.length == 0)
        {
            return
        }

        this.listOfJobs.forEach((job) =>
        {
            job.initialize()
        })

        this.listOfJobs.forEach((job) => {
            job.start()
        })
    }
}

const defaultCronJobController = new CronJobController()

defaultCronJobController.initialize()

export default defaultCronJobController