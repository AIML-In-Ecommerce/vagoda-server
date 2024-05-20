import Promotion from "./promotion.model.js";

const PromotionService = {
  async getAll(filter, projection) {
    return await Promotion.find(filter).select(projection);
  },
  // async getAll() {
  //   return await AuthorizeRequest.find();
  // },

  async getByIds(listOfIds)
  {

    return await Promotion.find(
      {
        _id: {$in: listOfIds}
      }
    )

  },

  async getById(id) {
    return await Promotion.findById(id);
  },

  async create(objectData) {
    const newObject = new Promotion(objectData);
    return await newObject.save();
  },

  async update(id, updateData) {
    return await Promotion.findByIdAndUpdate(id, updateData, { new: true });
  },

  async delete(id) {
    return await Promotion.findByIdAndDelete(id);
  },
  
  async getListByIds(ids) {
    const list = await Promotion.find({ _id: { $in: ids } });
    return list;
  },
};

export default PromotionService;
