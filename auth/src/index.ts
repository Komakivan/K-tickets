import mongoose from 'mongoose';

import { app } from './app';

async function BootServer() {
  console.log('Starting up ...');

  if (!process.env.JWT_KEY) {
    throw new Error('JWT secrete missing');
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI missing');
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to Auth MongoDB');
  } catch (error) {
    console.log(error);
  }
  app.listen(4000, () => {
    console.log('AuthServer Listening on port 3000 !!');
  });
}

BootServer();
