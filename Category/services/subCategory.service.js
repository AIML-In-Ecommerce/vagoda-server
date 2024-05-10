import Category from "../models/category.model.js";
import SubCategory from "../models/subCategory.model.js";
import SubCategoryType from "../models/subCategoryType.model.js";

const SubCategoryService = {
  async getAll(filter, projection) {
    return await SubCategory.find(filter).select(projection);
  },
  // async getAll() {
  //   return await AuthorizeRequest.find();
  // },
  async getById(id) {
    return await SubCategory.findById(id);
  },

  async create(objectData) {
    const newObject = new SubCategory(objectData);
    return await newObject.save();
  },

  async update(id, updateData) {
    return await SubCategory.findByIdAndUpdate(id, updateData, { new: true });
  },

  async delete(id) {
    return await SubCategory.findByIdAndDelete(id);
  },
  async addData1(filter, projection) {
    //await Category.deleteMany({}); // Xóa tất cả các Category
    //await SubCategory.deleteMany({}); // Xóa tất cả các SubCategory
    //await SubCategoryType.deleteMany({});
    let sctData =  [
      { name: "Apple (Macbook)", SubCategory: "Thương hiệu" },
      { name: "Acer", SubCategory: "Thương hiệu" },
      { name: "ASUS", SubCategory: "Thương hiệu" },
      { name: "Dell", SubCategory: "Thương hiệu" },
      { name: "HP", SubCategory: "Thương hiệu" },
      { name: "Lenovo", SubCategory: "Thương hiệu" },
      { name: "LG", SubCategory: "Thương hiệu" },
      { name: "MSI", SubCategory: "Thương hiệu" },
      { name: "Gigabyte", SubCategory: "Thương hiệu" },
      { name: "Microsoft", SubCategory: "Thương hiệu" },
      { name: "RTX 30 Series", SubCategory: "Cấu hình" },
      { name: "RTX 40 Series", SubCategory: "Cấu hình" },
      { name: "Intel i3", SubCategory: "Cấu hình" },
      { name: "Intel i5", SubCategory: "Cấu hình" },
      { name: "Intel i7", SubCategory: "Cấu hình" },
      { name: "Intel i9", SubCategory: "Cấu hình" },
      { name: "Ryzen 3", SubCategory: "Cấu hình" },
      { name: "Ryzen 5", SubCategory: "Cấu hình" },
      { name: "Ryzen 7", SubCategory: "Cấu hình" },
      { name: "Dưới 13 inch", SubCategory: "Kích thước" },
      { name: "13-14 inch", SubCategory: "Kích thước" },
      { name: "15.6 inch", SubCategory: "Kích thước" },
      { name: "Trên 15.6 inch", SubCategory: "Kích thước" },
      { name: "Laptop Gaming", SubCategory: "Nhu cầu" },
      { name: "Laptop Văn Phòng", SubCategory: "Nhu cầu" },
      { name: "Đồ họa Studio", SubCategory: "Nhu cầu" },
      { name: "Work Station", SubCategory: "Nhu cầu" },
      { name: "Dưới 10 triệu", SubCategory: "Mức giá" },
      { name: "10 - 15 triệu", SubCategory: "Mức giá" },
      { name: "15 - 20 triệu", SubCategory: "Mức giá" },
      { name: "20 - 25 triệu", SubCategory: "Mức giá" },
      { name: "25 - 30 triệu", SubCategory: "Mức giá" },
      { name: "Trên 30 triệu", SubCategory: "Mức giá" }
    ];
    let newsc1;
    let newsc2;
    let newsc3;
    let newsc4;
    let newsc5;
  
    try {
      newsc1 = new SubCategory({
        name: "Thương hiệu",
      });
      newsc2 = new SubCategory({
        name: "Cấu hình",
      });
      newsc3 = new SubCategory({
        name: "Kích thước",
      });
      newsc4 = new SubCategory({
        name: "Nhu cầu",
      });
      newsc5 = new SubCategory({
        name: "Mức giá",
      });

      newsc1 = await newsc1.save();
      newsc2 = await newsc2.save();
      newsc3 = await newsc3.save();
      newsc4 = await newsc4.save();
      newsc5 = await newsc5.save();
  
      var mappedData = sctData.map(function(data) {
        if(data.SubCategory === "Thương hiệu"){
          return {
            "name": data.name,
            "subCategory": newsc1._id.toString()
          };
        }
        else if(data.SubCategory === "Cấu hình"){
          return {
            "name": data.name,
            "subCategory": newsc2._id.toString()
          };
        }
        else if(data.SubCategory === "Kích thước"){
          return {
            "name": data.name,
            "subCategory": newsc3._id.toString()
          };
        }
        else if(data.SubCategory === "Nhu cầu"){
          return {
            "name": data.name,
            "subCategory": newsc4._id.toString()
          };
        }
        else if(data.SubCategory === "Mức giá"){
          return {
            "name": data.name,
            "subCategory": newsc5._id.toString()
          };
        }
      });
  
      const result = await SubCategoryType.insertMany(mappedData);
      // Lấy mảng các ID đã được thêm
      const insertedIds = result.map(item => item._id.toString());
      console.log('Inserted IDs:', insertedIds);
      
  
      const category = new Category({
        name: "Laptop",
        subCategoryType: insertedIds
      });
      await category.save();
    } catch (error) {
      console.error('Error:', error.message);
    }
  },
  async addData2(filter, projection) {
    //await Category.deleteMany({}); 
    //await SubCategory.deleteMany({}); 
    //await SubCategoryType.deleteMany({});

    let sctData = [
        { name: "Bếp điện từ, bếp gas", SubCategory: "Thiết bị nhà bếp" },
        { name: "Bình đun siêu tốc", SubCategory: "Thiết bị nhà bếp" },
        { name: "Bình thủy điện", SubCategory: "Thiết bị nhà bếp" },
        { name: "Lò nướng", SubCategory: "Thiết bị nhà bếp" },
        { name: "Lò vi sóng", SubCategory: "Thiết bị nhà bếp" },
        { name: "Máy xay thực phẩm", SubCategory: "Thiết bị nhà bếp" },
        { name: "Máy ép trái cây", SubCategory: "Thiết bị nhà bếp" },
        { name: "Máy pha cà phê", SubCategory: "Thiết bị nhà bếp" },
        { name: "Máy rửa chén", SubCategory: "Thiết bị nhà bếp" },
        { name: "Nồi cơm điện", SubCategory: "Thiết bị nhà bếp" },
        { name: "Nồi áp suất", SubCategory: "Thiết bị nhà bếp" },
        { name: "Nồi chiên không dầu", SubCategory: "Thiết bị nhà bếp" },
        { name: "Nồi hấp điện", SubCategory: "Thiết bị nhà bếp" },
        { name: "Electrolux", SubCategory: "Máy giặt" },
        { name: "Sharp", SubCategory: "Máy giặt" },
        { name: "Samsung", SubCategory: "Máy giặt" },
        { name: "LG", SubCategory: "Máy giặt" },
        { name: "Panasonic", SubCategory: "Máy giặt" },
        { name: "Toshiba", SubCategory: "Máy giặt" },
        { name: "AQUA", SubCategory: "Máy giặt" },
        { name: "Casper", SubCategory: "Máy giặt" },
        { name: "Máy giặt cửa trước", SubCategory: "Máy giặt" },
        { name: "Máy giặt cửa trên", SubCategory: "Máy giặt" },
        { name: "Máy giặt Inverter", SubCategory: "Máy giặt" },
        { name: "Máy sấy quần áo", SubCategory: "Máy giặt" },
        { name: "LG", SubCategory: "Điều hòa - Máy lạnh" },
        { name: "Daikin", SubCategory: "Điều hòa - Máy lạnh" },
        { name: "Casper", SubCategory: "Điều hòa - Máy lạnh" },
        { name: "Panasonic", SubCategory: "Điều hòa - Máy lạnh" },
        { name: "Toshiba", SubCategory: "Điều hòa - Máy lạnh" },
        { name: "AQUA", SubCategory: "Điều hòa - Máy lạnh" },
        { name: "Gree", SubCategory: "Điều hòa - Máy lạnh" },
        { name: "Samsung", SubCategory: "Điều hòa - Máy lạnh" },
        { name: "Sharp", SubCategory: "Điều hòa - Máy lạnh" },
        { name: "Inverter", SubCategory: "Điều hòa - Máy lạnh" },
        { name: "Hitachi", SubCategory: "Điều hòa - Máy lạnh" },
        { name: "Asanzo", SubCategory: "Điều hòa - Máy lạnh" },
        { name: "LG", SubCategory: "Tủ lạnh" },
        { name: "Samsung", SubCategory: "Tủ lạnh" },
        { name: "AQUA", SubCategory: "Tủ lạnh" },
        { name: "Electrolux", SubCategory: "Tủ lạnh" },
        { name: "Casper", SubCategory: "Tủ lạnh" },
        { name: "Panasonic", SubCategory: "Tủ lạnh" },
        { name: "Sharp", SubCategory: "Tủ lạnh" },
        { name: "Toshiba", SubCategory: "Tủ lạnh" },
        { name: "Inverter", SubCategory: "Tủ lạnh" },
        { name: "Tủ lạnh mini", SubCategory: "Tủ lạnh" },
        { name: "Samsung", SubCategory: "TV" },
        { name: "LG", SubCategory: "TV" },
        { name: "Panasonic", SubCategory: "TV" },
        { name: "Máy lọc không khí", SubCategory: "Thiết bị gia đình" },
        { name: "Quạt điều hòa", SubCategory: "Thiết bị gia đình" },
        { name: "Máy hút bụi", SubCategory: "Thiết bị gia đình" },
        { name: "Máy sấy quần áo", SubCategory: "Thiết bị gia đình" },
        { name: "Máy lọc nước", SubCategory: "Thiết bị gia đình" },
    ];

    try {
        const newsc1 = await new SubCategory({ name: "Thiết bị nhà bếp" }).save();
        const newsc2 = await new SubCategory({ name: "Máy giặt" }).save();
        const newsc3 = await new SubCategory({ name: "Điều hòa - Máy lạnh" }).save();
        const newsc4 = await new SubCategory({ name: "Tủ lạnh" }).save();
        const newsc5 = await new SubCategory({ name: "TV" }).save();
        const newsc6 = await new SubCategory({ name: "Thiết bị gia đình" }).save();

        let mappedData = sctData.map(data => {
            if (data.SubCategory === "Thiết bị nhà bếp") {
                return { name: data.name, subCategory: newsc1._id };
            } else if (data.SubCategory === "Máy giặt") {
                return { name: data.name, subCategory: newsc2._id };
            } else if (data.SubCategory === "Điều hòa - Máy lạnh") {
                return { name: data.name, subCategory: newsc3._id };
            } else if (data.SubCategory === "Tủ lạnh") {
                return { name: data.name, subCategory: newsc4._id };
            } else if (data.SubCategory === "TV") {
                return { name: data.name, subCategory: newsc5._id };
            } else if (data.SubCategory === "Thiết bị gia đình") {
                return { name: data.name, subCategory: newsc6._id };
            }
        });

        mappedData = mappedData.filter(Boolean); // Lọc bỏ các phần tử không hợp lệ

        const result = await SubCategoryType.insertMany(mappedData);
        const insertedIds = result.map(item => item._id.toString());
        console.log('Inserted IDs:', insertedIds);

        const category = new Category({
            name: "Thiết bị gia dụng",
            subCategoryType: insertedIds
        });
        await category.save();
    } catch (error) {
        console.error('Error:', error.message);
    }
  },
  async addData3(filter, projection) {
    //await Category.deleteMany({}); // Xóa tất cả các Category
    //await SubCategory.deleteMany({}); // Xóa tất cả các SubCategory
    //await SubCategoryType.deleteMany({});

    let sctData = [
        { name: "Acer", SubCategory: "Thương hiệu" },
        { name: "AOC", SubCategory: "Thương hiệu" },
        { name: "ASUS", SubCategory: "Thương hiệu" },
        { name: "Dell", SubCategory: "Thương hiệu" },
        { name: "HP", SubCategory: "Thương hiệu" },
        { name: "Lenovo", SubCategory: "Thương hiệu" },
        { name: "LG", SubCategory: "Thương hiệu" },
        { name: "MSI", SubCategory: "Thương hiệu" },
        { name: "Viewsonic", SubCategory: "Thương hiệu" },
        { name: "Samsung", SubCategory: "Thương hiệu" },
        { name: "Philips", SubCategory: "Thương hiệu" },
        { name: "VSP", SubCategory: "Thương hiệu" },
        { name: "Full HD 1080p", SubCategory: "Độ phân giải" },
        { name: "2k 1440p", SubCategory: "Độ phân giải" },
        { name: "4k UHD", SubCategory: "Độ phân giải" },
        { name: "60Hz", SubCategory: "Tần số quét" },
        { name: "75Hz", SubCategory: "Tần số quét" },
        { name: "100Hz", SubCategory: "Tần số quét" },
        { name: "144Hz", SubCategory: "Tần số quét" },
        { name: "240Hz", SubCategory: "Tần số quét" },
        { name: "Dưới 19 inch", SubCategory: "Kích thước màn hình" },
        { name: "24 inch", SubCategory: "Kích thước màn hình" },
        { name: "27 inch", SubCategory: "Kích thước màn hình" },
        { name: "32 inch", SubCategory: "Kích thước màn hình" },
        { name: "Trên 32 inch", SubCategory: "Kích thước màn hình" },
        { name: "Màn hình Gaming", SubCategory: "Theo nhu cầu" },
        { name: "Màn hình thiết kế", SubCategory: "Theo nhu cầu" },
        { name: "Màn hình cong", SubCategory: "Theo nhu cầu" },
        { name: "Màn hình văn phòng", SubCategory: "Theo nhu cầu" }
    ];

    try {
        const newsc1 = await new SubCategory({ name: "Thương hiệu" }).save();
        const newsc2 = await new SubCategory({ name: "Độ phân giải" }).save();
        const newsc3 = await new SubCategory({ name: "Tần số quét" }).save();
        const newsc4 = await new SubCategory({ name: "Kích thước màn hình" }).save();
        const newsc5 = await new SubCategory({ name: "Theo nhu cầu" }).save();

        const mappedData = sctData.map(data => {
            switch (data.SubCategory) {
                case "Thương hiệu":
                    return { name: data.name, subCategory: newsc1._id.toString() };
                case "Độ phân giải":
                    return { name: data.name, subCategory: newsc2._id.toString() };
                case "Tần số quét":
                    return { name: data.name, subCategory: newsc3._id.toString() };
                case "Kích thước màn hình":
                    return { name: data.name, subCategory: newsc4._id.toString() };
                case "Theo nhu cầu":
                    return { name: data.name, subCategory: newsc5._id.toString() };
            }
        });

        const result = await SubCategoryType.insertMany(mappedData);
        const insertedIds = result.map(item => item._id.toString());
        console.log('Inserted IDs:', insertedIds);

        const category = new Category({
            name: "Màn hình máy tính",
            subCategoryType: insertedIds
        });
        await category.save();
    } catch (error) {
        console.error('Error:', error.message);
    }
  },
  async addData4(filter, projection) {
    let sctData = [
        { name: "SAMA", SubCategory: "Case - Thùng máy tính" },
        { name: "MIGMATEK", SubCategory: "Case - Thùng máy tính" },
        { name: "Golden Field", SubCategory: "Case - Thùng máy tính" },
        { name: "Deepcool", SubCategory: "Case - Thùng máy tính" },
        { name: "Cooler Master", SubCategory: "Case - Thùng máy tính" },
        { name: "Aerocool", SubCategory: "Case - Thùng máy tính" },
        { name: "ASUS", SubCategory: "Case - Thùng máy tính" },
        { name: "MSI", SubCategory: "Case - Thùng máy tính" },
        { name: "CORSAIR", SubCategory: "Case - Thùng máy tính" },
        { name: "ANTEC", SubCategory: "Case - Thùng máy tính" },
        { name: "Cougar", SubCategory: "Case - Thùng máy tính" },
        { name: "DELUXE", SubCategory: "Case - Thùng máy tính" },
        { name: "EROSI", SubCategory: "Case - Thùng máy tính" },
        { name: "GIGABYTE", SubCategory: "Case - Thùng máy tính" },
        { name: "MIK", SubCategory: "Case - Thùng máy tính" },
        { name: "SEGOTEP", SubCategory: "Case - Thùng máy tính" },
        { name: "NZXT", SubCategory: "Case - Thùng máy tính" },
        { name: "ASUS", SubCategory: "VGA - Card màn hình" },
        { name: "Colorful", SubCategory: "VGA - Card màn hình" },
        { name: "GALAx", SubCategory: "VGA - Card màn hình" },
        { name: "GIGABYTE", SubCategory: "VGA - Card màn hình" },
        { name: "MSI", SubCategory: "VGA - Card màn hình" },
        { name: "NVIDIA", SubCategory: "VGA - Card màn hình" },
        { name: "AMD", SubCategory: "VGA - Card màn hình" },
        { name: "VGA GTX", SubCategory: "VGA - Card màn hình" },
        { name: "Ổ cứng SSD", SubCategory: "Ổ cứng" },
        { name: "Ổ cứng HDD", SubCategory: "Ổ cứng" },
        { name: "Ổ cứng di động", SubCategory: "Ổ cứng" },
        { name: "WD", SubCategory: "Ổ cứng" },
        { name: "Seagate", SubCategory: "Ổ cứng" },
        { name: "Kingston", SubCategory: "Ổ cứng" },
        { name: "Crucial", SubCategory: "Ổ cứng" },
        { name: "Samsung", SubCategory: "Ổ cứng" },
        { name: "Kingmax", SubCategory: "Ổ cứng" },
        { name: "Transcend", SubCategory: "Ổ cứng" },
        { name: "Sandisk", SubCategory: "Ổ cứng" },
        { name: "Adata", SubCategory: "Ổ cứng" },
        { name: "Colorful", SubCategory: "Ổ cứng" },
        { name: "GIGABYTE", SubCategory: "Ổ cứng" },
        { name: "INTEL", SubCategory: "Ổ cứng" },
        { name: "Intel Gen 14", SubCategory: "CPU - Bộ vi xử lý" },
        { name: "Intel Core i3", SubCategory: "CPU - Bộ vi xử lý" },
        { name: "Intel Core i5", SubCategory: "CPU - Bộ vi xử lý" },
        { name: "Intel Core i7", SubCategory: "CPU - Bộ vi xử lý" },
        { name: "Intel Core i9", SubCategory: "CPU - Bộ vi xử lý" },
        { name: "Athlon", SubCategory: "CPU - Bộ vi xử lý" },
        { name: "Xeon", SubCategory: "CPU - Bộ vi xử lý" },
        { name: "Pentium", SubCategory: "CPU - Bộ vi xử lý" },
        { name: "AMD Ryzen 3", SubCategory: "CPU - Bộ vi xử lý" },
        { name: "AMD Ryzen 5", SubCategory: "CPU - Bộ vi xử lý" },
        { name: "AMD Ryzen 7", SubCategory: "CPU - Bộ vi xử lý" },
        { name: "AMD Ryzen 9", SubCategory: "CPU - Bộ vi xử lý" },
        { name: "Threadripper", SubCategory: "CPU - Bộ vi xử lý" },
        { name: "Tản nhiệt khí", SubCategory: "Tản nhiệt PC" },
        { name: "Tản nhiệt nước", SubCategory: "Tản nhiệt PC" },
        { name: "ASUS", SubCategory: "Mainboard" },
        { name: "ASRock", SubCategory: "Mainboard" },
        { name: "GIGABYTE", SubCategory: "Mainboard" },
        { name: "MSI", SubCategory: "Mainboard" },
        { name: "Intel", SubCategory: "Mainboard" },
        { name: "Cooler Master", SubCategory: "PSU - Nguồn máy tính" },
        { name: "Golden Field", SubCategory: "PSU - Nguồn máy tính" },
        { name: "CORSAIR", SubCategory: "PSU - Nguồn máy tính" },
        { name: "GIGABYTE", SubCategory: "PSU - Nguồn máy tính" },
        { name: "ASUS", SubCategory: "PSU - Nguồn máy tính" },
        { name: "RAM DDR5", SubCategory: "RAM PC" },
        { name: "RAM DDR4", SubCategory: "RAM PC" },
        { name: "RAM 8GB", SubCategory: "RAM PC" },
        { name: "RAM 16GB", SubCategory: "RAM PC" },
        { name: "RAM 32GB", SubCategory: "RAM PC" },
        { name: "Kingston", SubCategory: "RAM PC" },
        { name: "GIGABYTE", SubCategory: "RAM PC" }
    ];

    try {
        const newsc1 = await new SubCategory({ name: "Case - Thùng máy tính" }).save();
        const newsc2 = await new SubCategory({ name: "VGA - Card màn hình" }).save();
        const newsc3 = await new SubCategory({ name: "Ổ cứng" }).save();
        const newsc4 = await new SubCategory({ name: "CPU - Bộ vi xử lý" }).save();
        const newsc5 = await new SubCategory({ name: "Tản nhiệt PC" }).save();
        const newsc6 = await new SubCategory({ name: "Mainboard" }).save();
        const newsc7 = await new SubCategory({ name: "PSU - Nguồn máy tính" }).save();
        const newsc8 = await new SubCategory({ name: "RAM PC" }).save();

        const mappedData = sctData.map(data => {
            switch (data.SubCategory) {
                case "Case - Thùng máy tính":
                    return { name: data.name, subCategory: newsc1._id.toString() };
                case "VGA - Card màn hình":
                    return { name: data.name, subCategory: newsc2._id.toString() };
                case "Ổ cứng":
                    return { name: data.name, subCategory: newsc3._id.toString() };
                case "CPU - Bộ vi xử lý":
                    return { name: data.name, subCategory: newsc4._id.toString() };
                case "Tản nhiệt PC":
                    return { name: data.name, subCategory: newsc5._id.toString() };
                case "Mainboard":
                    return { name: data.name, subCategory: newsc6._id.toString() };
                case "PSU - Nguồn máy tính":
                    return { name: data.name, subCategory: newsc7._id.toString() };
                case "RAM PC":
                    return { name: data.name, subCategory: newsc8._id.toString() };
            }
        });

        const result = await SubCategoryType.insertMany(mappedData);
        const insertedIds = result.map(item => item._id.toString());
        console.log('Inserted IDs:', insertedIds);

        const category = new Category({
            name: "Linh kiện máy tính",
            subCategoryType: insertedIds
        });
        await category.save();
    } catch (error) {
        console.error('Error:', error.message);
    }
  },
  async addData5(filter, projection) {
    let sctData = [
        { name: "ASUS", SubCategory: "Chuột máy tính" },
        { name: "Logitech", SubCategory: "Chuột máy tính" },
        { name: "Corsair", SubCategory: "Chuột máy tính" },
        { name: "Razer", SubCategory: "Chuột máy tính" },
        { name: "SteelSeries", SubCategory: "Chuột máy tính" },
        { name: "HyperX", SubCategory: "Chuột máy tính" },
        { name: "AKKO", SubCategory: "Chuột máy tính" },
        { name: "Fuhlen", SubCategory: "Chuột máy tính" },
        { name: "MSI", SubCategory: "Chuột máy tính" },
        { name: "Dell", SubCategory: "Chuột máy tính" },
        { name: "Newmen", SubCategory: "Chuột máy tính" },
        { name: "DareU", SubCategory: "Chuột máy tính" },
        { name: "Microsoft", SubCategory: "Chuột máy tính" },
        { name: "E-dra", SubCategory: "Chuột máy tính" },
        { name: "Repoo", SubCategory: "Chuột máy tính" },
        { name: "Logitech", SubCategory: "Bàn phím" },
        { name: "Rapoo", SubCategory: "Bàn phím" },
        { name: "Microsoft", SubCategory: "Bàn phím" },
        { name: "ASUS", SubCategory: "Bàn phím" },
        { name: "Razer", SubCategory: "Bàn phím" },
        { name: "Corsair", SubCategory: "Bàn phím" },
        { name: "HyperX", SubCategory: "Bàn phím" },
        { name: "Newmen", SubCategory: "Bàn phím" },
        { name: "DareU", SubCategory: "Bàn phím" },
        { name: "AKKO", SubCategory: "Bàn phím" },
        { name: "Fuhlen", SubCategory: "Bàn phím" },
        { name: "Dell", SubCategory: "Bàn phím" },
        { name: "SteelSeries", SubCategory: "Bàn phím" },
        { name: "E-dra", SubCategory: "Bàn phím" },
        { name: "MSI", SubCategory: "Bàn phím" },
    ];

    let newsc1;
    let newsc2;

    try {
        newsc1 = new SubCategory({
            name: "Chuột máy tính",
        });

        newsc2 = new SubCategory({
            name: "Bàn phím",
        });

        newsc1 = await newsc1.save();
        newsc2 = await newsc2.save();

        var mappedData = sctData.map(function(data) {
            if (data.SubCategory === "Chuột máy tính") {
                return {
                    "name": data.name,
                    "subCategory": newsc1._id.toString()
                };
            } else if (data.SubCategory === "Bàn phím") {
                return {
                    "name": data.name,
                    "subCategory": newsc2._id.toString()
                };
            }
        });

        const result = await SubCategoryType.insertMany(mappedData);
        // Lấy mảng các ID đã được thêm
        const insertedIds = result.map(item => item._id.toString());
        console.log('Inserted IDs:', insertedIds);

        const category = new Category({
            name: "Phụ kiện máy tính",
            subCategoryType: insertedIds
        });
        await category.save();
    } catch (error) {
        console.error('Error:', error.message);
    }
  },
  async addData6(filter, projection) {

    let sctData = [
        { name: "iPhone", SubCategory: "Điện thoại" },
        { name: "Samsung", SubCategory: "Điện thoại" },
        { name: "Xiaomi", SubCategory: "Điện thoại" },
        { name: "ZTE", SubCategory: "Điện thoại" },
        { name: "Google", SubCategory: "Điện thoại" },
        { name: "Oppo", SubCategory: "Điện thoại" },
        { name: "Realme", SubCategory: "Điện thoại" },
        { name: "Redmi", SubCategory: "Điện thoại" },
        { name: "Vivo", SubCategory: "Điện thoại" },
        { name: "Huawei", SubCategory: "Điện thoại" },
        { name: "Motorola", SubCategory: "Điện thoại" },
        { name: "Sony", SubCategory: "Điện thoại" },
        { name: "LG", SubCategory: "Điện thoại" },
        { name: "Apple", SubCategory: "Máy tính bảng" },
        { name: "Samsung", SubCategory: "Máy tính bảng" },
        { name: "Xiaomi", SubCategory: "Máy tính bảng" },
        { name: "LG", SubCategory: "Máy tính bảng" },
        { name: "Sony", SubCategory: "Máy tính bảng" },
        { name: "Apple", SubCategory: "Đồng hồ thông minh" },
        { name: "Samsung", SubCategory: "Đồng hồ thông minh" },
        { name: "Garmin", SubCategory: "Đồng hồ thông minh" },
        { name: "Fitbit", SubCategory: "Đồng hồ thông minh" },
        { name: "Xiaomi", SubCategory: "Đồng hồ thông minh" },
    ];

    let newsc1;
    let newsc2;
    let newsc3;

    try {
        newsc1 = new SubCategory({
            name: "Điện thoại",
        });

        newsc2 = new SubCategory({
            name: "Máy tính bảng",
        });

        newsc3 = new SubCategory({
            name: "Đồng hồ thông minh",
        });

        newsc1 = await newsc1.save();
        newsc2 = await newsc2.save();
        newsc3 = await newsc3.save();

        var mappedData = sctData.map(function(data) {
            if (data.SubCategory === "Điện thoại") {
                return {
                    "name": data.name,
                    "subCategory": newsc1._id.toString()
                };
            } else if (data.SubCategory === "Máy tính bảng") {
                return {
                    "name": data.name,
                    "subCategory": newsc2._id.toString()
                };
            } else if (data.SubCategory === "Đồng hồ thông minh") {
                return {
                    "name": data.name,
                    "subCategory": newsc3._id.toString()
                };
            }
        });

        const result = await SubCategoryType.insertMany(mappedData);
        // Lấy mảng các ID đã được thêm
        const insertedIds = result.map(item => item._id.toString());
        console.log('Inserted IDs:', insertedIds);

        const category = new Category({
            name: "Điện thoại & Phụ kiện",
            subCategoryType: insertedIds
        });
        await category.save();
    } catch (error) {
        console.error('Error:', error.message);
    }
  },
  async addData7(filter, projection) {

    let sctData = [
        { name: "Giá đỡ", SubCategory: "Phụ kiện laptop" },
        { name: "Để tản nhiệt", SubCategory: "Phụ kiện laptop" },
        { name: "Balo - Túi chống sốc", SubCategory: "Phụ kiện laptop" },
        { name: "Dán màn hình", SubCategory: "Phụ kiện laptop" },
        { name: "Miếng lót bàn phím", SubCategory: "Phụ kiện laptop" },
        { name: "Bàn phím", SubCategory: "Linh kiện laptop" },
        { name: "Sạc laptop", SubCategory: "Linh kiện laptop" },
        { name: "Pin laptop", SubCategory: "Linh kiện laptop" },
        { name: "RAM laptop", SubCategory: "Linh kiện laptop" },
        { name: "Bộ cấp nguồn", SubCategory: "Linh kiện laptop" },
        { name: "LCD laptop", SubCategory: "Linh kiện laptop" },
        { name: "Bao da- Ốp lưng", SubCategory: "Phụ kiện di động" },
        { name: "Pin dự phòng", SubCategory: "Phụ kiện di động" },
        { name: "Cáp sạc", SubCategory: "Phụ kiện di động" },
        { name: "Bộ sạc", SubCategory: "Phụ kiện di động" },
        { name: "Giá đỡ", SubCategory: "Phụ kiện di động" },
        { name: "Ugreen", SubCategory: "Hub - Bộ chia, bộ chuyển đổi" },
        { name: "Unitek", SubCategory: "Hub - Bộ chia, bộ chuyển đổi" },
        { name: "Mazer", SubCategory: "Hub - Bộ chia, bộ chuyển đổi" },
        { name: "HyperDRive", SubCategory: "Hub - Bộ chia, bộ chuyển đổi" },
        { name: "Belkin", SubCategory: "Hub - Bộ chia, bộ chuyển đổi" },
        { name: "Ugreen", SubCategory: "Cáp chuyền - cáp nối" },
        { name: "Unitek", SubCategory: "Cáp chuyền - cáp nối" },
        { name: "Mazer", SubCategory: "Cáp chuyền - cáp nối" },
        { name: "HyperDRive", SubCategory: "Cáp chuyền - cáp nối" },
        { name: "Belkin", SubCategory: "Cáp chuyền - cáp nối" },
        { name: "USB", SubCategory: "Thiết bị lưu trữ" },
        { name: "Thẻ nhớ", SubCategory: "Thiết bị lưu trữ" },
        { name: "Ổ cứng gắn ngoài", SubCategory: "Thiết bị lưu trữ" },
    ];

    let newsc1;
    let newsc2;
    let newsc3;
    let newsc4;
    let newsc5;
    let newsc6;

    try {
        newsc1 = new SubCategory({
            name: "Phụ kiện laptop",
        });

        newsc2 = new SubCategory({
            name: "Linh kiện laptop",
        });

        newsc3 = new SubCategory({
            name: "Phụ kiện di động",
        });

        newsc4 = new SubCategory({
            name: "Hub - Bộ chia, bộ chuyển đổi",
        });

        newsc5 = new SubCategory({
            name: "Cáp chuyền - cáp nối",
        });

        newsc6 = new SubCategory({
            name: "Thiết bị lưu trữ",
        });

        newsc1 = await newsc1.save();
        newsc2 = await newsc2.save();
        newsc3 = await newsc3.save();
        newsc4 = await newsc4.save();
        newsc5 = await newsc5.save();
        newsc6 = await newsc6.save();

        var mappedData = sctData.map(function(data) {
            if (data.SubCategory === "Phụ kiện laptop") {
                return {
                    "name": data.name,
                    "subCategory": newsc1._id.toString()
                };
            } else if (data.SubCategory === "Linh kiện laptop") {
                return {
                    "name": data.name,
                    "subCategory": newsc2._id.toString()
                };
            } else if (data.SubCategory === "Phụ kiện di động") {
                return {
                    "name": data.name,
                    "subCategory": newsc3._id.toString()
                };
            } else if (data.SubCategory === "Hub - Bộ chia, bộ chuyển đổi") {
                return {
                    "name": data.name,
                    "subCategory": newsc4._id.toString()
                };
            } else if (data.SubCategory === "Cáp chuyền - cáp nối") {
                return {
                    "name": data.name,
                    "subCategory": newsc5._id.toString()
                };
            } else if (data.SubCategory === "Thiết bị lưu trữ") {
                return {
                    "name": data.name,
                    "subCategory": newsc6._id.toString()
                };
            }
        });

        const result = await SubCategoryType.insertMany(mappedData);
        // Lấy mảng các ID đã được thêm
        const insertedIds = result.map(item => item._id.toString());
        console.log('Inserted IDs:', insertedIds);

        const category = new Category({
            name: "Phụ kiện",
            subCategoryType: insertedIds
        });
        await category.save();
    } catch (error) {
        console.error('Error:', error.message);
    }
  },
  async addData8(filter, projection) {

    let sctData = [
        { name: "Apple", SubCategory: "Tai nghe" },
        { name: "Sony", SubCategory: "Tai nghe" },
        { name: "Logitech", SubCategory: "Tai nghe" },
        { name: "Asus", SubCategory: "Tai nghe" },
        { name: "Razer", SubCategory: "Tai nghe" },
        { name: "Soundpeats", SubCategory: "Tai nghe" },
        { name: "E-dra", SubCategory: "Tai nghe" },
        { name: "DareU", SubCategory: "Tai nghe" },
        { name: "HAVIT", SubCategory: "Tai nghe" },
        { name: "Xiaomi", SubCategory: "Tai nghe" },
        { name: "CORSAIR", SubCategory: "Tai nghe" },
        { name: "Bose", SubCategory: "Loa nghe nhạc" },
        { name: "Harman Kardon", SubCategory: "Loa nghe nhạc" },
        { name: "JBL", SubCategory: "Loa nghe nhạc" },
        { name: "Logitech", SubCategory: "Loa nghe nhạc" },
        { name: "Sony", SubCategory: "Loa nghe nhạc" },
        { name: "LG", SubCategory: "Loa nghe nhạc" },
        { name: "Remax", SubCategory: "Loa nghe nhạc" },
        { name: "SoundMax", SubCategory: "Loa nghe nhạc" },
        { name: "Microlab", SubCategory: "Loa nghe nhạc" },
        { name: "Senic", SubCategory: "MicroPhone" },
        { name: "Razer", SubCategory: "MicroPhone" },
        { name: "Boya", SubCategory: "MicroPhone" },
        { name: "AKG", SubCategory: "MicroPhone" },
        { name: "Salar", SubCategory: "MicroPhone" },
        { name: "Saramonic", SubCategory: "MicroPhone" },
        { name: "In-Ear", SubCategory: "Loại tai nghe" },
        { name: "On-Ear", SubCategory: "Loại tai nghe" },
        { name: "Over-Ear", SubCategory: "Loại tai nghe" },
        { name: "Tai nghe Bluetooth", SubCategory: "Loại tai nghe" },
        { name: "Tai nghe Gaming", SubCategory: "Loại tai nghe" },
        { name: "Tai nghe không dây", SubCategory: "Loại tai nghe" },
    ];

    let newsc1;
    let newsc2;
    let newsc3;
    let newsc4;

    try {
        newsc1 = new SubCategory({
            name: "Tai nghe",
        });

        newsc2 = new SubCategory({
            name: "Loa nghe nhạc",
        });

        newsc3 = new SubCategory({
            name: "MicroPhone",
        });

        newsc4 = new SubCategory({
            name: "Loại tai nghe",
        });

        newsc1 = await newsc1.save();
        newsc2 = await newsc2.save();
        newsc3 = await newsc3.save();
        newsc4 = await newsc4.save();

        var mappedData = sctData.map(function(data) {
            if (data.SubCategory === "Tai nghe") {
                return {
                    "name": data.name,
                    "subCategory": newsc1._id.toString()
                };
            } else if (data.SubCategory === "Loa nghe nhạc") {
                return {
                    "name": data.name,
                    "subCategory": newsc2._id.toString()
                };
            } else if (data.SubCategory === "MicroPhone") {
                return {
                    "name": data.name,
                    "subCategory": newsc3._id.toString()
                };
            } else if (data.SubCategory === "Loại tai nghe") {
                return {
                    "name": data.name,
                    "subCategory": newsc4._id.toString()
                };
            }
        });

        const result = await SubCategoryType.insertMany(mappedData);
        // Lấy mảng các ID đã được thêm
        const insertedIds = result.map(item => item._id.toString());
        console.log('Inserted IDs:', insertedIds);

        const category = new Category({
            name: "Thiết bị âm thanh",
            subCategoryType: insertedIds
        });
        await category.save();
    } catch (error) {
        console.error('Error:', error.message);
    }
  },
  async addData9(filter, projection) {

    let sctData = [
        { name: "TP-Link", SubCategory: "Thiết bị mạng" },
        { name: "TOTOLINK", SubCategory: "Thiết bị mạng" },
        { name: "D-Link", SubCategory: "Thiết bị mạng" },
        { name: "Tenda", SubCategory: "Thiết bị mạng" },
        { name: "DrayTek", SubCategory: "Thiết bị mạng" },
        { name: "Cisco", SubCategory: "Thiết bị mạng" },
        { name: "Router Wifi", SubCategory: "Thiết bị mạng" },
        { name: "Hub - Switch", SubCategory: "Thiết bị mạng" },
        { name: "Linksys", SubCategory: "Thiết bị mạng" },
        { name: "Cáp mạng", SubCategory: "Thiết bị mạng" },
        { name: "Card mạng", SubCategory: "Thiết bị mạng" },
        { name: "KBVISION", SubCategory: "Thiết bị an ninh" },
        { name: "HIKVISION", SubCategory: "Thiết bị an ninh" },
        { name: "QUESTEK", SubCategory: "Thiết bị an ninh" },
        { name: "EZVIZ", SubCategory: "Thiết bị an ninh" },
        { name: "Xiaomi", SubCategory: "Thiết bị an ninh" },
        { name: "Camera an ninh", SubCategory: "Thiết bị an ninh" },
        { name: "Đầu ghi hình", SubCategory: "Thiết bị an ninh" },
        { name: "Brother", SubCategory: "Máy in văn phòng" },
        { name: "Canon", SubCategory: "Máy in văn phòng" },
        { name: "Epson", SubCategory: "Máy in văn phòng" },
        { name: "HP", SubCategory: "Máy in văn phòng" },
        { name: "Máy in laser", SubCategory: "Máy in văn phòng" },
        { name: "Máy in kim", SubCategory: "Máy in văn phòng" },
        { name: "Máy in phun", SubCategory: "Máy in văn phòng" },
        { name: "Máy in đa năng", SubCategory: "Máy in văn phòng" },
        { name: "Mực in Laser", SubCategory: "Mực in - Giấy in" },
        { name: "Mực in phun", SubCategory: "Mực in - Giấy in" },
        { name: "Mực in máy fax", SubCategory: "Mực in - Giấy in" },
        { name: "Drum", SubCategory: "Mực in - Giấy in" },
        { name: "Ruy băng", SubCategory: "Mực in - Giấy in" },
        { name: "Giấy in", SubCategory: "Mực in - Giấy in" },
        { name: "Brother", SubCategory: "Máy Scan" },
        { name: "Canon", SubCategory: "Máy Scan" },
        { name: "Epson", SubCategory: "Máy Scan" },
        { name: "HP", SubCategory: "Máy Scan" },
        { name: "Máy chiếu", SubCategory: "Thiết bị trình chiếu" },
        { name: "Màn chiếu", SubCategory: "Thiết bị trình chiếu" },
        { name: "Bút trình chiếu", SubCategory: "Thiết bị trình chiếu" },
        { name: "Giá treo máy", SubCategory: "Thiết bị trình chiếu" },
        { name: "Windows bản quyền", SubCategory: "Phần mềm" },
        { name: "Microsoft Office", SubCategory: "Phần mềm" },
        { name: "Máy quét mã vạch", SubCategory: "Thiết bị khác" },
        { name: "Máy đếm tiền", SubCategory: "Thiết bị khác" },
        { name: "Máy chấm công", SubCategory: "Thiết bị khác" },
        { name: "Máy tính tiền", SubCategory: "Thiết bị khác" },
        { name: "Máy hủy tài liệu", SubCategory: "Thiết bị khác" },
        { name: "Máy ép nhựa", SubCategory: "Thiết bị khác" }
    ];

    let newsc1;
    let newsc2;
    let newsc3;
    let newsc4;
    let newsc5;
    let newsc6;
    let newsc7;
    let newsc8;

    try {
        newsc1 = new SubCategory({
            name: "Thiết bị mạng",
        });
        newsc2 = new SubCategory({
            name: "Thiết bị an ninh",
        });
        newsc3 = new SubCategory({
            name: "Máy in văn phòng",
        });
        newsc4 = new SubCategory({
            name: "Mực in - Giấy in",
        });
        newsc5 = new SubCategory({
            name: "Máy Scan",
        });
        newsc6 = new SubCategory({
          name: "Thiết bị trình chiếu",
        });
        newsc7 = new SubCategory({
         name: "Phần mềm",
        });
        newsc8 = new SubCategory({
          name: "Thiết bị khác",
        });
  
        
        newsc1 = await newsc1.save();
        newsc2 = await newsc2.save();
        newsc3 = await newsc3.save();
        newsc4 = await newsc4.save();
        newsc5 = await newsc5.save();
        newsc6 = await newsc6.save();
        newsc7 = await newsc7.save();
        newsc8 = await newsc8.save();

        var mappedData = sctData.map(function(data) {
            if(data.SubCategory === "Thiết bị mạng"){
                return {
                    "name": data.name,
                    "subCategory": newsc1._id.toString()
                };
            }
            else if(data.SubCategory === "Thiết bị an ninh"){
                return {
                    "name": data.name,
                    "subCategory": newsc2._id.toString()
                };
            }
            else if(data.SubCategory === "Máy in văn phòng"){
                return {
                    "name": data.name,
                    "subCategory": newsc3._id.toString()
                };
            }
            else if(data.SubCategory === "Mực in - Giấy in"){
                return {
                    "name": data.name,
                    "subCategory": newsc4._id.toString()
                };
            }
            else if(data.SubCategory === "Máy Scan"){
                return {
                    "name": data.name,
                    "subCategory": newsc5._id.toString()
                };
            }
            else if(data.SubCategory === "Thiết bị trình chiếu"){
                return {
                    "name": data.name,
                    "subCategory": newsc6._id.toString()
                };
            }
            else if(data.SubCategory === "Phần mềm"){
                return {
                    "name": data.name,
                    "subCategory": newsc7._id.toString()
                };
            }
            else if(data.SubCategory === "Thiết bị khác"){
                return {
                    "name": data.name,
                    "subCategory": newsc8._id.toString()
                };
            }
        });

        const result = await SubCategoryType.insertMany(mappedData);
        // Lấy mảng các ID đã được thêm
        const insertedIds = result.map(item => item._id.toString());
        console.log('Inserted IDs:', insertedIds);


        const category = new Category({
            name: "Thiết bị văn phòng",
            subCategoryType: insertedIds
        });
        await category.save();
    } catch (error) {
        console.error('Error:', error.message);
    }
  },
  async addData() {
    try {
        await Category.deleteMany({}); 
    await SubCategory.deleteMany({}); 
    await SubCategoryType.deleteMany({});
      // Add categories
      const categories = ["Nam", "Nữ", "Trẻ Em"];
      for (const categoryName of categories) {
        await Category.create({ name: categoryName });
      }
  
      // Add subcategories
      const subcategories = {
        "Nam": ["Áo Nam", "Quần Nam", "Đồ Bộ Nam", "Đồ Thể Thao Nam", "Đồ Lót Nam", "Giày Nam - Dép Nam", "Phụ Kiện Nam"],
        "Nữ": ["Áo Nữ", "Quần Nữ", "Đồ Bộ Nữ", "Đồ Thể Thao Nữ", "Đồ Lót Nữ", "Chân Váy Nữ", "Đầm Nữ - Váy Nữ", "Phụ Kiện Nữ", "Giày Nữ - Dép Nữ"],
        "Trẻ Em": ["Áo Trẻ Em", "Quần Trẻ Em", "Đồ Bộ Trẻ Em", "Đồ Thể Thao Trẻ Em", "Đầm/Váy Bé Gái", "Giày Dép Trẻ Em", "Phụ Kiện Trẻ Em"]
      };
      for (const [categoryName, subcategoryNames] of Object.entries(subcategories)) {
        const category = await Category.findOne({ name: categoryName });
        if (category) {
          for (const subcategoryName of subcategoryNames) {
            await SubCategory.create({ name: subcategoryName, category: category._id });
          }
        }
      }
  
      // Add subcategory types
      const subcategoryTypes = {
        "Áo Nữ": ["Áo Polo", "Áo Thun", "Áo Chống Nắng", "Áo Sơ Mi", "Áo Khoác", "Áo Nỉ", "Áo Giữ Nhiệt", "Áo Len"],
        "Quần Nữ": ["Quần Jeans", "Quần Short", "Quần Âu", "Quần Kaki", "Quần Nỉ"],
        "Đồ Bộ Nữ": ["Đồ Bộ Nữ Mặc Nhà"],
        "Đồ Lót Nữ": ["Áo lót", "Quần lót"],
        "Đồ Thể Thao Nữ": ["Bộ Thể Thao", "Áo Thun Thể Thao", "Quần Thể Thao"],
        "Giày Nữ - Dép Nữ": ["Giày Thể Thao", "Giày Cao Gót", "Sandal", "Dép kẹp"],
        // Add subcategory types for other subcategories similarly
      };
      for (const [subcategoryName, subcategoryTypeNames] of Object.entries(subcategoryTypes)) {
        const subcategory = await SubCategory.findOne({ name: subcategoryName });
        if (subcategory) {
          for (const subcategoryTypeName of subcategoryTypeNames) {
            await SubCategoryType.create({ name: subcategoryTypeName, subCategory: subcategory._id });
          }
        }
      }
  
      console.log("Data added successfully!");
    } catch (error) {
      console.error("Error adding data:", error);
    }
  }  

};

export default SubCategoryService;
