import mongoose from 'mongoose';
import { natsWrapper } from './nats-wrapper';
import { TicketCreatedEventListener } from './events/listeners/ticket-created-listener';
import { TicketUpdatedEventListener } from './events/listeners/ticket-updated-listener';
import { ExpirationCompleteListener } from './events/listeners/expiration-complete-listener';
import { PaymentCreatedListener } from './events/listeners/payment-created-listener';

import { app } from './app';

async function BootServer() {
  console.log('Starting...');

  if (!process.env.JWT_KEY) {
    throw new Error('JWT secrete missing');
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI missing');
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID missing');
  }
  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL missing');
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID missing');
  }

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );
    /*
      The below code will enable the nats server to gracefully shutdown 
    */
    natsWrapper.client.on('close', () => {
      console.log('NATS gracefully shut down');
      process.exit();
    });

    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    new TicketCreatedEventListener(natsWrapper.client).listen();
    new TicketUpdatedEventListener(natsWrapper.client).listen();
    new ExpirationCompleteListener(natsWrapper.client).listen();
    new PaymentCreatedListener(natsWrapper.client).listen();

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected Orders to MongoDB');
  } catch (error) {
    console.log(error);
  }
  app.listen(6000, () => {
    console.log('OrderServer Listening on port 6000 !!');
  });
}

BootServer();
