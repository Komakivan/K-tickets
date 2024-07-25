import { TicketUpdatedEventListener } from '../ticket-updated-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import mongoose from 'mongoose';
import { TicketUpdatedEvent } from '@komtickets/common';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  // create a listener
  const listener = new TicketUpdatedEventListener(natsWrapper.client);
  // create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Concert',
    price: 200,
  });
  await ticket.save();
  //create a fake data object
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    title: 'Updated',
    price: 400,
    version: ticket.version + 1,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };
  //create a fake message object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, ticket };
};

it('finds and updates a ticket', async () => {
  const { listener, data, ticket, msg } = await setup();

  await listener.onMessage(data, msg);

  const upadatedTicket = await Ticket.findById(ticket.id);
  expect(upadatedTicket?.title).toEqual(data.title);
  expect(upadatedTicket?.price).toEqual(data.price);
  expect(upadatedTicket?.version).toEqual(data.version);
});
it('acks the message', async () => {
  const { listener, data, msg, ticket } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('does not call the ack method if event is out of order', async () => {
  const { listener, data, msg, ticket } = await setup();

  data.version = 20;

  try {
    await listener.onMessage(data, msg);
  } catch (error) {}

  expect(msg.ack).not.toHaveBeenCalled();
});
