import createError from "http-errors";
import ProductService from "../services/product.service.js";
import fs from "fs";
import path from "path";
import xlsx from "xlsx";
import { dirname } from "path";
import { fileURLToPath } from "url";
import cloudinary from "cloudinary";
import FileService from "../services/file.service.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const __dirname = dirname(fileURLToPath(import.meta.url));

const model = "product";
const Model = "Product";

const ProductController = {
  getAll: async (req, res, next) => {
    console.log("inside GetALL");
    try {
      const filter = req.query;
      let list = await ProductService.getAll(filter, "");
      if (!list) {
        return next(createError.BadRequest(Model + " list not found"));
      }
      list = list.map((product) => {
        product.profit = product.finalPrice - product.platformFee;
        return product;
      });
      res.json({
        message: "Get " + model + " list successfully",
        status: 200,
        data: list,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },

  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const object = await ProductService.getById(id);
      if (!object) {
        return next(createError.BadRequest(Model + " not found"));
      }
      object.profit = object.finalPrice - object.platformFee;
      res.json({
        message: "Get" + model + "successfully",
        status: 200,
        data: object,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },

  create: async (req, res, next) => {
    console.log("inside create");
    try {
      const data = req.body;
      // if (!req.files || req.files.length === 0) {
      //   console.log("no file uploaded");
      // }

      // const imageUrls = req.files.map((file) => file.path);
      // data.images = imageUrls;
      // console.log(data);
      const object = await ProductService.create(data);
      if (!object) {
        return next(createError.BadRequest("Bad request!"));
      }
      res.json({
        message: "Create" + model + "successfully",
        status: 200,
        data: object,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },
  update: async (req, res, next) => {
    try {
      const data = req.body;
      const { id } = req.params;
      const object = await ProductService.update(id, data);
      if (!object) {
        return next(createError.BadRequest(Model + " not found"));
      }
      res.json({
        message: "Update" + model + "successfully",
        status: 200,
        data: object,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },

  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const object = await ProductService.delete(id);
      if (!object) {
        return next(createError.BadRequest(Model + " not found"));
      }
      res.json({
        message: "Delete" + model + "successfully",
        status: 200,
        data: object,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },
  getListByIds: async (req, res, next) => {
    try {
      const { ids } = req.body;

      const productList = await ProductService.getListByIds(ids);
      if (!productList) {
        return next(createError.BadRequest("Products not found"));
      }
      res.json({
        message: "Get list of products successfully",
        status: 200,
        data: productList,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },
  getTopSelling: async (req, res, next) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 20;
      const topSellingProducts = await ProductService.getTopSelling(limit);
      res.json({
        message: "Get top selling products successfully",
        status: 200,
        data: topSellingProducts,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },
  getFilteredProducts: async (req, res, next) => {
    try {
      const filterOptions = {
        _id: req.body._id || "",
        keyword: req.body.keyword || "",
        shopId: req.body.shopId || "",
        minPrice: parseFloat(req.body.minPrice) || 0,
        maxPrice: parseFloat(req.body.maxPrice) || Number.MAX_VALUE,
        // category: req.body.category ? req.body.category.split(",") : [],
        // subCategory: req.body.subCategory
        //   ? req.body.subCategory.split(",")
        //   : [],
        // subCategoryTypes: req.body.subCategoryTypes
        //   ? req.body.subCategoryTypes.split(",")
        //   : [],
        category: req.body.category || [],
        subCategory: req.body.subCategory || [],
        subCategoryTypes: req.body.subCategoryTypes || [],
        avgRating: req.body.avgRating || null,
        sortBy: req.body.sortBy || "",
        index: parseInt(req.body.index) || 1,
        amount: parseInt(req.body.amount) || 20, // Default amount per page is 20
        brand: req.body.brand || "",
        status: req.body.status || "",
      };
      console.log(req.body);
      if (filterOptions.index < 1) filterOptions.index = 1;
      const { filteredProducts, total } =
        await ProductService.getFilteredProducts(filterOptions);
      const totalPages = Math.ceil(total / filterOptions.amount);
      // console.log(filteredProducts.length ,total, totalPages)
      res.json({
        message: "Get filter " + model + " list successfully",
        status: 200,
        data: filteredProducts,
        total: total,
        totalPages: totalPages,
      });
    } catch (error) {
      console.log(error);
      next(createError.InternalServerError(error.message));
    }
  },
  relatedProduct: async (req, res, next) => {
    try {
      const { id } = req.params;
      const object = await ProductService.getById(id);
      if (!object) {
        return next(createError.BadRequest(Model + " not found"));
      }
      const words = object.name.trim().split(/\s+/);
      console.log(words);
      //const firstword = object.name.split(" ")[0];
      let list = await ProductService.searchProductsByName(words[0]);
      list = list.filter((product) => product._id.toString() !== id);
      let index = 1;
      while (list.length > 10 && index < words.length) {
        let temp = list;
        let keyword = words[index];
        list = list.filter((product) => {
          // console.log(product.name);
          product.name.toLowerCase().includes(keyword.toLowerCase());
        });
        if (list.length == 0) {
          list = temp;
          break;
        }
        index++;
      }

      res.json({
        message: "Get related " + model + "successfully",
        status: 200,
        data: list,
      });
    } catch (error) {
      console.log(error);
      next(createError.InternalServerError(error.message));
    }
  },
  searchProductsByKeyword: async (req, res, next) => {
    try {
      const filterOptions = {
        keyword: req.query.keyword || " ",
        quantity: req.query.quantity,
        sortBy: req.query.sortBy || "",
        sortOrder: req.query.sortOrder || "",
      };
      filterOptions.quantity = parseInt(filterOptions.quantity, 10) || 8;
      if (
        !Number.isInteger(filterOptions.quantity) ||
        filterOptions.quantity <= 0
      ) {
        filterOptions.quantity = 8;
      }

      const validSortByOptions = ["avgRating", "soldQuantity"];
      if (
        filterOptions.sortBy &&
        !validSortByOptions.includes(filterOptions.sortBy)
      ) {
        return next(createError.BadRequest("Invalid sortBy option"));
      }

      console.log(filterOptions);
      const filteredProducts = await ProductService.searchProductsByKeyword(
        filterOptions
      );
      res.json({
        message: "Search " + model + " by keyword successfully",
        status: 200,
        data: filteredProducts,
      });
    } catch (error) {
      next(createError.InternalServerError(error.message));
    }
  },

  importProducts: async (req, res, next) => {
    console.log("insert batch");
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
    const filename = req.file.filename;
    const fn = filename.split("-")[1];
    console.log("filename", fn);
    const currentDate = Date.now();
    const filePath = path.join(__dirname, "../uploads", req.file.filename);
    let cloudinaryUrl = "";
    try {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[1];
      console.log("sheetName", sheetName);
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);
      console.log("data", data);
      const shopId = req.body.shopId;
      const result = await cloudinary.v2.uploader.upload(filePath, {
        folder: "Products",
        resource_type: "auto",
        format: "xlsx",
      });
      console.log("Cloudinary upload result:", result);
      cloudinaryUrl = result.secure_url;

      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Error while deleting file: ${filePath}`, err);
          // return next(
          //   createError.InternalServerError(
          //     "Failed to delete the file from the server"
          //   )
          // );
        }
        //console.log(`Successfully deleted file: ${filePath}`);
      });
      const products = await ProductService.importProducts(data, shopId);
      const fileData = {
        name: fn,
        url: cloudinaryUrl,
        shop: shopId,
        products: products,
        status: "SUCCESS",
      };
      const file = await FileService.create(fileData);
      console.log(file);

      res.json({
        message: "Create " + data.length + " products " + "successfully",
        status: 200,
        data: file,
      });
    } catch (error) {
      console.log(error);
      const shopId = req.body.shopId;
      const fileDataError = {
        name: fn,
        url: cloudinaryUrl,
        shop: shopId,
        products: [],
        status: "FALURE",
      };
      const result = await FileService.create(fileDataError);
      res.json({
        message: "Create products failed",
        status: 200,
        error: error.message,
        data: fileDataError,
      });
    }
  },

  async getFlashSalesProducts(req, res, next)
  {
    try
    {
      const flashSalesProducts = await ProductService.getAllFlashSalesProducts(undefined)
      if(flashSalesProducts == null)
      {
        return next(createError.BadRequest("Cannot get flash sales products"))
      }

      return res.json({
        message: "Get flash sales products successfully",
        data: flashSalesProducts
      })

    }
    catch(error)
    {
      console.log(error)
      return next(createError.InternalServerError(error.message))
    }
  },

};

export default ProductController;
