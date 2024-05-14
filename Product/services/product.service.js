import { Product } from "../models/product.model.js";

const ProductService = {
  async getAll(filter, projection) {
    return await Product.find(filter).select(projection)
  },
  // async getAll() {
  //   return await AuthorizeRequest.find();
  // },

  async getById(id) {
    const rawProductInfo = await Product.findById(id);
    return rawProductInfo
  },

  async create(objectData) {
    const newObject = new Product(objectData);
    return await newObject.save();
  },

  async update(id, updateData) {
    return await Product.findByIdAndUpdate(id, updateData, { new: true });
  },

  async delete(id) {
    return await Product.findByIdAndDelete(id);
  },

  async getListByIds(ids) {
    const rawProductList = await Product.find({ _id: { $in: ids } });
  
    return rawProductList;
  },

  async getTopSelling(limit) {
    try {
      const topSellingProducts = await Product.aggregate([
        {
          $sort: { soldQuantity: -1 } // Sắp xếp các sản phẩm theo soldQuantity giảm dần
        },
        {
          $limit: limit // Giới hạn kết quả chỉ lấy 20 sản phẩm đầu tiên
        }
      ]);

      return topSellingProducts;
    } catch (error) {
      throw new Error("Error while fetching top selling products");
    }
  },
  getFilteredProducts: async (filterOptions) => {
    const { keyword, shopId, price, category, subCategory, subCategoryTypes, rating, sortBy, index, amount } = filterOptions;
    const query = {};
  
    // Apply filters
    if (keyword) query.$text = { $search: keyword };
    if (shopId) query.shop = shopId;
    if (price.length === 2) query.originalPrice = { $gte: price[0], $lte: price[1] };
    if (category.length > 0) query.category = { $in: category };
    if (subCategory.length > 0) query.subCategory = { $in: subCategory };
    if (subCategoryTypes.length > 0) query.subCategoryTypes = { $in: subCategoryTypes };
    if (rating.length === 2) query.avgRating = { $gte: rating[0], $lte: rating[1] };
    console.log(query);
    const total = await Product.countDocuments(query);
    // Sort products
    let sortOption = {};
    switch (sortBy) {
      case 'ascending price':
        sortOption = { originalPrice: 1 };
        break;
      case 'descending price':
        sortOption = { originalPrice: -1 };
        break;
      case 'top sale':
        sortOption = { soldQuantity: -1 };
        break;
      case 'highest rating':
        sortOption = { avgRating: -1 };
        break;
      case 'latest':
        sortOption = { createdAt: -1 };
        break;
      default:
        break;
    }
    //console.log(sortOption)
    const filteredProducts = await Product.find(query)
      .sort(sortOption)
      .skip(index * amount)
      .limit(amount);
    console.log(filteredProducts)
    return {filteredProducts, total};
  },
  
};

export default ProductService
