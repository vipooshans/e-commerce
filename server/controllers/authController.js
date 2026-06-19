import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email and password');
  }
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }
  const user = await User.create({ name, email, password });
  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    token: generateToken(user._id),
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    token: generateToken(user._id),
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name price images rating');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    avatar: user.avatar,
    addresses: user.addresses,
    wishlist: user.wishlist,
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
export const updateMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  const { name, email, password, addresses } = req.body;
  if (name) user.name = name;
  if (email) user.email = email;
  if (password) user.password = password;
  if (addresses !== undefined) user.addresses = addresses;
  const updated = await user.save();
  res.json({
    _id: updated._id,
    name: updated.name,
    email: updated.email,
    isAdmin: updated.isAdmin,
    addresses: updated.addresses,
    token: generateToken(updated._id),
  });
});
