import Review from "../models/review.model.js";
import { Product } from "../models/product.model.js";

const ReviewService = {
  async getAll(filter, projection) {
    return await Review.find(filter).select(projection);
  },
  // async getAll() {
  //   return await AuthorizeRequest.find();
  // },

  async getById(id) {
    return await Review.findById(id);
  },

  async getByProductId(productId) {
    return await Review.find({ product: productId });
  },

  async create(objectData) {
    const newObject = new Review(objectData);
    return await newObject.save();
  },

  async update(id, updateData) {
    return await Review.findByIdAndUpdate(id, updateData, { new: true });
  },

  async delete(id) {
    return await Review.findByIdAndDelete(id);
  },
  async addCommentIdToReview(reviewId, commentId) {
     return await Review.findByIdAndUpdate(
        reviewId, 
        { $push: { conversation: { comment: commentId } } },
        { new: true, useFindAndModify: false }
      );

  },
  async averageRating(productId) {
    const reviews = await this.getByProductId(productId);
    const sum = reviews.reduce((sum, review) => sum + review.rating, 0);
    const avg = sum / reviews.length;
    return avg;
  },
  async getFilteredReviews(filterOptions) {
    const {
      shop,
      product,
      category,
      rating,
      isResponse,
      index,
      amount,
      sortBy,
    } = filterOptions;
    console.log("service filter option: ", filterOptions)
  
    const query = {};
  
    if (shop) {
      query.shop = shop;
    }
  
    // if (product) {
    //   query['product.name'] = { $regex: product, $options: 'i' };
    // }
    if (product) {
      const filteredProduct = await Product.find({ name: { $regex: product, $options: 'i' } });
      const listProductId = filteredProduct.map(product => product._id);
      query.product = { $in: listProductId };
    }

    if (category != "") {
      query.category = category;
    }
  
    if (rating !== null && !isNaN(rating)) {
      query.rating = rating;
    }
  
    if (isResponse) {
      query.isResponseByShop = isResponse;
    }
  
    console.log("Query:", JSON.stringify(query, null, 2));
  
    const total = await Review.countDocuments(query);
  
    let sortOption = {};
    switch (sortBy) {
      case 'ascending rating':
        sortOption = { rating: 1 };
        break;
      case 'descending rating':
        sortOption = { rating: -1 };
        break;
      case 'latest':
        sortOption = { createdAt: -1 };
        break;
      default:
        break;
    }
  
    console.log("Sort Option:", sortOption);
  
    const filteredReviews = await Review.find(query)
      .populate({
        path: 'product',
        populate: {
          path: 'name attribute shop',
        },
      })
      // .populate('user', 'username')
      .sort(sortOption)
      .skip((index - 1) * amount)
      .limit(amount)
      .exec();
  
    // console.log("Filtered Reviews:", JSON.stringify(filteredReviews, null, 2));
  
    return { filteredReviews, total };
  },

};

export default ReviewService;
