import { OrderCreatedEvent, OrderStatus } from '@komtickets/common';
import { Ticket } from '../../../models/ticket';
import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  // create a listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // creata a new ticket
  const ticket = Ticket.build({
    title: 'Ticket',
    price: 100,
    userId: 'hjdguwyted',
  });

  await ticket.save();

  // create a data event
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    userId: 'jhbjht',
    expiresAt: '56789',
    version: 0,
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  // fake message object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg };
};

it('sets the userId property of the ticket object', async () => {
  const { listener, data, ticket, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
  const { listener, msg, data } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
  const ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  console.log(ticketUpdatedData);
  expect(data.id).toEqual(ticketUpdatedData.orderId);
});
