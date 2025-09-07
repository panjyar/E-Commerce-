import User from '../models/userModel.js';

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
export async function getWishlist(req, res) {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
}

// @desc    Add item to wishlist
// @route   POST /api/wishlist/add
// @access  Private
export async function addToWishlist(req, res) {
  const { productId } = req.body;

  try {
    const user = await User.findById(req.user.id);

    const alreadyInWishlist = user.wishlist.some(
      (item) => item.toString() === productId
    );

    if (!alreadyInWishlist) {
      user.wishlist.push(productId);
      await user.save();
    }

    const updatedUser = await User.findById(req.user.id).populate('wishlist');
    res.json(updatedUser.wishlist);
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
}

// @desc    Remove item from wishlist
// @route   DELETE /api/wishlist/remove/:productId
// @access  Private
export async function removeFromWishlist(req, res) {
  try {
    const user = await User.findById(req.user.id);

    user.wishlist = user.wishlist.filter(
      (item) => item.toString() !== req.params.productId
    );

    await user.save();
    const updatedUser = await User.findById(req.user.id).populate('wishlist');
    res.json(updatedUser.wishlist);
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
}
