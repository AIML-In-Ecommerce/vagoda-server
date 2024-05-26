import { OrderStatus } from "../shared/enums.js";

const ORDER_WAITING_ZALOPAY_DEADLINE = Number(process.env.ORDER_WAITING_ZALOPAY_DEADLINE) //minutes
const ORDER_PENDING_STATUS_DEADLINE = Number(process.env.ORDER_PENDING_STATUS_DEADLINE) //days



export function generateStatusWhenWaitingZaloPay()
{
    const time = new Date(Date.now())
    const newTimeDeadline = new Date(time).setMinutes(time.getMinutes() + ORDER_WAITING_ZALOPAY_DEADLINE)
    const deadline = new Date(newTimeDeadline)

    const status = 
    {
        status: OrderStatus.WAITING_ONLINE_PAYMENT,
        time: time,
        deadline: deadline
    }

    return status
}

export function generateStatusWhenCOD()
{
    const time = new Date(Date.now())
    const newTimeDeadline = new Date(time).setDate(time.getDate() + ORDER_PENDING_STATUS_DEADLINE)
    const deadline = new Date(newTimeDeadline)
    const status = 
    {
        status: OrderStatus.PENDING,
        time: time,
        deadline: deadline
    }

    return status
}