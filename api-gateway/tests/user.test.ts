import request from 'supertest';
import app from '../src/app';

describe('User Management', () => {
  let userId: number;
  const adminApiKey = 'test-admin-key'; // Replace with a real key or mock auth

  it('should create a user', async () => {
    const res = await request(app)
      .post('/users')
      .set('x-api-key', adminApiKey)
      .send({ username: 'testuser', email: 'testuser@example.com', password: 'password', role: 'user' });
    expect(res.status).toBe(201);
    expect(res.body.username).toBe('testuser');
    userId = res.body.id;
  });

  it('should get the user', async () => {
    const res = await request(app)
      .get(`/users/${userId}`)
      .set('x-api-key', adminApiKey);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(userId);
  });

  it('should update the user', async () => {
    const res = await request(app)
      .put(`/users/${userId}`)
      .set('x-api-key', adminApiKey)
      .send({ username: 'testuser2' });
    expect(res.status).toBe(200);
    expect(res.body.username).toBe('testuser2');
  });

  it('should delete the user', async () => {
    const res = await request(app)
      .delete(`/users/${userId}`)
      .set('x-api-key', adminApiKey);
    expect(res.status).toBe(204);
  });
}); 