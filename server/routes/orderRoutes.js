import express from 'express';
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  payOrder,
  confirmStripePayment,
  updateOrderStatus,
  getOrderStats,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createOrder).get(protect, admin, getAllOrders);
router.get('/myorders', protect, getMyOrders);
router.get('/stats', protect, admin, getOrderStats);
router.route('/:id').get(protect, getOrderById);
router.put('/:id/pay', protect, payOrder);
router.put('/:id/pay/confirm', protect, confirmStripePayment);
router.put('/:id/status', protect, admin, updateOrderStatus);

export default router;
