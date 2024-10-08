import express from 'express'
import statisticsAccessRouter from './statistics.access.router.js'
import statisticsShopRouter from './statistics.shop.router.js'
import statisticsOrderRouter from './statistics.order.router.js'
import statisticsProductRouter from './statistics.product.router.js'
import statisticsCategoryRouter from './statistics.category.router.js'

const router = express.Router()

router.use("/access", statisticsAccessRouter)

router.use("/shop", statisticsShopRouter)

router.use("/order", statisticsOrderRouter)

router.use("/product", statisticsProductRouter)

router.use("/category", statisticsCategoryRouter)

export default router