import express from 'express';
import 'express-async-errors';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@komtickets/common';
import { createChargeRoute } from './routes/new';

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

app.use(createChargeRoute);

app.all('*', async () => {
  throw new NotFoundError('This route does not exist');
});

app.use(errorHandler);

export { app };
