import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Match frontend call to /orders/create
router.post('/create', protect, createOrder);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrderById);

export default router;