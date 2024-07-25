import { Message } from 'node-nats-streaming';
import { Listener, TicketUpdatedEvent, Subjects } from '@komtickets/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketUpdatedEventListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    const { id, title, price, version } = data;

    const ticket = await Ticket.findByEvent({ id, version });
    if (!ticket) {
      throw new Error('Could not find ticket');
    }

    ticket.set({ title, price });
    await ticket.save();

    msg.ack();
  }
}
