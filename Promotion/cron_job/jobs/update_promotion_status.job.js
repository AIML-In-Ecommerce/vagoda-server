import { CronJob } from "cron"


class CronJob_UpdatePromotionStatus
{
    constructor(key = null, isAutoRestarted = false, isOnceTimeJob = true)
    {
        this.isOnceTimeJob = isOnceTimeJob
        this.isAutoRestarted = isAutoRestarted
        this.key = key
        this.jobs = []
    }

    initialize(isOnceTimeJob = undefined, key = undefined, isAutoRestarted = undefined)
    {
        const newJob = CronJob.from({
            cronTime: "*/2 * * * * *",
            onTick: () => {
                console.log("promotion")
            }
        })
    }

    start()
    {

    }

    #stop()
    {

    }

    #regenerate()
    {

    }

    #restart()
    {

    }


}

export default CronJob_UpdatePromotionStatus