import { Listener, OrderCancelledEvent, Subjects } from '@komtickets/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { TicketUpdatedEventPublisher } from '../publishers/ticket-updated-publisher';
import { Ticket } from '../../models/ticket';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    // get the ticket from database

    const ticket = await Ticket.findById(data.ticket.id);

    if (!ticket) {
      throw new Error('No ticket found');
    }

    ticket.set({ orderId: undefined });
    await ticket.save();

    await new TicketUpdatedEventPublisher(this.client).publish({
      id: ticket.id,
      title: ticket.title,
      userId: ticket.userId,
      version: ticket.version,
      orderId: ticket.orderId,
      price: ticket.price,
    });

    msg.ack();
  }
}
