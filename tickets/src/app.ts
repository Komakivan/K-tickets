import express from 'express';
import 'express-async-errors';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@komtickets/common';

import { TicketRouter } from './routes/new';
import { IndexTicketRouter } from './routes';
import { UpdateTicketRouter } from './routes/update';
import { ShowTicketRouter } from './routes/show';

const app = express();

app.set('trust proxy', true); // this is because we are using nginx for reverse proxy
app.use(express.json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);

app.use(currentUser);

app.use(TicketRouter);
app.use(IndexTicketRouter);
app.use(UpdateTicketRouter);
app.use(ShowTicketRouter);

app.all('*', async () => {
  throw new NotFoundError('Route not found');
});

app.use(errorHandler);

export { app };
