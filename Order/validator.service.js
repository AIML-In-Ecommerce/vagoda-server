

const ValidatorService = 
{
    validateBuyerRole(req, res, next)
    {
        next()
    },

    validateSystemRole(req, res, next)
    {
        console.log("System validator")
        next()
    },

    validateSellerRole(req, res, next)
    {
        next()
    },
}

export default ValidatorService