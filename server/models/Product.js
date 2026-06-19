import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    category: {
      type: String,
      required: true,
      enum: ['Electronics', 'Fashion', 'Home & Kitchen', 'Beauty & Personal Care', 'Sports & Fitness', 'Books'],
    },
    brand: { type: String, required: true, trim: true },
    images: [{ type: String }],
    stock: { type: Number, required: true, default: 0, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSchema],
    isFeatured: { type: Boolean, default: false },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

// Text index for search
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;
