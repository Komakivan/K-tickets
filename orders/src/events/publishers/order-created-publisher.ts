import { Publisher, OrderCreatedEvent, Subjects } from '@komtickets/common';

export class OrderCreatedEventPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
