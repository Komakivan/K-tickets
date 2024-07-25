import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

it('has a routes handler listening to /api/tickets for post requests', async () => {
  const response = await request(app).post('/api/tickets').send({});

  expect(response.status).not.toEqual(404);
});

it('can only be accessed if a user is authenticated', async () => {
  const response = await request(app).post('/api/tickets').send({});

  expect(response.status).toEqual(401);
});

it('returns a status other than 401 if user is signed in', async () => {
  console.log(signin());

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send({});

  expect(response.status).not.toEqual(401);
});

it('returns an Error if invalid title is provived', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send({ price: 10 })
    .expect(400);
});

it('returns an Error if an invalid price is provived', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send({ title: '' })
    .expect(400);
});

it('creates a ticket with valid inputs', async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send({ title: 'Test', price: 45.5 })
    .expect(201);

  tickets = await Ticket.find({});
  console.log(tickets);
  expect(tickets[0].title).toEqual('Test');
  expect(tickets[0].price).toEqual(45.5);
});
