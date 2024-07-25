import express from 'express';
import 'express-async-errors';

import cookieSession from 'cookie-session';

import { signUpRouter } from './routes/signup';
import { signInRouter } from './routes/signin';
import { currentUserRouter } from './routes/current-user';
import { signOutRouter } from './routes/signout';

import { errorHandler, NotFoundError } from '@komtickets/common';

const app = express();

app.set('trust proxy', true); // this is because we are using nginx for reverse proxy
app.use(express.json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);

app.use(currentUserRouter);
app.use(signInRouter);
app.use(signOutRouter);
app.use(signUpRouter);

app.all('*', async () => {
  throw new NotFoundError('route not found');
});

app.use(errorHandler);

export { app };
