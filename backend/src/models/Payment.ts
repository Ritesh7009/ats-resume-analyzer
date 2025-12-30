import mongoose, { Schema, Document } from 'mongoose';
import { IPayment } from '../types';

export interface IPaymentDocument extends Omit<IPayment, '_id'>, Document {}

const paymentSchema = new Schema<IPaymentDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId as any,
      ref: 'User',
      required: true,
      index: true,
    },
    gumroadOrderId: {
      type: String,
      required: true,
      unique: true,
    },
    gumroadSaleId: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    plan: {
      type: String,
      enum: ['basic', 'premium', 'enterprise'],
      default: 'basic',
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'refunded', 'failed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ gumroadOrderId: 1 });
paymentSchema.index({ status: 1 });

export const Payment = mongoose.model<IPaymentDocument>('Payment', paymentSchema);
