import User from '../models/userModel.js';
import Product from '../models/productModel.js';

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('cart.product');
    res.json(user.cart);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
export const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  try {
    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    // Check stock availability
    if (product.stock < quantity) {
      return res.status(400).json({ msg: 'Insufficient stock available' });
    }

    const user = await User.findById(req.user.id);
    
    const existingItemIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      const newQuantity = user.cart[existingItemIndex].quantity + quantity;
      
      // Check total quantity doesn't exceed stock
      if (newQuantity > product.stock) {
        return res.status(400).json({ msg: 'Cannot add more items than available in stock' });
      }
      
      user.cart[existingItemIndex].quantity = newQuantity;
    } else {
      user.cart.push({ product: productId, quantity });
    }

    await user.save();
    const updatedUser = await User.findById(req.user.id).populate('cart.product');
    res.json(updatedUser.cart);
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

// @desc    Update item quantity in cart
// @route   PUT /api/cart/update/:productId
// @access  Private
export const updateCartItem = async (req, res) => {
  const { quantity } = req.body;

  try {
    if (quantity <= 0) {
      return res.status(400).json({ msg: 'Quantity must be greater than 0' });
    }

    // Validate product exists and has enough stock
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ msg: 'Insufficient stock available' });
    }

    const user = await User.findById(req.user.id);

    const item = user.cart.find(
      (cartItem) => cartItem.product.toString() === req.params.productId
    );

    if (!item) {
      return res.status(404).json({ msg: 'Item not in cart' });
    }

    item.quantity = quantity;
    await user.save();

    const updatedUser = await User.findById(req.user.id).populate('cart.product');
    res.json(updatedUser.cart);
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

// @desc    Remove item from cart
// @route   POST /api/cart/remove (changed from DELETE to match frontend)
// @access  Private
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user.id);

    user.cart = user.cart.filter(
      (item) => item.product.toString() !== productId
    );

    await user.save();
    const updatedUser = await User.findById(req.user.id).populate('cart.product');
    res.json(updatedUser.cart);
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart/clear
// @access  Private
export const clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.cart = [];
    await user.save();
    res.json({ msg: 'Cart cleared successfully', cart: [] });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};