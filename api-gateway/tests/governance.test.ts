import request from 'supertest';
import app from '../src/app';

describe('API Governance & Lifecycle', () => {
  const userApiKey = 'test-user-key'; // Replace with a real key or mock auth
  const adminApiKey = 'test-admin-key';
  let apiId: number;

  beforeAll(async () => {
    // Create an API in draft status
    const res = await request(app)
      .post('/apis')
      .set('x-api-key', adminApiKey)
      .send({ name: 'Governance API', version: '1', basePath: '/gov', defaultVersion: true, lifecycleStatus: 'draft' });
    apiId = res.body.id;
  });

  it('should block access to draft API', async () => {
    const res = await request(app)
      .get('/api/v1/gov')
      .set('x-api-key', userApiKey);
    expect(res.status).toBe(403);
  });

  it('should allow access to published API', async () => {
    await request(app)
      .put(`/apis/${apiId}`)
      .set('x-api-key', adminApiKey)
      .send({ lifecycleStatus: 'published' });
    const res = await request(app)
      .get('/api/v1/gov')
      .set('x-api-key', userApiKey);
    expect([200, 404]).toContain(res.status); // 404 if no backend, 200 if mocked
  });

  it('should warn for deprecated API', async () => {
    await request(app)
      .put(`/apis/${apiId}`)
      .set('x-api-key', adminApiKey)
      .send({ lifecycleStatus: 'deprecated' });
    const res = await request(app)
      .get('/api/v1/gov')
      .set('x-api-key', userApiKey);
    expect(res.headers['warning']).toBeDefined();
  });

  it('should block access to retired API', async () => {
    await request(app)
      .put(`/apis/${apiId}`)
      .set('x-api-key', adminApiKey)
      .send({ lifecycleStatus: 'retired' });
    const res = await request(app)
      .get('/api/v1/gov')
      .set('x-api-key', userApiKey);
    expect(res.status).toBe(410);
  });
}); 