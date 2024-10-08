import { Product } from "../models/product.model.js";
import Category from "../models/category.model.js";
import SubCategory from "../models/subCategory.model.js";
import SubCategoryType from "../models/subCategoryType.model.js";
import axios from "axios";

const removeDiacritics = (str) => {
  const normalizeStr = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return normalizeStr.toLowerCase().replace(/\s+/g, "");
};

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
      _id,
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
    if (_id !== "") query._id = _id;
    // if (keyword) query.name = { $regex: keyword, $options: "i" };
    if (keyword) {
      const regex = { $regex: keyword, $options: "i" };
      console.log(regex);
      const categories = await Category.find({ name: regex }).select("_id");
      const subCategories = await SubCategory.find({ name: regex }).select(
        "_id"
      );
      const subCategoryTypes = await SubCategoryType.find({
        name: regex,
      }).select("_id");
      query.$or = [
        { name: regex },
        { description: regex },
        { category: { $in: categories } },
        { subCategory: { $in: subCategories } },
        { subCategoryType: { $in: subCategoryTypes } },
      ];
    }
    if (shopId !== "") query.shop = shopId;

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
    console.log(total);
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
      .limit(amount)
      .exec();
    //console.log(filteredProducts)
    return { filteredProducts, total };
  },
  async searchProductsByName(keyword) {
    const query = { $text: { $search: keyword } };
    const filteredProducts = await Product.find(query);
    return filteredProducts;
  },

  async searchProductsByKeyword(filterOptions) {
    console.log("ccccccccccccccccc");
    const { keyword, quantity, sortBy, sortOrder } = filterOptions;
    // if (!keyword || keyword === "") {
    //   throw new Error("Keyword is required for searching");
    // }

    const sortOptions = {};
    if (sortBy) {
      sortOptions[sortBy] = sortOrder.toLowerCase() === "asc" ? 1 : -1;
    }

    const query = {};
    const products = await Product.find(query)
      .populate("category")
      .populate("subCategory")
      .populate("subCategoryType")
      .populate("shop")
      .select(
        "_id name attribute originalPrice finalPrice shop brand soldQuantity avgRating images"
      )
      .sort(sortOptions);
    // .limit(quantity);

    console.log(products.length);
    //replate "-" = " "
    const kw = keyword.replace("-", " ");
    const normalizedKeyword = await removeDiacritics(kw);
    console.log("Normalized keyword:", normalizedKeyword);

    const filteredProducts = products.filter((product) => {
      const productName = product.name;
      const normalizedProductName = removeDiacritics(
        productName.replace("-", " ")
      );
      console.log("Normalized product name:", normalizedProductName);
      const normalizedProductDescription = removeDiacritics(
        product.description || ""
      );
      const categoryMatch = product.category
        ? removeDiacritics(product.category.name).includes(normalizedKeyword)
        : false;
      const subCategoryMatch = product.subCategory
        ? removeDiacritics(product.subCategory.name).includes(normalizedKeyword)
        : false;
      const subCategoryTypeMatch = product.subCategoryType
        ? removeDiacritics(product.subCategoryType.name).includes(
            normalizedKeyword
          )
        : false;

      return (
        normalizedProductName.includes(normalizedKeyword) ||
        normalizedProductDescription.includes(normalizedKeyword) ||
        categoryMatch ||
        subCategoryMatch ||
        subCategoryTypeMatch
      );
    });
    console.log("Filtered products:", filteredProducts.length);
    const topProducts = filteredProducts.slice(0, quantity);

    // console.log(
    //   "Filtered products:",
    //   JSON.stringify(filteredProducts, null, 2)
    // );

    const formattedProducts = topProducts.map((product) => ({
      _id: product._id,
      name: product.name,
      description: product.description,
      material: product.attribute?.material || "",
      originalPrice: product.originalPrice,
      finalPrice: product.finalPrice,
      shop: product.shop.name,
      brand: product.brand,
      soldQuantity: product.soldQuantity,
      avgRating: product.avgRating,
      images: product.images,
    }));

    return formattedProducts;
  },

  async importProducts(data, shopId) {
    console.log(data[0]["Hình ảnh   *"].split(",").map((url) => url.trim()));
    const response = await axios.get("http://14.225.218.109:3005/categories");
    const ctgs = response.data.data;

    // let ctg = item["Danh mục   *"].split("/"); // Nữ/Áo nữ/Áo thun
    // const category = categories.find((cat) => cat.name === ctg[0]);
    // const subCategories = category.subCategories;
    // const subCategory = subCategories.find((subCat) => subCat.name === ctg[1]);
    // const subCategoryTypes = subCategory.subCategoryTypes;
    // const subCategoryType = subCategoryTypes.find((sct) => sct.name === ctg[2]);

    // category.subCategory = null;
    // subCategory.subCategoryTypes = null;

    const products = data.map((item) => {
      console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
      console.log(item["Danh mục   *"]);
      let ctg = item["Danh mục   *"].split("/"); // Nữ/Áo nữ/Áo thun
      console.log(ctg);
      let categories = JSON.parse(JSON.stringify(ctgs));
      let category = categories.find((cat) => cat.name === ctg[0]);
      let subCategories = category.subCategories;
      console.log("subctgs ", subCategories);
      let subCategory = subCategories.find((subCat) => subCat.name === ctg[1]);
      console.log("subcategory ", subCategory);
      let subCategoryTypes = subCategory.subCategories;
      let subCategoryType = subCategoryTypes.find((sct) => sct.name === ctg[2]);

      category.subCategories = null;
      subCategory.subCategories = null;

      return {
        name: item["Tên sản phẩm *"],
        description: item["Mô tả   *"],
        originalPrice: item["Giá ban đầu  *"],
        finalPrice: item["Giá sau khi giảm  *"],
        category: category,
        subCategory: subCategory,
        subCategoryType: subCategoryType,
        shop: shopId,
        platformFee: 10000,
        status: item["Trạng thái   *"],
        images: item["Hình ảnh   *"].split(",").map((url) => url.trim()),
        avgRating: 0,
        soldQuantity: 0,
        brand: item["Thương hiệu   *"],
        isFlashSale: false,
        inventoryAmount: item["Số lượng hàng trong kho   *"],
        profit: 0,
        attribute: {
          colors: item["Màu sắc "].split(",").map((color) => {
            console.log("Color1:", color);
            const [label, value, link] = color
              .replace("[", "")
              .replace("]", "")
              .split(";");
            console.log("Color:", label, value, link);
            return {
              link: link.trim(),
              color: {
                label: label.trim(),
                value: value.trim(),
              },
            };
          }),
          size: item["Kích cỡ"].split(",").map((size) => size.trim()),
          material: item["Chất liệu "].trim(),
          warranty: item["Bảo hành"].trim(),
          manufacturingPlace: "",
        },
      };
    });
    return await Product.insertMany(products);
  },

  async increaseSoldAmountOfAProduct(productId, quantity) {
    const rawProductInfo = await Product.findOne({ _id: productId });
    if (rawProductInfo == null) {
      return null;
    }

    const absQuantity = Math.abs(quantity);

    const newSoldAmount = rawProductInfo.soldQuantity + absQuantity;
    const newInventory = rawProductInfo.inventoryAmount - absQuantity;

    rawProductInfo.soldQuantity = newSoldAmount;
    rawProductInfo.inventoryAmount = newInventory;
    return (await rawProductInfo.save())._id.toString();
  },

  async decreaseSoldAmountOfAProduct(productId, quantity) {
    const rawProductInfo = await Product.findOne({ _id: productId });
    if (rawProductInfo == null) {
      return null;
    }

    const absQuantity = Math.abs(quantity);
    const newSoldAmount = rawProductInfo.soldQuantity - absQuantity;
    const newInventory = rawProductInfo.inventoryAmount + absQuantity;

    rawProductInfo.soldQuantity = newSoldAmount;
    rawProductInfo.inventoryAmount = newInventory;
    return (await rawProductInfo.save())._id.toString();
  },

  async increaseSoldAmountOfManyProduct(updateInfos) {
    if (updateInfos == undefined) {
      return null;
    }

    const updatedProductIdList = [];

    updateInfos.forEach(async (record) => {
      const updatedProductId = await this.increaseSoldAmountOfAProduct(
        record.product,
        record.quantity
      );
      if (updatedProductId != null) {
        updatedProductIdList.push(updatedProductId);
      }
    });

    return updatedProductIdList;
  },

  async decreaseSoldAmountOfManyProduct(updateInfos) {
    if (updateInfos == undefined) {
      return null;
    }

    const updatedProductIdList = [];

    updateInfos.forEach(async (record) => {
      const updatedProductId = await this.decreaseSoldAmountOfAProduct(
        record.product,
        record.quantity
      );
      if (updatedProductId != null) {
        updatedProductIdList.push(updatedProductId);
      }
    });

    return updatedProductIdList;
  },

  async getAllFlashSalesProducts(amount) {
    const flashSalesProducts = await Product.find({
      $expr: {
        $lt: ["$finalPrice", "$originalPrice"],
      },
    });
    if (flashSalesProducts == null) {
      return null;
    }

    return flashSalesProducts;
  },

  async getRelatedProductsBySubCategory(subCategories) {
    if (subCategories.length === 0) {
      const topSellingProducts = await this.getTopSelling(4);
      return topSellingProducts;
    }
    const relatedProducts = [];

    for (const subCategoryId of subCategories) {
      const products = await Product.find({ subCategory: subCategoryId })
        .sort({ soldQuantity: -1 })
        .limit(4)
        .select("-description");

      relatedProducts.push(...products);
    }

    return relatedProducts;
  },
};

export default ProductService;
