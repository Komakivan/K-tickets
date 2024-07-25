import request from 'supertest';
import { app } from '../../app';

it('returns a 201 on a successful signup', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({ email: 'test@example.com', password: 'testpassword' })
    .expect(201);
});

it('returns a 400 on invalid email', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({ email: 'tesgwiufiru', password: 'testpassword' })
    .expect(400);
});

it('returns a 400 on invalid password', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({ email: 'test@gmail.com', password: 'te' })
    .expect(400);
});

it('returns a 400 with missing email and password', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({ email: '', password: '' })
    .expect(400);
});

it('No ducplicate emails allowed', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@example.com', password: '2576342' })
    .expect(201);

  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@example.com', password: '2576342' })
    .expect(400);
});

it('Sets a cookie after successful signup', async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@example.com', password: '2576342' })
    .expect(201);
  expect(response.get('Set-Cookie')).toBeDefined();
});
