import { TicketCreatedEvent } from '@komtickets/common';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketCreatedEventListener } from '../ticket-created-listener';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // create an instance of a listener
  const listener = new TicketCreatedEventListener(natsWrapper.client);
  // create a fake data event
  const data: TicketCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 450,
    version: 0,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };
  // create a fake message object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(), // this feature is to mock a function call
  };

  return { listener, data, msg };
};

it('creates and saves a ticket', async () => {
  // create the onMessage method with the data object + message object
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  // write assertions to make sure the ticket was created
  const ticket = await Ticket.findById(data.id);
  expect(ticket).toBeDefined();
  expect(ticket?.title).toEqual(data.title);
  expect(ticket?.price).toEqual(data.price);
});

it('acks a message', async () => {
  // create the onMessage method with the data object + message object
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  // write assertions to make sure the ack() method was called
  expect(msg.ack).toHaveBeenCalled();
});
