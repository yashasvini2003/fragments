// tests/unit/health.test.js

const request = require('supertest');

// Get our Express app object (we don't need the server part)
const app = require('../../src/app');

// Get the version and author from our package.json
const { version, author } = require('../../package.json');

describe('/ health check', () => {
  test('should return HTTP 200 response', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
  });

  test('should return Cache-Control: no-cache header', async () => {
    const res = await request(app).get('/');
    expect(res.headers['cache-control']).toEqual('no-cache');
  });

  test('should return status: ok in response', async () => {
    const res = await request(app).get('/');
    expect(res.body.status).toEqual('ok');
  });

  test('should return correct version, githubUrl, and author in response', async () => {
    const res = await request(app).get('/');
    expect(res.body.author).toEqual(author);
    expect(res.body.githubUrl.startsWith('https://github.com/')).toBe(true);
    expect(res.body.version).toEqual(version);
  });

  test('GET /nonexistent should return status 404 and an error message', async () => {
    const response = await request(app).get('/nonexistent');

    expect(response.status).toBe(404);
    expect(response.body.status).toBe('error');
    expect(response.body.error.message).toBe('not found');
    expect(response.body.error.code).toBe(404);
  });
});
