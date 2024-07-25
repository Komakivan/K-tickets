import mongoose from 'mongoose';
import { natsWrapper } from './nats-wrapper';
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';
import { OrderCreatedListener } from './events/listeners/order-created-listener';

import { app } from './app';

async function BootServer() {
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

    new OrderCancelledListener(natsWrapper.client).listen();
    new OrderCreatedListener(natsWrapper.client).listen();

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected Payments to MongoDB');
  } catch (error) {
    console.log(error);
  }
  app.listen(3001, () => {
    console.log('TicketsServer Listening on port 3001 !!');
  });
}

BootServer();
