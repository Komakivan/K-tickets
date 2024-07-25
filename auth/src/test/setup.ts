import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import request from 'supertest';

declare global {
  var signin: () => Promise<string[]>;
}

// before all tests begin, we need to connect to the mongo memory server

let mongo: any;

beforeAll(async () => {
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

global.signin = async () => {
  const email = 'test@gmail.com';
  const password = 'password';

  const response = await request(app)
    .post('/api/users/signup')
    .send({ email, password })
    .expect(201);

  const cookie = response.get('Set-Cookie') as string[];

  return cookie;
};
