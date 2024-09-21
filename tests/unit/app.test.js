const request = require('supertest');
const app = require('../../src/app'); // Adjust the path as needed

describe('404 Handler', () => {
  it('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/unknown-route'); // Route that should trigger 404

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        message: 'not found',
        code: 404,
      },
    });
  });
});
