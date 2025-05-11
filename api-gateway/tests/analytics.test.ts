import request from 'supertest';
import app from '../src/app';

describe('Analytics', () => {
  const adminApiKey = 'test-admin-key'; // Replace with a real key or mock auth
  const userJwt = 'test-user-jwt'; // Replace with a real JWT or mock auth

  it('should get API usage (admin)', async () => {
    const res = await request(app)
      .get('/analytics/usage')
      .set('x-api-key', adminApiKey);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get user API key usage', async () => {
    const res = await request(app)
      .get('/analytics/my/usage')
      .set('Authorization', `Bearer ${userJwt}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
}); 