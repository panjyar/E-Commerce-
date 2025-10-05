import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';


// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

console.log('✅ Razorpay initialized successfully');
/**
 * @desc    Create Razorpay order
 * @route   POST /api/payment/create-order
 * @access  Private
 */
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ msg: 'Invalid amount' });
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Amount in paise (multiply by 100)
      currency: currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: req.user.id,
        email: req.user.email,
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ 
      msg: 'Failed to create payment order', 
      error: error.message 
    });
  }
};

/**
 * @desc    Verify Razorpay payment signature
 * @route   POST /api/payment/verify
 * @access  Private
 */
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData,
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Payment verification failed' 
      });
    }

    // Payment is verified, create order in database
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
      price: item.product.price,
    }));

    const totalAmount = orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    // Add shipping and tax
    const shipping = totalAmount > 50 ? 0 : 5.99;
    const tax = totalAmount * 0.08;
    const finalAmount = totalAmount + shipping + tax;

    // Create order
    const order = new Order({
      user: req.user.id,
      items: orderItems,
      totalAmount: finalAmount,
      status: 'Paid',
      paymentDetails: {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      },
      shippingAddress: orderData.shippingAddress,
    });

    const createdOrder = await order.save();

    // Clear user's cart
    user.cart = [];
    await user.save();

    res.status(201).json({
      success: true,
      msg: 'Payment verified and order created successfully',
      order: createdOrder,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ 
      msg: 'Payment verification failed', 
      error: error.message 
    });
  }
};

/**
 * @desc    Handle payment failure
 * @route   POST /api/payment/failure
 * @access  Private
 */
export const handlePaymentFailure = async (req, res) => {
  try {
    const { razorpay_order_id, error } = req.body;

    console.error('Payment failed:', {
      orderId: razorpay_order_id,
      error: error,
      userId: req.user.id,
    });

    res.status(200).json({
      success: false,
      msg: 'Payment failed. Please try again.',
    });
  } catch (error) {
    console.error('Payment failure handler error:', error);
    res.status(500).json({ 
      msg: 'Error handling payment failure', 
      error: error.message 
    });
  }
};

/**
 * @desc    Fetch payment details
 * @route   GET /api/payment/:paymentId
 * @access  Private
 */
export const getPaymentDetails = async (req, res) => {
  try {
    const payment = await razorpay.payments.fetch(req.params.paymentId);
    
    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error('Fetch payment error:', error);
    res.status(500).json({ 
      msg: 'Failed to fetch payment details', 
      error: error.message 
    });
  }
};