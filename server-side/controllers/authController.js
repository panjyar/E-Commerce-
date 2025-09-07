import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';

// Helper to sign JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
export async function register(req, res) {
  const { email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const user = await User.create({ email, password });

    res.status(201).json({
      _id: user._id,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
}

// @desc    Auth user & get token (Login)
// @route   POST /api/auth/login
export async function login(req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ msg: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
}

// @desc    Get user data
// @route   GET /api/auth/me
export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id)
      .populate('cart.product')
      .populate('wishlist');
    res.json(user);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
}
