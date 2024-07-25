import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';

it('returns a 404 if a ticket is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app).get(`/api/tickets/:${id}`).send({}).expect(404);
});

it("returns a ticket if it's found", async () => {
  // lets first create a ticket

  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send({
      title: 'Test Ticket',
      price: '123',
    })
    .expect(201);

  const response = await request(app)
    .get(`/api/tickets/:${res.body.id}`)
    .send({})
    .expect(200);
  expect(response.body.title).toEqual('Test Ticket');
  expect(response.body.price).toEqual('123');
});
