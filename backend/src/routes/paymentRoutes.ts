import { Router } from 'express';
import {
  createOrder,
  verifyPayment,
  razorpayWebhook,
  getPaymentStatus,
  getPaymentHistory,
} from '../controllers/paymentController';
import { authenticate } from '../middleware';

const router = Router();

// Razorpay routes
router.post('/create-order', authenticate, createOrder);
router.post('/verify', authenticate, verifyPayment);
router.post('/webhook/razorpay', razorpayWebhook);

// Protected routes
router.get('/status', authenticate, getPaymentStatus);
router.get('/history', authenticate, getPaymentHistory);

export default router;
