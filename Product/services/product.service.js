import { Product } from "../models/product.model.js";
import Category from "../models/category.model.js";
import SubCategory from "../models/subCategory.model.js";
import SubCategoryType from "../models/subCategoryType.model.js";

const ProductService = {
  async getAll(filter, projection) {
    return await Product.find(filter).select(projection);
  },
  // async getAll() {
  //   return await AuthorizeRequest.find();
  // },

  async getById(id) {
    const rawProductInfo = await Product.findById(id);
    return rawProductInfo;
  },

  async create(objectData) {
    const newObject = new Product(objectData);
    return await newObject.save();
  },

  async createMany(objects) {
    return await Product.insertMany(objects);
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
          $sort: { soldQuantity: -1 }, // Sắp xếp các sản phẩm theo soldQuantity giảm dần
        },
        {
          $limit: limit, // Giới hạn kết quả chỉ lấy 20 sản phẩm đầu tiên
        },
      ]);

      return topSellingProducts;
    } catch (error) {
      throw new Error("Error while fetching top selling products");
    }
  },
  getFilteredProducts: async (filterOptions) => {
    const {
      keyword,
      shopId,
      minPrice,
      maxPrice,
      category,
      subCategory,
      subCategoryTypes,
      avgRating,
      sortBy,
      index,
      amount,
      brand,
      status,
    } = filterOptions;
    const query = {};
    if (typeof minPrice !== "number" || typeof maxPrice !== "number") {
      throw new Error(
        "Invalid price values. Please provide valid numbers for minPrice and maxPrice."
      );
    }
    // Apply filters
    if (keyword) query.$text = { $search: keyword };
    if (shopId) query.shop = shopId;
    if (minPrice !== 0 || maxPrice !== Number.MAX_VALUE)
      query.finalPrice = {
        $gte: minPrice, // Greater than or equal to minPrice
        $lte: maxPrice, // Less than or equal to maxPrice
      };

    if (category.length > 0) query.category = { $in: category };
    if (subCategory.length > 0) query.subCategory = { $in: subCategory };
    if (subCategoryTypes.length > 0)
      query.subCategoryTypes = { $in: subCategoryTypes };
    if (avgRating !== null) {
      query.avgRating = { $gte: avgRating - 1, $lte: avgRating };
    }
    if (brand !== "") query.brand = brand;
    if (status !== "") query.status = status;
    console.log(query);

    const total = await Product.countDocuments(query);
    // Sort products
    let sortOption = {};
    switch (sortBy) {
      case "ascending price":
        sortOption = { finalPrice: 1 };
        break;
      case "descending price":
        sortOption = { finalPrice: -1 };
        break;
      case "top sale":
        sortOption = { soldQuantity: -1 };
        break;
      case "highest rating":
        sortOption = { avgRating: -1 };
        break;
      case "latest":
        sortOption = { createdAt: -1 };
        break;
      default:
        break;
    }
    //console.log(sortOption)
    console.log(index, amount);
    const filteredProducts = await Product.find(query)
      .sort(sortOption)
      .skip((index - 1) * amount)
      .limit(amount);
    //console.log(filteredProducts)
    return { filteredProducts, total };
  },
  async searchProductsByKeyword(keyword) {
    const query = { $text: { $search: keyword } };
    const filteredProducts = await Product.find(query);
    return filteredProducts;
  },

  async searchProductsByKeyword(keyword) {
    if (!keyword || keyword === "") {
      throw new Error("Keyword is required for searching");
    }

    const query = {
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } }
      ]
    };
    
    const categories = await Category.find({ name: { $regex: keyword, $options: "i" } });
    const subCategories = await SubCategory.find({ name: { $regex: keyword, $options: "i" } });
    const subCategoryTypes = await SubCategoryType.find({ name: { $regex: keyword, $options: "i" } });

    const categoryIds = categories.map(cat => cat._id);
    const subCategoryIds = subCategories.map(subCat => subCat._id);
    const subCategoryTypeIds = subCategoryTypes.map(subCatType => subCatType._id);

    if (categoryIds.length > 0) query.$or.push({ category: { $in: categoryIds } });
    if (subCategoryIds.length > 0) query.$or.push({ subCategory: { $in: subCategoryIds } });
    if (subCategoryTypeIds.length > 0) query.$or.push({ subCategoryType: { $in: subCategoryTypeIds } });

    console.log('Query:', JSON.stringify(query, null, 2));

    const filteredProducts = await Product.find(query)
                                        .populate('category')
                                        .populate('subCategory')
                                        .populate('subCategoryType');

    return filteredProducts;
  },

  async importProducts(data, shopId) {
    console.log(data[0]['Hình ảnh   *'].split(',')// Lọc bỏ các giá trị không phải là chuỗi
    .map(url => url.trim()))

    const products = data.map(item => ({
      name: item['Tên sản phẩm *'],
      description: item['Mô tả   *'],
      originalPrice: item['Giá ban đầu  *'],
      finalPrice: item['Giá sau khi giảm  *'],
      category: null,
      subCategory: null,
      subCategoryType: null,
      shop: shopId,
      platformFee: 10000,
      status: item['Trạng thái   *'],
      images: item['Hình ảnh   *'].split(',').map(url => url.trim()),
      avgRating: 0,
      soldQuantity: 0,
      brand: item['Thương hiệu   *'],
      isFlashSale: false,
      inventoryAmount: item['Số lượng hàng trong kho   *'],
      profit: 0,
      attribute: {
        colors: item['Màu sắc '].split(',').map(color => {
          const [label, value, link] = color.replace('[', '').replace(']', '').split(',');
          return {
            link: link.trim(),
            color: {
              label: label.trim(),
              value: value.trim(),
            },
          };
        }),
        size: item['Kích cỡ'].split(',').map(size => size.trim()),
        material: item['Chất liệu '].trim(),
        warranty: item['Bảo hành'].trim(),
        manufacturingPlace: '',
      },
    }));
    return products
  },
};

export default ProductService;
