import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order } from '../../models/orders';
import { OrderStatus } from '@komtickets/common';

import { stripe } from '../../stripe';

jest.mock('../../stripe.ts');

it('returns 404 if order is not found', async () => {
  const response = await request(app)
    .post('/api/payments')
    .set('Cookie', signin())
    .send({
      token: 'bcdvsctdhcnbsd',
      orderId: new mongoose.Types.ObjectId().toHexString(),
    });

  expect(response.status).toBe(404);
});

it('returns 401 id user is not authorized', async () => {
  const response = await request(app).post('/api/payments').send({
    token: 'nbsdhcjvdcjvc',
    orderId: new mongoose.Types.ObjectId().toHexString(),
  });

  expect(response.status).toEqual(401);
});

it('returns 400 if order is cancelled', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    userId: userId,
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 455,
    status: OrderStatus.Cancelled,
  });

  await order.save();

  const response = await request(app)
    .post('/api/payments')
    .set('Cookie', signin(userId))
    .send({
      token: 'chwdjgcklniw',
      orderId: order.id,
    });

  expect(response.status).toEqual(400);
});

it('returns 201 with valid inputs', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    userId: userId,
    version: 0,
    price: 400,
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
  });

  await order.save();

  const response = await request(app)
    .post('/api/payments')
    .set('Cookie', signin(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id,
    });

  const chargeOpts = (stripe.paymentIntents.create as jest.Mock).mock
    .calls[0][0];

  console.log(chargeOpts);

  expect(response.status).toEqual(201);
  expect(stripe.paymentIntents.create).toHaveBeenCalled();
  expect(chargeOpts.currency).toEqual('usd');
  expect(chargeOpts.payment_method).toEqual('tok_visa');
  expect(chargeOpts.amount).toEqual(order.price * 100);
});
