import request from 'supertest';
import app from '../src/app';

describe('API Management', () => {
  let apiId: number;
  const adminApiKey = 'test-admin-key'; // Replace with a real key or mock auth

  it('should create an API', async () => {
    const res = await request(app)
      .post('/apis')
      .set('x-api-key', adminApiKey)
      .send({ name: 'Test API', version: '1', basePath: '/test', defaultVersion: true, lifecycleStatus: 'published' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test API');
    apiId = res.body.id;
  });

  it('should get the API', async () => {
    const res = await request(app)
      .get(`/apis/${apiId}`)
      .set('x-api-key', adminApiKey);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(apiId);
  });

  it('should update the API', async () => {
    const res = await request(app)
      .put(`/apis/${apiId}`)
      .set('x-api-key', adminApiKey)
      .send({ name: 'Test API Updated' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Test API Updated');
  });

  it('should delete the API', async () => {
    const res = await request(app)
      .delete(`/apis/${apiId}`)
      .set('x-api-key', adminApiKey);
    expect(res.status).toBe(204);
  });
}); 