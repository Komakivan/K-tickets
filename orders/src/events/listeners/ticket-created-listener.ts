import { Subjects, Listener, TicketCreatedEvent } from '@komtickets/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';

export class TicketCreatedEventListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    const { id, title, price } = data;

    const ticket = Ticket.build({ id, title, price });
    await ticket.save();

    msg.ack();
  }
}