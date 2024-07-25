import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
  ValidateRquest,
} from '@komtickets/common';
import express, { Request, Response } from 'express';
import { param } from 'express-validator';
import mongoose from 'mongoose';
import { Order } from '../models/order';

const router = express.Router();

router.get(
  '/api/orders/:orderId',
  requireAuth,
  [
    param('orderId')
      .notEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('Valid orderId must be provided'),
  ],
  ValidateRquest,
  async (req: Request, res: Response) => {
    const orderId = req.params.orderId;
    console.log('OrderID:', orderId);

    const order = await Order.findById(orderId).populate('ticket');

    if (!order) {
      console.log('Order not found');
      throw new NotFoundError('order not found');
    }

    if (order.userId !== req.currentUser!.id) {
      console.log('Not authorized');
      throw new NotAuthorizedError();
    }

    console.log('Order found:', order);
    res.status(200).send(order);
  }
);

export { router as showOrderRouter };
