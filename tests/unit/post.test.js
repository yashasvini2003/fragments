// tests/unit/post.test.js

const request = require('supertest');
const app = require('../../src/app');

describe('POST /v1/fragments (Credential, Unauthorized, Unauthenticated, Plain Text Creation)', () => {
  test('Unauthenticated requests are denied', () => request(app).post('/v1/fragments').expect(401));

  test('Incorrect credentials are denied', () =>
    request(app).post('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  test('Authenticated users get a fragment with ok status', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1') // Ensure these credentials exist in your test DB
      .send('fragment Data');

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
  });

  test('fragment without data does not work', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1') // Ensure these credentials exist in your test DB
      .set('Content-Type', 'text/plain')
      .send(''); // Sending an empty string to simulate no data
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe('error');
  });

  test('unsupported fragment types are denied', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1') // Ensure these credentials exist in your test DB
      .set('Content-Type', 'application/xml')
      .send('<name>fragment</name>');
    expect(res.statusCode).toBe(415);
    expect(res.body.status).toBe('error');
  });

  test('Authenticated users with unsupported mediatype should get 415 error', async () => {
    let type = 'unsupported/unsupported';
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', type)
      .auth('user1@email.com', 'password1') // Ensure these credentials exist in your test DB
      .send('fragment Data');

    expect(res.statusCode).toBe(415);
    expect(res.body.status).toBe('error');
    expect(res.body.error.code).toBe(415);
    expect(res.body.error.message).toBeDefined();
  });
});
