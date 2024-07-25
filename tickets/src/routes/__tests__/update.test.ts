import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';

it('returns a 404 if the ticket with the given if does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', signin())
    .send({
      title: 'Test Ticket',
      price: 45.0,
    })
    .expect(404);
});
it('returns a 401 if the user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'Test Ticket',
      price: 45.0,
    })
    .expect(401);
});
it('returns a 401 if the user does not own the ticket', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send({
      title: 'Test Ticket',
      price: 45.0,
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.userId}`)
    .set('Cookie', signin())
    .send({
      title: 'Test Ticket',
      price: 45.0,
    })
    .expect(401);
});
it('returns a 400 if the user provides an invalid title or price', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  const cookie = signin();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 45,
      price: '45.0',
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 34,
      price: 'test',
    })
    .expect(400);
});
it('calls the publish method after successfull update', async () => {
  const cookie = signin();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'Test Ticket',
      price: 45.0,
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'Test Ticket updated successfully',
      price: 45.7,
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
