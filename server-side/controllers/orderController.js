import User from '../models/userModel.js';
import Order from '../models/orderModel.js';

/**
 * @desc    Create order (Legacy - for backward compatibility)
 * @route   POST /api/orders/create
 * @access  Private
 * @note    This is now mainly handled by payment verification in paymentController
 */
export async function createOrder(req, res) {
  try {
    const user = await User.findById(req.user.id).populate('cart.product');

    if (!user || !user.cart || user.cart.length === 0) {
      return res.status(400).json({ msg: 'Cart is empty' });
    }

    // Filter out items with null products
    const validCartItems = user.cart.filter(item => item.product);

    if (validCartItems.length === 0) {
      return res.status(400).json({ msg: 'No valid items in cart' });
    }

    const orderItems = validCartItems.map((item) => ({
      product: item.product._id, 
      quantity: item.quantity,
      price: item.product.price
    }));

    const subtotal = orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    // Add shipping and tax
    const shipping = subtotal > 50 ? 0 : 5.99;
    const tax = subtotal * 0.08;
    const totalAmount = subtotal + shipping + tax;

    const order = new Order({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      status: 'Pending',
      shippingAddress: req.body.shippingAddress || {},
    });

    const createdOrder = await order.save();

    // Clear cart
    user.cart = [];
    await user.save();

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
}

/**
 * @desc    Get all orders for logged-in user
 * @route   GET /api/orders
 * @access  Private
 */
export async function getOrders(req, res) {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
}

/**
 * @desc    Get single order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
export async function getOrderById(req, res) {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    }).populate('items.product');

    if (!order) {
      return res.status(404).json({ 
        msg: 'Order not found or you are not authorized to view it' 
      });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
}

/**
 * @desc    Update order status (for admin or delivery updates)
 * @route   PUT /api/orders/:id/status
 * @access  Private
 */
export async function updateOrderStatus(req, res) {
  try {
    const { status } = req.body;
    
    const validStatuses = ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: 'Invalid status' });
    }

    const order = await Order.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    order.status = status;
    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
}

/**
 * @desc    Cancel order
 * @route   PUT /api/orders/:id/cancel
 * @access  Private
 */
export async function cancelOrder(req, res) {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Only allow cancellation if order is not yet shipped
    if (['Shipped', 'Delivered'].includes(order.status)) {
      return res.status(400).json({ 
        msg: 'Cannot cancel order that has been shipped or delivered' 
      });
    }

    order.status = 'Cancelled';
    const cancelledOrder = await order.save();

    res.json({ 
      msg: 'Order cancelled successfully', 
      order: cancelledOrder 
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
}