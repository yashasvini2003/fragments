// tests/unit/get.test.js

const request = require('supertest');

const app = require('../../src/app');
const fs = require('fs');
const path = require('path');

describe('PUT /v1/fragments/:id (Unauthorized, Unauthenticated, Non-Exixtant ID, Unsupported Data)', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('Unauthenticated requests are denied', () =>
    request(app).put('/v1/fragments/anyid-121jjk2-21jhj982').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('Incorrect credentials are denied', () =>
    request(app)
      .put('/v1/fragments/anyid-121jjk2-21jhj982')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  // If the wrong Id is provided (no such fragment), it should be not found
  test('Non-existant ID receives 404 with Error message', async () => {
    const res = await request(app)
      .put('/v1/fragments/anyid-121jjk2-21jhj982')
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1')
      .send('fragment Data');
    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.code).toBe(404);
    expect(res.body.error.message).toBeDefined();
  });

  // If no is provided (Route doesnt exists), it should be not found
  test('NO ID receives 404 with Error message', async () => {
    const res = await request(app)
      .put('/v1/fragments/')
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1')
      .send('fragment Data');
    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.code).toBe(404);
    expect(res.body.error.message).toBeDefined();
  });

  // If unsupported data should sendback 415
  test('unsupported Data receives 415 with Error message', async () => {
    const res = await request(app)
      .put('/v1/fragments/anyid')
      .set('Content-Type', 'unsupported/unsupported')
      .auth('user1@email.com', 'password1')
      .send('fragment Data');
    expect(res.status).toBe(415);
    expect(res.body.status).toBe('error');
    expect(res.body.error.code).toBe(415);
    expect(res.body.error.message).toBeDefined();
  });
});

describe('PUT /v1/fragments/:id - Text Fragments (Text, Markdown, HTML, JSON)', () => {
  test('Text data can be replaced with Text data with 200 success response. ', async () => {
    // Test Text Fragment
    const textPostRes = await request(app)
      .post('/v1/fragments/')
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1')
      .send('fragment Data@12345_2-!@#$%%&^*&');

    const textId = textPostRes.body.fragment.id;
    const textCreated = textPostRes.body.fragment.created;
    const textUpdated = textPostRes.body.fragment.updated;

    const newTextData = 'New_fragment Data@12481819345_2-!df@f#$%%&^*&';

    const textPutRes = await request(app)
      .put(`/v1/fragments/${textId}`)
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1')
      .send(newTextData);

    expect(textPutRes.statusCode).toBe(200);
    expect(textPutRes.body.status).toBe('ok');
    expect(textPutRes.body.fragment).toBeDefined();
    expect(typeof textPutRes.body.fragment).toBe('object');
    expect(textPutRes.body.fragment.id).toBeDefined();
    expect(textPutRes.body.fragment.ownerId).toBeDefined();
    expect(textPutRes.body.fragment.type).toBe('text/plain');
    expect(textPutRes.body.fragment.size).toBe(Buffer.byteLength(newTextData));
    expect(textPutRes.body.fragment.created).toBe(textCreated); // created should remain the same
    expect(Date.parse(textPutRes.body.fragment.updated)).toBeGreaterThan(Date.parse(textUpdated)); // updated should be greater than previously updated/created fragment.
  });

  test('Any data with ID EXTENSION can be replaced with SAME CONTENT TYPE with 200 success response. ', async () => {
    // Test Text Fragment
    const textPostRes = await request(app)
      .post('/v1/fragments/')
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1')
      .send('fragment Data@12345_2-!@#$%%&^*&');

    const textId = textPostRes.body.fragment.id;
    const textCreated = textPostRes.body.fragment.created;
    const textUpdated = textPostRes.body.fragment.updated;

    const newTextData = 'New_fragment Data@12481819345_2-!df@f#$%%&^*&';

    const textPutRes = await request(app)
      .put(`/v1/fragments/${textId}.txt`)
      .set('Content-Type', 'text/plain')
      .auth('user1@email.com', 'password1')
      .send(newTextData);

    expect(textPutRes.statusCode).toBe(200);
    expect(textPutRes.body.status).toBe('ok');
    expect(textPutRes.body.fragment).toBeDefined();
    expect(typeof textPutRes.body.fragment).toBe('object');
    expect(textPutRes.body.fragment.id).toBeDefined();
    expect(textPutRes.body.fragment.ownerId).toBeDefined();
    expect(textPutRes.body.fragment.type).toBe('text/plain');
    expect(textPutRes.body.fragment.size).toBe(Buffer.byteLength(newTextData));
    expect(textPutRes.body.fragment.created).toBe(textCreated); // created should remain the same
    expect(Date.parse(textPutRes.body.fragment.updated)).toBeGreaterThan(Date.parse(textUpdated)); // updated should be greater than previously updated/created fragment.
  });

  const textResponse = {
    'application/json': JSON.stringify({ key: 'value' }),
    'text/html': '<h1>hello</h1>',
    'text/markdown': '# Hello\nThis is a Markdown document.',
  };

  Object.keys(textResponse).forEach((contentType) => {
    test(`Text data cannot be replaced with ${contentType} data.`, async () => {
      // Test Text Fragment
      const textPostRes = await request(app)
        .post('/v1/fragments/')
        .set('Content-Type', 'text/plain')
        .auth('user1@email.com', 'password1')
        .send('fragment Data@12345_2-!@#$%%&^*&');

      const id = textPostRes.body.fragment.id;

      const content = textResponse[contentType];

      const replaceWithJsonRes = await request(app)
        .put(`/v1/fragments/${id}`)
        .set('Content-Type', contentType)
        .auth('user1@email.com', 'password1')
        .send(content);

      expect(replaceWithJsonRes.statusCode).toBe(400);
      expect(replaceWithJsonRes.body.status).toBe('error');
      expect(replaceWithJsonRes.body.error.code).toBe(400);
      expect(replaceWithJsonRes.body.error.message).toBeDefined();
    });
  });

  test('Markdown data can be replaced with Markdwon data with 200 success response. ', async () => {
    // Test Markdown Fragment
    const markdownPostRes = await request(app)
      .post('/v1/fragments/')
      .set('Content-Type', 'text/markdown')
      .auth('user1@email.com', 'password1')
      .send('# Markdown Fragment');

    const markdownId = markdownPostRes.body.fragment.id;
    const markdownCreated = markdownPostRes.body.fragment.created;
    const markdownUpdated = markdownPostRes.body.fragment.updated;

    const newMarkdownData = '## Updated Markdown Fragment';

    const markdownPutRes = await request(app)
      .put(`/v1/fragments/${markdownId}`)
      .set('Content-Type', 'text/markdown')
      .auth('user1@email.com', 'password1')
      .send(newMarkdownData);

    expect(markdownPutRes.statusCode).toBe(200);
    expect(markdownPutRes.body.status).toBe('ok');
    expect(markdownPutRes.body.fragment).toBeDefined();
    expect(typeof markdownPutRes.body.fragment).toBe('object');
    expect(markdownPutRes.body.fragment.id).toBeDefined();
    expect(markdownPutRes.body.fragment.ownerId).toBeDefined();
    expect(markdownPutRes.body.fragment.type).toBe('text/markdown');
    expect(markdownPutRes.body.fragment.size).toBe(Buffer.byteLength(newMarkdownData));
    expect(markdownPutRes.body.fragment.created).toBe(markdownCreated); // created should remain the same
    expect(Date.parse(markdownPutRes.body.fragment.updated)).toBeGreaterThan(
      Date.parse(markdownUpdated)
    ); // updated should be greater than previously updated/created fragment.
  });

  const markdownResponse = {
    'application/json': JSON.stringify({ key: 'value' }),
    'text/html': '<h1>hello</h1>',
    'text/plain': 'Hello, this is plain text.',
  };

  Object.keys(markdownResponse).forEach((contentType) => {
    test(`Markdown data cannot be replaced with ${contentType} data.`, async () => {
      // Create Markdown Fragment
      const markdownPostRes = await request(app)
        .post('/v1/fragments/')
        .set('Content-Type', 'text/markdown')
        .auth('user1@email.com', 'password1')
        .send('# Markdown Fragment');

      const id = markdownPostRes.body.fragment.id;

      const content = markdownResponse[contentType];

      const replaceWithRes = await request(app)
        .put(`/v1/fragments/${id}`)
        .set('Content-Type', contentType)
        .auth('user1@email.com', 'password1')
        .send(content);

      expect(replaceWithRes.statusCode).toBe(400);
      expect(replaceWithRes.body.status).toBe('error');
      expect(replaceWithRes.body.error.code).toBe(400);
      expect(replaceWithRes.body.error.message).toBeDefined();
    });
  });

  test('JSON data can be replaced with JSON data with 200 success response.', async () => {
    // Test JSON Fragment
    const jsonPostRes = await request(app)
      .post('/v1/fragments/')
      .set('Content-Type', 'application/json')
      .auth('user1@email.com', 'password1')
      .send('{"key": "value"}');

    const jsonId = jsonPostRes.body.fragment.id;
    const jsonCreated = jsonPostRes.body.fragment.created;
    const jsonUpdated = jsonPostRes.body.fragment.updated;

    const newJsonData = '{"key": "updated_value"}';

    const jsonPutRes = await request(app)
      .put(`/v1/fragments/${jsonId}`)
      .set('Content-Type', 'application/json')
      .auth('user1@email.com', 'password1')
      .send(newJsonData);

    expect(jsonPutRes.statusCode).toBe(200);
    expect(jsonPutRes.body.status).toBe('ok');
    expect(jsonPutRes.body.fragment).toBeDefined();
    expect(typeof jsonPutRes.body.fragment).toBe('object');
    expect(jsonPutRes.body.fragment.id).toBeDefined();
    expect(jsonPutRes.body.fragment.ownerId).toBeDefined();
    expect(jsonPutRes.body.fragment.type).toBe('application/json');
    expect(jsonPutRes.body.fragment.size).toBe(Buffer.byteLength(newJsonData));
    expect(jsonPutRes.body.fragment.created).toBe(jsonCreated); // created should remain the same
    expect(Date.parse(jsonPutRes.body.fragment.updated)).toBeGreaterThan(Date.parse(jsonUpdated)); // updated should be greater than previously updated/created fragment.
  });

  const jsonResponse = {
    'text/html': '<h1>hello</h1>',
    'text/markdown': '# Hello\nThis is a Markdown document.',
    'text/plain': 'Hello, this is plain text.',
  };

  Object.keys(jsonResponse).forEach((contentType) => {
    test(`JSON data cannot be replaced with ${contentType} data.`, async () => {
      // Create JSON Fragment
      const jsonPostRes = await request(app)
        .post('/v1/fragments/')
        .set('Content-Type', 'application/json')
        .auth('user1@email.com', 'password1')
        .send('{"key": "value"}');

      const id = jsonPostRes.body.fragment.id;

      const content = jsonResponse[contentType];

      const replaceWithRes = await request(app)
        .put(`/v1/fragments/${id}`)
        .set('Content-Type', contentType)
        .auth('user1@email.com', 'password1')
        .send(content);

      expect(replaceWithRes.statusCode).toBe(400);
      expect(replaceWithRes.body.status).toBe('error');
      expect(replaceWithRes.body.error.code).toBe(400);
      expect(replaceWithRes.body.error.message).toBeDefined();
    });
  });

  test('HTML data can be replaced with HTML data with 200 success response.', async () => {
    // Test HTML Fragment
    const htmlPostRes = await request(app)
      .post('/v1/fragments/')
      .set('Content-Type', 'text/html')
      .auth('user1@email.com', 'password1')
      .send('<h1>HTML Fragment</h1>');

    const htmlId = htmlPostRes.body.fragment.id;
    const htmlCreated = htmlPostRes.body.fragment.created;
    const htmlUpdated = htmlPostRes.body.fragment.updated;

    const newHtmlData = '<h1>Updated HTML Fragment</h1>';

    const htmlPutRes = await request(app)
      .put(`/v1/fragments/${htmlId}`)
      .set('Content-Type', 'text/html')
      .auth('user1@email.com', 'password1')
      .send(newHtmlData);

    expect(htmlPutRes.statusCode).toBe(200);
    expect(htmlPutRes.body.status).toBe('ok');
    expect(htmlPutRes.body.fragment).toBeDefined();
    expect(typeof htmlPutRes.body.fragment).toBe('object');
    expect(htmlPutRes.body.fragment.id).toBeDefined();
    expect(htmlPutRes.body.fragment.ownerId).toBeDefined();
    expect(htmlPutRes.body.fragment.type).toBe('text/html');
    expect(htmlPutRes.body.fragment.size).toBe(Buffer.byteLength(newHtmlData));
    expect(htmlPutRes.body.fragment.created).toBe(htmlCreated); // created should remain the same
    expect(Date.parse(htmlPutRes.body.fragment.updated)).toBeGreaterThan(Date.parse(htmlUpdated)); // updated should be greater than previously updated/created fragment.
  });

  const htmlResponse = {
    'application/json': JSON.stringify({ key: 'value' }),
    'text/markdown': '# Hello\nThis is a Markdown document.',
    'text/plain': 'Hello, this is plain text.',
  };

  Object.keys(htmlResponse).forEach((contentType) => {
    test(`HTML data cannot be replaced with ${contentType} data.`, async () => {
      // Create HTML Fragment
      const htmlPostRes = await request(app)
        .post('/v1/fragments/')
        .set('Content-Type', 'text/html')
        .auth('user1@email.com', 'password1')
        .send('<h1>HTML Fragment</h1>');

      const id = htmlPostRes.body.fragment.id;

      const content = htmlResponse[contentType];

      const replaceWithRes = await request(app)
        .put(`/v1/fragments/${id}`)
        .set('Content-Type', contentType)
        .auth('user1@email.com', 'password1')
        .send(content);

      expect(replaceWithRes.statusCode).toBe(400);
      expect(replaceWithRes.body.status).toBe('error');
      expect(replaceWithRes.body.error.code).toBe(400);
      expect(replaceWithRes.body.error.message).toBeDefined();
    });
  });
});

describe('PUT /v1/fragments/:id - Image Fragments (PNG, GIF, JPG/JPEG, WEBP)', () => {
  const originalImageData = {
    'image/png': fs.readFileSync(path.join(__dirname, '../images/test.png')),
    'image/jpeg': fs.readFileSync(path.join(__dirname, '../images/test.jpg')),
    'image/gif': fs.readFileSync(path.join(__dirname, '../images/test.gif')),
    'image/webp': fs.readFileSync(path.join(__dirname, '../images/test.webp')),
  };

  const testImageData = {
    'image/png': fs.readFileSync(path.join(__dirname, '../images/test.png')),
    'image/jpeg': fs.readFileSync(path.join(__dirname, '../images/test.jpg')),
    'image/gif': fs.readFileSync(path.join(__dirname, '../images/test.gif')),
    'image/webp': fs.readFileSync(path.join(__dirname, '../images/test.webp')),
  };

  Object.keys(originalImageData).forEach(async (mimeType) => {
    test(`${mimeType.split('/')[1].toUpperCase()} data can be replaced with ${mimeType
      .split('/')[1]
      .toUpperCase()} data with 200 success response.`, async () => {
      const imagePostRes = await request(app)
        .post('/v1/fragments/')
        .set('Content-Type', mimeType)
        .auth('user1@email.com', 'password1')
        .send(originalImageData[mimeType]);

      const imageId = imagePostRes.body.fragment.id;
      const imageCreated = imagePostRes.body.fragment.created;
      const imageUpdated = imagePostRes.body.fragment.updated;

      const newImageData = testImageData[mimeType];

      const imagePutRes = await request(app)
        .put(`/v1/fragments/${imageId}`)
        .set('Content-Type', mimeType)
        .auth('user1@email.com', 'password1')
        .send(newImageData);

      expect(imagePutRes.statusCode).toBe(200);
      expect(imagePutRes.body.status).toBe('ok');
      expect(imagePutRes.body.fragment).toBeDefined();
      expect(typeof imagePutRes.body.fragment).toBe('object');
      expect(imagePutRes.body.fragment.id).toBeDefined();
      expect(imagePutRes.body.fragment.ownerId).toBeDefined();
      expect(imagePutRes.body.fragment.type).toBe(mimeType);
      expect(imagePutRes.body.fragment.size).toBe(Buffer.byteLength(newImageData));
      expect(imagePutRes.body.fragment.created).toBe(imageCreated); // created should remain the same
      expect(Date.parse(imagePutRes.body.fragment.updated)).toBeGreaterThan(
        Date.parse(imageUpdated)
      ); // updated should be greater than previously updated/created fragment.
    });
  });

  Object.keys(originalImageData).forEach(async (mimeType) => {
    Object.keys(testImageData).forEach((processedMimeType) => {
      if (mimeType != processedMimeType) {
        test(`${mimeType
          .split('/')[1]
          .toUpperCase()} data cannot be replaced with ${processedMimeType
          .split('/')[1]
          .toUpperCase()}`, async () => {
          const imgPostResponse = await request(app)
            .post('/v1/fragments/')
            .set('Content-Type', mimeType)
            .auth('user1@email.com', 'password1')
            .send(originalImageData[mimeType]);

          const imgPostId = imgPostResponse.body.fragment.id;

          const newImgData = testImageData[processedMimeType];

          const replaceWithRes = await request(app)
            .put(`/v1/fragments/${imgPostId}`)
            .set('Content-Type', processedMimeType)
            .auth('user1@email.com', 'password1')
            .send(newImgData);

          expect(replaceWithRes.statusCode).toBe(400);
          expect(replaceWithRes.body.status).toBe('error');
          expect(replaceWithRes.body.error.code).toBe(400);
          expect(replaceWithRes.body.error.message).toBeDefined();
        });
      }
    });
  });
});
