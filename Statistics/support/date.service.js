import { FromDateStringToUTCTime } from "./from_datestring_to_utc_time.js"

const SupportDateService = 
{
    getClosedIntervals(start, end, dateStringStep)
    {
        const result = []
        const worker = new FromDateStringToUTCTime()
        let moment = start
        while(moment < end)
        {
            let nextMoment = worker.getNextMoment(dateStringStep, moment)
            if(nextMoment > end)
            {
                nextMoment = end
            }
            const interval = [moment, nextMoment]
            result.push(interval)
            moment = nextMoment
        }

        return result
    },
}

export default SupportDateService