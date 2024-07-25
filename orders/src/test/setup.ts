import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
  var signin: () => string[];
}

// before all tests begin, we need to connect to the mongo memory server

jest.mock('../nats-wrapper.ts');

let mongo: any;

beforeAll(async () => {
  jest.clearAllMocks();

  process.env.JWT_KEY = '354dvahngdfR^%#'; // not the best way to do it

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {});
});

// before each test runs, we need to delete all the collections in the mongo memory server
beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany();
  }
});

// after all out tests are complete, we should stop the mongo server
afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }

  await mongoose.connection.close();
});

// This is a simmulation of the signin function since we cannot access the auth service
global.signin = () => {
  // create a dammy payload object
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    email: 'user@email.com',
  };

  // create a token out of it
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // create a session object
  const session = { jwt: token };

  // turn it to json
  const sessionJSON = JSON.stringify(session);

  // encode it to base64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  // return a string thats the cookie with session data
  return [`session=${base64}`];
};
