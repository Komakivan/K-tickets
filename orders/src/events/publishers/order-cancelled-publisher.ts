import { Publisher, Subjects, OrderCancelledEvent } from '@komtickets/common';

export class OrderCancelledEventPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
