
const TimeSuffixesConvention = {
    milliseconds: "ms",
    second: "s",
    minute: "mt",
    hour: "h",
    day: "d",
    week: "w",
    month: "m",
    quarter: "q",
    year: "y"
}

function getNextMomentWithMillisecondStep(step, providedTime)
{
    const currentTime = new Date(providedTime)
    return new Date(new Date(currentTime).setMilliseconds(currentTime.getMilliseconds() + step))
}

function getNextMomentWithSecondStep(step, providedTime)
{
    const currentTime = new Date(providedTime)
    return new Date(new Date(currentTime).setSeconds(currentTime.getSeconds() + step))
}

function getNextMomentWithMinuteStep(step, providedTime)
{
    const currentTime = new Date(providedTime)
    return new Date(new Date(currentTime).setMinutes(currentTime.getMinutes() + step))
}

function getNextMomentWithHourStep(step, providedTime)
{
    const currentTime = new Date(providedTime)
    return new Date(new Date(currentTime).setHours(currentTime.getHours() + step))
}

function getNextMomentWithDayStep(step, providedTime)
{
    const currentTime = new Date(providedTime)
    return new Date(new Date(currentTime).setDate(currentTime.getDate() + step))
}

function getNextMomentWithWeekStep(step, providedTime)
{
    const currentTime = new Date(providedTime)
    return new Date(new Date(currentTime).setDate(currentTime.getDate() + step*7))
}

function getNextMomentWithMonthStep(step, providedTime)
{
    const currentTime = new Date(providedTime)
    return new Date(new Date(currentTime).setMonth(currentTime.getMonth() + step))
}

function getNextMomentWithYearStep(step, providedTime)
{
    const currentTime = new Date(providedTime)
    return new Date(new Date(currentTime).setFullYear(currentTime.getFullYear() + step))
}

const init = [
    {key: TimeSuffixesConvention.milliseconds, worker: getNextMomentWithMillisecondStep},
    {key: TimeSuffixesConvention.second, worker: getNextMomentWithSecondStep},
    {key: TimeSuffixesConvention.minute, worker: getNextMomentWithMinuteStep},
    {key: TimeSuffixesConvention.hour, worker: getNextMomentWithHourStep},
    {key: TimeSuffixesConvention.day, worker: getNextMomentWithDayStep},
    {key: TimeSuffixesConvention.week, worker: getNextMomentWithWeekStep},
    {key: TimeSuffixesConvention.month, worker: getNextMomentWithMonthStep},
    {key: TimeSuffixesConvention.year, worker: getNextMomentWithYearStep}
]



export class FromDateStringToUTCTime
{
    constructor()
    {
        this.seperator = "-"
        this.workers = new Map()
        init.forEach((item) =>
        {
            this.workers.set(item.key, item.worker)
        })
    }

    getNextMoment(providedStepString, providedTime)
    {
        const trimString = providedStepString.trim()
        const splitedStrings = trimString.split(this.seperator)

        const step = Number(splitedStrings[0])
        const targetType = String(splitedStrings[1]).toLowerCase()
        const worker = this.workers.get(targetType)
        if(worker == undefined)
        {
            return new Date(providedTime)
        }

        return worker(step, providedTime)
    }
}