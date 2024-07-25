import { Listener, OrderCreatedEvent, Subjects } from '@komtickets/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedEventPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    // find the ticket the order is trying to reserve
    const ticket = await Ticket.findById(data.ticket.id);
    // if not ticket found throw an exception
    if (!ticket) {
      throw new Error('No ticket found');
    }
    // Mark the ticket as reserved by setting the orderId property
    ticket.set({ orderId: data.id });
    // save the ticket
    await ticket.save();

    // publish an event for ticket updated
    await new TicketUpdatedEventPublisher(this.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
      orderId: ticket.orderId,
    });

    // ack the message
    msg.ack();
  }
}
