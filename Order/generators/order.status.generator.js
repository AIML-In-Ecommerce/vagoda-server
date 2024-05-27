import { OrderStatus } from "../shared/enums.js"

const ORDER_WAITING_ZALOPAY_DEADLINE= process.env.ORDER_WAITING_ZALOPAY_DEADLINE
const ORDER_PENDING_STATUS_DEADLINE= process.env.ORDER_PENDING_STATUS_DEADLINE
const ORDER_PROCESSING_STATUS_DEADLINE= process.env.ORDER_PROCESSING_STATUS_DEADLINE
const ORDER_COMPLETED_STATUS_DEADLINE= process.env.ORDER_COMPLETED_STATUS_DEADLINE
const ORDER_CANCELLED_STATUS_DEADLINE= process.env.ORDER_CANCELLED_STATUS_DEADLINE



const OrderStatusGenerators = 
{
    generateWaitingOnlinePaymentStatus()
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
    },
    
    generatePendingStatus()
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
    },
    
    generateProcessingStatus()
    {
        const time = new Date(Date.now())
        const newTimeDeadline = new Date(time).setDate(time.getDate() + ORDER_PROCESSING_STATUS_DEADLINE)
        const deadline = new Date(newTimeDeadline)
        const status = 
        {
            status: OrderStatus.PROCESSING,
            time: time,
            deadline: deadline
        }
    
        return status
    },
    
    generateShippingStatus()
    {
        const time = new Date(Date.now())
    
        const status = 
        {
            status: OrderStatus.SHIPPING,
            time: time
        }
    
        return status
    },
    
    generateCompletedStatus()
    {
        const time = new Date(Date.now())
        const newTimeDeadline = new Date(time).setDate(time.getDate() + ORDER_COMPLETED_STATUS_DEADLINE)
        const deadline = new Date(newTimeDeadline)
        const status = 
        {
            status: OrderStatus.COMPLETED,
            time: time,
            deadline: deadline
        }
    
        return status
    },
    
    generateCancelledStatus()
    {
        const time = new Date(Date.now())
        const newTimeDeadline = new Date(time).setDate(time.getDate() + ORDER_CANCELLED_STATUS_DEADLINE)
        const deadline = new Date(newTimeDeadline)
        const status = 
        {
            status: OrderStatus.CANCELLED,
            time: time,
            deadline: deadline
        }
    
        return status
    },
}

export default OrderStatusGenerators