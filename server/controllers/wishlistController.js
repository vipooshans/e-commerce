import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name price images rating stock category brand');
  res.json(user.wishlist);
});

// @desc    Add to wishlist
// @route   POST /api/wishlist
// @access  Private
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const user = await User.findById(req.user._id);
  if (!user.wishlist.includes(productId)) {
    user.wishlist.push(productId);
    await user.save();
  }
  res.json({ message: 'Added to wishlist' });
});

// @desc    Remove from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.wishlist = user.wishlist.filter((id) => id.toString() !== req.params.productId);
  await user.save();
  res.json({ message: 'Removed from wishlist' });
});
