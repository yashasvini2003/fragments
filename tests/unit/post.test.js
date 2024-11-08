// tests/unit/get.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('POST /v1/fragments (Credential, Unauthorized, Unauthenticated, Plain Text Creation)', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('Unauthenticated requests are denied', () => request(app).post('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('Incorrect credentials are denied', () =>
    request(app).post('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('Authenticated users get a fragment with ok status', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1')
      .send('fragment Data');

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toBeDefined();
    expect(typeof res.body.fragment).toBe('object');
    expect(res.body.fragment.id).toBeDefined();
    expect(res.body.fragment.ownerId).toBeDefined();
    expect(res.body.fragment.type).toBe('text/plain');
    expect(res.body.fragment.size).toBe(Buffer.byteLength('fragment Data'));
    expect(res.body.fragment.created).toBeDefined();
    expect(res.body.fragment.updated).toBeDefined();
    expect(new URL(res.headers.location).pathname).toBe(`/v1/fragments/${res.body.fragment.id}`);
  });

  // Using a valid username/password pair with unsupported mediatype should get 415 error
  test('Authenticated users with unsupported mediatype should get 415 error', async () => {
    let type = 'unsupported/unsupported';
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', type)
      .auth('user1@email.com', 'password1')
      .send('fragment Data');

    expect(res.statusCode).toBe(415);
    expect(res.body.status).toBe('error');
    expect(res.body.error.code).toBe(415);
    expect(res.body.error.message).toBeDefined();
  });
});

describe('POST /v1/fragments (Texts - JSON, HTML, Markdown)', () => {
  test('Authorized user should create a fragment with content type application/json', async () => {
    const jsonString = JSON.stringify(
      {
        name: 'test',
        age: 20,
        marks: 55.2244,
      },
      null,
      2
    );

    const response = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'application/json')
      .auth('user1@email.com', 'password1')
      .send(jsonString);

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('ok');
    expect(response.body.fragment.id).toBeDefined();
    expect(response.body.fragment.type).toBe('application/json');
  });

  test('Authorized user should get an Error response with content type application/json and invalid json', async () => {
    const response = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'application/json')
      .auth('user1@email.com', 'password1')
      .send('invalidJson');

    expect(response.status).toBe(415);
    expect(response.body.status).toBe('error');
    expect(response.body.error.code).toBe(415);
    expect(response.body.error.message).toBeDefined();
  });

  test('Authorized user should create a fragment with content type text/html', async () => {
    const html = '<h1>Hello World</h1><p>This is Paragraph</p>';

    const response = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/html')
      .auth('user1@email.com', 'password1')
      .send(html);

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('ok');
    expect(response.body.fragment.id).toBeDefined();
    expect(response.body.fragment.type).toBe('text/html');
  });

  test('Authorized user should create a fragment with content type text/markdown', async () => {
    const markdown = '### Hello World \n\n ## New Heading \n **dskdajsk** ';

    const response = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/markdown')
      .auth('user1@email.com', 'password1')
      .send(markdown);

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('ok');
    expect(response.body.fragment.id).toBeDefined();
    expect(response.body.fragment.type).toBe('text/markdown');
  });
});
