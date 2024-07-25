import { Publisher, Subjects, TicketUpdatedEvent } from '@komtickets/common';

export class TicketUpdatedEventPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
