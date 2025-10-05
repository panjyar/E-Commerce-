import { Router } from 'express';
import {
  createRazorpayOrder,
  verifyPayment,
  handlePaymentFailure,
  getPaymentDetails,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// All payment routes are protected
router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPayment);
router.post('/failure', protect, handlePaymentFailure);
router.get('/:paymentId', protect, getPaymentDetails);

export default router;