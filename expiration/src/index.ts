import { natsWrapper } from './nats-wrapper';
import { OrderCreatedListener } from './events/listeners/order-created-listener';

async function BootServer() {
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

    console.log('REDIS: ', process.env.REDIS_HOST);

    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    new OrderCreatedListener(natsWrapper.client).listen();
  } catch (error) {
    console.log(error);
  }
}

BootServer();
