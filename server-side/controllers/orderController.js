import User from '../models/userModel.js';
import Order from '../models/orderModel.js';

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
// RENAMED this function from 'checkout' to 'createOrder' to match the import
export async function createOrder(req, res) {
  try {
    const user = await User.findById(req.user.id).populate('cart.product');

    if (!user || !user.cart || user.cart.length === 0) {
      return res.status(400).json({ msg: 'Cart is empty' });
    }

    const orderItems = user.cart.map((item) => ({
      product: item.product, // Storing the whole product object for easier display later
      quantity: item.quantity,
      price: item.product.price
    }));

    const totalAmount = orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const order = new Order({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      paymentStatus: 'paid' // Assuming dummy payment is always successful
      // Add other fields from your model like shippingAddress if needed
    });

    const createdOrder = await order.save();

    // Clear user cart after checkout
    user.cart = [];
    await user.save();

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
}

// @desc    Get logged in user's orders
// @route   GET /api/orders
// @access  Private
export async function getOrders(req, res) {
  try {
    const orders = await Order.find({ user: req.user.id }).populate('items.product').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
}

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
export async function getOrderById(req, res) {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id }).populate('items.product');

    if (!order) {
      return res.status(404).json({ msg: 'Order not found or you are not authorized to view it' });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
}
