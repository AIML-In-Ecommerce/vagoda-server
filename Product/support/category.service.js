
const PORT = process.env.CATEGORY_PORT
const BASE_PATH = process.env.BASE_PATH
const publicAPIURL = `${BASE_PATH}:${PORT}`

const CategoryService = 
{
    async getCategoryById(id)
    {
        const url = publicAPIURL + "/"
    }
}