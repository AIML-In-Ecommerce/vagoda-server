import { CronJob } from "cron"
import CronJobService from "../cronjob.service.js"


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
        if(isOnceTimeJob != undefined)
        {
            this.isOnceTimeJob = isOnceTimeJob
        }

        if(key != undefined)
        {
            this.key = key
        }

        if(isAutoRestarted != undefined)
        {
            this.isAutoRestarted = isAutoRestarted
        }

        const newJob = CronJob.from({
            cronTime: "* 15,30,45,0 * * * *",
            onTick: async () => {
                await CronJobService.checkAndUpdateGlobalPromotionStatus()

                if(this.isOnceTimeJob == true)
                {
                    this.#stop()
                }
            }
        })

        this.jobs.push(newJob)
    }

    start()
    {   
        if(this.jobs.length > 0)
        {
            this.jobs[0].start()
            console.log("CronJob_UpdatePromotionStatus is started...")
        }
    }   

    #stop()
    {
        if(this.jobs.length > 0)
        {
            this.jobs[0].stop()
            console.log("CronJob_UpdatePromotionStatus is stopped...")

            this.#regenerate()
            if(this.isAutoRestarted == false)
            {
                return
            }

            console.log("CronJob_UpdatePromotionStatus is restarting...")
            this.#restart()
        }
    }

    #regenerate()
    {
        const newJob = new CronJob_UpdatePromotionStatus(this.key, this.isAutoRestarted, this.isOnceTimeJob)
        this.jobs.push(newJob)
        this.jobs.shift()
    }

    #restart()
    {
        this.jobs[0].initialize()
        this.jobs[0].start()
    }


}

export default CronJob_UpdatePromotionStatus