import Stripe from 'stripe';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // Verify stock
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(404);
      throw new Error(`Product not found: ${item.product}`);
    }
    if (product.stock < item.qty) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}`);
    }
  }

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  });

  // Decrement stock
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.qty } });
  }

  res.status(201).json(order);
});

// @desc    Get logged-in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Admin
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  // Only owner or admin
  if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }
  res.json(order);
});

// @desc    Pay order (Stripe PaymentIntent or COD)
// @route   PUT /api/orders/:id/pay
// @access  Private
export const payOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (order.isPaid) {
    res.status(400);
    throw new Error('Order is already paid');
  }

  if (order.paymentMethod === 'stripe') {
    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalPrice * 100), // paise/cents
      currency: 'lkr',
      metadata: { orderId: order._id.toString() },
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } else if (order.paymentMethod === 'cod') {
    // COD: mark as payment result pending
    order.paymentResult = {
      id: `COD-${Date.now()}`,
      status: 'COD',
      update_time: new Date().toISOString(),
      email_address: req.user.email,
    };
    const updated = await order.save();
    res.json(updated);
  } else {
    res.status(400);
    throw new Error('Invalid payment method');
  }
});

// @desc    Confirm Stripe payment (called after frontend confirms)
// @route   PUT /api/orders/:id/pay/confirm
// @access  Private
export const confirmStripePayment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  const { paymentIntentId } = req.body;
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (paymentIntent.status === 'succeeded') {
    order.isPaid = true;
    order.paidAt = new Date();
    order.orderStatus = 'Processing';
    order.stripePaymentIntentId = paymentIntentId;
    order.paymentResult = {
      id: paymentIntent.id,
      status: paymentIntent.status,
      update_time: new Date().toISOString(),
      email_address: req.user.email,
    };
    const updated = await order.save();
    res.json(updated);
  } else {
    res.status(400);
    throw new Error('Payment not confirmed');
  }
});

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
// @access  Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  const { orderStatus } = req.body;
  order.orderStatus = orderStatus;
  if (orderStatus === 'Delivered') {
    order.isDelivered = true;
    order.deliveredAt = new Date();
    if (order.paymentMethod === 'cod') {
      order.isPaid = true;
      order.paidAt = new Date();
    }
  }
  const updated = await order.save();
  res.json(updated);
});

// @desc    Get admin stats
// @route   GET /api/orders/stats
// @access  Admin
export const getOrderStats = asyncHandler(async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const totalRevenue = await Order.aggregate([
    { $match: { isPaid: true } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } },
  ]);
  const recentOrders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 }).limit(5);
  // 7-day sales
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const dailySales = await Order.aggregate([
    { $match: { isPaid: true, createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  res.json({
    totalOrders,
    totalRevenue: totalRevenue[0]?.total || 0,
    recentOrders,
    dailySales,
  });
});
