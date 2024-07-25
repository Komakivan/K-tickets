import request from 'supertest';
import { app } from '../../app';

it('should return a current user object', async () => {
  // const authResponse = await request(app)
  //   .post('/api/users/signup')
  //   .send({ email: 'user@example.com', password: 'password' })
  //   .expect(201);

  const cookie = await signin();

  const response = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie)
    .send()
    .expect(200);

  expect(response.body.currentUser?.email).toEqual('test@gmail.com');
});

it('should return with null if not authenticated', async () => {
  const response = await request(app)
    .get('/api/users/currentuser')
    .send({})
    .expect(200);

  expect(response.body.currentUser).toEqual(null);
});
