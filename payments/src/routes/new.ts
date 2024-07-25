import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import {
  requireAuth,
  NotFoundError,
  ValidateRquest,
  BadRequestError,
  NotAuthorizedError,
  OrderStatus,
} from '@komtickets/common';
import { Order } from '../models/orders';
import { stripe } from '../stripe';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
  '/api/payments',
  requireAuth,
  [
    body('token').not().isEmpty().withMessage('Token is required'),
    body('orderId')
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('Valid orderId is required'),
  ],
  ValidateRquest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError('order not found');
    }

    // make sure the person paying is the same person who made the order
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    // check if the order is cancelled
    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('order is already cancelled');
    }

    const payment_method = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        token: token,
      },
    });

    const charge = await stripe.paymentIntents.create({
      currency: 'usd',
      amount: order.price * 100, // Convert dollars to cents
      payment_method: payment_method.id,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
    });

    const payment = Payment.build({
      orderId,
      stripeId: charge.id,
    });

    await payment.save();

    console.log('PAYMENT', payment);

    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.ordeId,
      stripeId: payment.stripeId,
    });

    res.status(201).send({ payment });
  }
);

export { router as createChargeRoute };
