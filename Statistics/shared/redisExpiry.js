
const ShopInfosCacheExpiry = 
{
    EXPIRY_OF_TOP_SHOPS_HAS_PRODUCTS_IN_TOP_SALES: 60*5
}

const CategoryInfosCacheExpiry = 
{
    EXPIRY_OF_TOP_IN_SALES_SUB_CATEGORIES: 60*5, //30 minutes
}

const AccessProductCacheExpiry = 
{
    EXPIRY_TIME_OF_CACHE_SEARCHED_PRODUCTS: 60*2 //minutes 
}

export {ShopInfosCacheExpiry, CategoryInfosCacheExpiry, AccessProductCacheExpiry}