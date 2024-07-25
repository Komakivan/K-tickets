import request from 'supertest';
import { app } from '../../app';

it('Fails when email does not exist in database', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({ email: 'foo@example.com', password: 'password' })
    .expect(400);
});

it('Fails when an incorrect password is provided', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@example.com', password: 'password' })
    .expect(201);
  await request(app)
    .post('/api/users/signin')
    .send({ email: 'test@example.com', password: '76844' })
    .expect(400);
});

it('Responds with a cookie when given valid credentials', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@example.com', password: 'password' })
    .expect(201);

  const response = await request(app)
    .post('/api/users/signin')
    .send({ email: 'test@example.com', password: 'password' })
    .expect(200);

  expect(response.get('Set-Cookie')).toBeDefined();
});
