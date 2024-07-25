import express, { Request, Response } from 'express';
import { Ticket } from '../models/ticket';
import {
  requireAuth,
  ValidateRquest,
  NotFoundError,
  NotAuthorizedError,
  BadRequestError,
} from '@komtickets/common';
import { body } from 'express-validator';
import { natsWrapper } from '../nats-wrapper';
import { TicketUpdatedEventPublisher } from '../events/publishers/ticket-updated-publisher';

const router = express.Router();

router.put(
  '/api/tickets/:id',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('Title must be provided'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater than 0'),
  ],
  ValidateRquest,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      throw new NotFoundError('ticket not found');
    }

    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    if (ticket.orderId !== undefined) {
      throw new BadRequestError('cannot edit a reserved ticket');
    }

    ticket.set({
      title: req.body.title,
      price: req.body.price,
    });

    await ticket.save();
    await new TicketUpdatedEventPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    });

    res.status(200).send(ticket);
  }
);

export { router as UpdateTicketRouter };
