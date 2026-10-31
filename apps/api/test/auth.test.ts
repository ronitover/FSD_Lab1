import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.ts';

const app = createApp();

describe('authentication', () => {
  it.each([
    ['GET', '/api/me'],
    ['GET', '/api/donations/mine'],
    ['POST', '/api/donations'],
    ['GET', '/api/donations/nearby?lat=12.97&lng=77.6'],
    ['POST', '/api/donations/00000000-0000-0000-0000-000000000000/claim'],
    ['GET', '/api/geocode?q=MG%20Road'],
    ['GET', '/api/admin/ngos'],
  ])('%s %s needs a signed-in user', async (method, path) => {
    const res = await request(app)[method === 'GET' ? 'get' : 'post'](path);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('rejects a token that is not a valid JWT', async () => {
    const res = await request(app).get('/api/me').set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });

  it('rejects a non-Bearer Authorization header', async () => {
    const res = await request(app).get('/api/me').set('Authorization', 'Basic dXNlcjpwYXNz');
    expect(res.status).toBe(401);
  });
});
