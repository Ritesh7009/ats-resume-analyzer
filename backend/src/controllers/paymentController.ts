import { Request, Response } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { User, Payment } from '../models';
import { emailService } from '../services';
import { ApiResponse } from '../types';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

/**
 * Create Razorpay order
 * POST /api/payment/create-order
 */
export const createOrder = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required.',
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found.',
      });
      return;
    }

    // Check if already premium with uploads remaining
    if (user.isPremium && user.uploadCount < user.maxUploads) {
      res.status(400).json({
        success: false,
        error: `You still have ${user.maxUploads - user.uploadCount} uploads remaining.`,
      });
      return;
    }

    const amount = parseInt(process.env.PREMIUM_PRICE_PAISE || '5000'); // 50 rupees in paise

    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `receipt_${userId}_${Date.now()}`,
      notes: {
        userId: userId.toString(),
        plan: 'premium',
      },
    };

    const order = await razorpay.orders.create(options);

    // Save order ID to user
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (user as any).razorpayOrderId = order.id;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment order.',
    });
  }
};

/**
 * Verify Razorpay payment
 * POST /api/payment/verify
 */
export const verifyPayment = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required.',
      });
      return;
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      res.status(400).json({
        success: false,
        error: 'Payment verification failed. Invalid signature.',
      });
      return;
    }

    // Update user to premium
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found.',
      });
      return;
    }

    user.isPremium = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (user as any).paymentId = razorpay_payment_id;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (user as any).uploadCount = 0; // Reset upload count
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (user as any).maxUploads = parseInt(process.env.PREMIUM_UPLOAD_LIMIT || '5');
    await user.save();

    // Create payment record
    const payment = new Payment({
      userId: user._id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      email: user.email,
      plan: 'premium',
      amount: 50, // 50 rupees
      currency: 'INR',
      status: 'completed',
    });
    await payment.save();

    // Send confirmation email
    try {
      await emailService.sendPaymentConfirmation(
        user.email,
        user.name,
        'premium',
        50
      );
    } catch (emailError) {
      console.error('Failed to send payment confirmation:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully! You now have 5 resume uploads.',
      data: {
        isPremium: user.isPremium,
        uploadCount: 0,
        maxUploads: 5,
      },
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify payment.',
    });
  }
};

/**
 * Razorpay webhook handler
 * POST /api/payment/webhook/razorpay
 */
export const razorpayWebhook = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    const signature = req.headers['x-razorpay-signature'] as string;

    const shasum = crypto.createHmac('sha256', webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest !== signature) {
      res.status(400).json({
        success: false,
        error: 'Invalid webhook signature.',
      });
      return;
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured') {
      const orderId = payload.payment.entity.order_id;
      const paymentId = payload.payment.entity.id;

      // Find user by order ID and update
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user = await User.findOne({ razorpayOrderId: orderId } as any);
      if (user) {
        user.isPremium = true;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (user as any).paymentId = paymentId;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (user as any).uploadCount = 0;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (user as any).maxUploads = parseInt(process.env.PREMIUM_UPLOAD_LIMIT || '5');
        await user.save();
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    res.status(500).json({
      success: false,
      error: 'Webhook processing failed.',
    });
  }
};

/**
 * Get payment status
 * GET /api/payment/status
 */
export const getPaymentStatus = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required.',
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found.',
      });
      return;
    }

    const payments = await Payment.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        isPremium: user.isPremium,
        premiumExpiresAt: user.premiumExpiresAt,
        payments,
      },
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get payment status.',
    });
  }
};

/**
 * Get payment history
 * GET /api/payment/history
 */
export const getPaymentHistory = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required.',
      });
      return;
    }

    const payments = await Payment.find({ userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { payments },
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get payment history.',
    });
  }
};
