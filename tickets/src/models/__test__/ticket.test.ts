import { Ticket } from '../ticket';
import request from 'supertest';
import { app } from '../../app';

it('impliments optimistic concurrency control', async () => {
  // create an instance of a ticket
  const ticket = Ticket.build({
    title: 'Test Title',
    price: 100,
    userId: 'testUserId',
  });
  // save the ticket to the database
  await ticket.save();
  // fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);
  // make two seperate changes to the tickets we fetched
  firstInstance!.set({ price: 200 });
  secondInstance!.set({ price: 300 });
  // save the first fetched ticket
  firstInstance!.save();
  // save the second fetched ticket and expect an error

  try {
    await secondInstance!.save();
  } catch (err) {
    return;
  }

  throw new Error('Should not reach this point');
});

it('increments the version number on multiple saves', async () => {
  const ticket = Ticket.build({
    title: 'Ticket',
    price: 100,
    userId: 'userId',
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
});
