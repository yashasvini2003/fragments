const request = require('supertest');
const app = require('../../src/app');

/**
 * Tests for the DELETE /v1/fragments/:id endpoint.
 */
describe('DELETE /v1/fragments/:id', () => {
  /**
   * Tests when the fragment exists.
   */
  describe('When fragment exists', () => {
    /**
     * Test case: should delete a fragment without extension and return success response.
     */
    test('should delete a fragment without extension and return success response', async () => {
      // Step 1: Create a fragment by making a POST request
      const data = 'Fragment Data';
      const post = await request(app)
        .post('/v1/fragments')
        .set('Content-Type', 'text/plain')
        .auth('user1@email.com', 'password1')
        .send(data);
      const id = post.body.fragment.id;

      // Send DELETE request to delete the fragment
      const response = await request(app)
        .delete(`/v1/fragments/${id}`)
        .auth('user1@email.com', 'password1');

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });

    /**
     * Test case: should delete a fragment with extension and return success response.
     */
    test('should delete a fragment with extension and return success response', async () => {
      // Step 1: Create a fragment by making a POST request
      const data = 'Fragment Data';
      const post = await request(app)
        .post('/v1/fragments')
        .set('Content-Type', 'text/plain')
        .auth('user1@email.com', 'password1')
        .send(data);
      const id = post.body.fragment.id;

      // Send DELETE request to delete the fragment with extension
      const response = await request(app)
        .delete(`/v1/fragments/${id}.anyext`)
        .auth('user1@email.com', 'password1');

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });
  });

  /**
   * Tests when the fragment does not exist.
   */
  describe('When fragment does not exist', () => {
    /**
     * Test case: should return a 404 error response for a fragment without extension.
     */
    test('should return a 404 error response for a fragment without extension', async () => {
      const fragmentId = 'INVAlid_ID13133cjkd-af';

      // Send DELETE request to delete the non-existent fragment
      const response = await request(app)
        .delete(`/v1/fragments/${fragmentId}`)
        .auth('user1@email.com', 'password1');

      // Assertions
      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe(404);
      expect(response.body.error.message).toBe(`Fragment with ID '${fragmentId}' does not exist.`);
    });

    /**
     * Test case: should return a 404 error response for a fragment with extension.
     */
    test('should return a 404 error response for a fragment with extension', async () => {
      const fragmentId = 'INVAlid_ID13133cjkd-af';

      // Send DELETE request to delete the non-existent fragment with extension
      const response = await request(app)
        .delete(`/v1/fragments/${fragmentId}.anyExt`)
        .auth('user1@email.com', 'password1');

      // Assertions
      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe(404);
      expect(response.body.error.message).toBe(`Fragment with ID '${fragmentId}' does not exist.`);
    });
  });
});
