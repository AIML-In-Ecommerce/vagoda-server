import mongoose from 'mongoose';
import { ProductAccessType } from '../../shared/enums.js';

const ProductAccessSchema = mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    sessionUser: {
        type: String,
        default: null
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    time: {
        type: Date,
        required: true,
        default: Date.now
    },
    accessType:{
        type: String,
        required: true,
        enum: Object.values(ProductAccessType)
    }
})

const ProductAccess = mongoose.model("ProductAccess", ProductAccessSchema)

export default ProductAccess

export function generateProductAccessRecordProp(productId, time, accessType, shopId, userId = undefined, sessionUserUUID = undefined)
{
    const record = 
    {
        product: productId,
        shop: shopId,
        user: userId,
        sessionUser: sessionUserUUID,
        time: time,
        accessType: accessType
    }

    return record
}