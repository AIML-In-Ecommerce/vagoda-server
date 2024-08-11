import CronJob_UpdatePromotionStatus from "./jobs/update_promotion_status.job";


const listOfCronJobs = [
    new CronJob_UpdatePromotionStatus()
]

class CronJobController
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
    }
}

export default CronJobController