import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get all products (with filter, search, pagination)
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const { keyword, category, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;

  const query = {};

  if (keyword) {
    query.$text = { $search: keyword };
  }
  if (category) query.category = category;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  let sortOption = {};
  switch (sort) {
    case 'price_asc': sortOption = { price: 1 }; break;
    case 'price_desc': sortOption = { price: -1 }; break;
    case 'rating': sortOption = { rating: -1 }; break;
    case 'newest': sortOption = { createdAt: -1 }; break;
    default: sortOption = { createdAt: -1 };
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Math.max(1, Number(limit)));
  const skip = (pageNum - 1) * limitNum;

  const total = await Product.countDocuments(query);
  const products = await Product.find(query).sort(sortOption).skip(skip).limit(limitNum);

  res.json({
    products,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    total,
  });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true }).limit(8);
  res.json(products);
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('reviews.user', 'name avatar');
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json(product);
});

// @desc    Create product (admin)
// @route   POST /api/products
// @access  Admin
export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, originalPrice, category, brand, stock, isFeatured, tags } = req.body;
  const images = req.files ? req.files.map((f) => `/uploads/${f.filename}`) : [];
  const product = await Product.create({
    name,
    description,
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : undefined,
    category,
    brand,
    stock: Number(stock) || 0,
    isFeatured: isFeatured === 'true',
    tags: tags ? tags.split(',').map((t) => t.trim()) : [],
    images,
  });
  res.status(201).json(product);
});

// @desc    Update product (admin)
// @route   PUT /api/products/:id
// @access  Admin
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  const { name, description, price, originalPrice, category, brand, stock, isFeatured, tags } = req.body;
  if (name !== undefined) product.name = name;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = Number(price);
  if (originalPrice !== undefined) product.originalPrice = Number(originalPrice);
  if (category !== undefined) product.category = category;
  if (brand !== undefined) product.brand = brand;
  if (stock !== undefined) product.stock = Number(stock);
  if (isFeatured !== undefined) product.isFeatured = isFeatured === 'true' || isFeatured === true;
  if (tags !== undefined) product.tags = typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : tags;
  if (req.files && req.files.length > 0) {
    product.images = req.files.map((f) => `/uploads/${f.filename}`);
  }
  const updated = await product.save();
  res.json(updated);
});

// @desc    Delete product (admin)
// @route   DELETE /api/products/:id
// @access  Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  await product.deleteOne();
  res.json({ message: 'Product removed' });
});

// @desc    Add review to product
// @route   POST /api/products/:id/reviews
// @access  Private
export const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );
  if (alreadyReviewed) {
    res.status(400);
    throw new Error('You have already reviewed this product');
  }
  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };
  product.reviews.push(review);
  product.numReviews = product.reviews.length;
  product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;
  await product.save();
  res.status(201).json({ message: 'Review added' });
});

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category');
  res.json(categories);
});
