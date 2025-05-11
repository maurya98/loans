import request from 'supertest';
import app from '../src/app';

describe('API Key Self-Service', () => {
  let apiKeyId: number;
  const userJwt = 'test-user-jwt'; // Replace with a real JWT or mock auth
  const apiId = 1; // Use a real API ID or create one in setup

  it('should create an API key for the user', async () => {
    const res = await request(app)
      .post('/my/apikeys')
      .set('Authorization', `Bearer ${userJwt}`)
      .send({ apiId });
    expect(res.status).toBe(201);
    expect(res.body.apiId).toBe(apiId);
    apiKeyId = res.body.id;
  });

  it('should list user API keys', async () => {
    const res = await request(app)
      .get('/my/apikeys')
      .set('Authorization', `Bearer ${userJwt}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should revoke (delete) the API key', async () => {
    const res = await request(app)
      .delete(`/my/apikeys/${apiKeyId}`)
      .set('Authorization', `Bearer ${userJwt}`);
    expect(res.status).toBe(204);
  });
}); 