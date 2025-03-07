// src/routes/api/index.js

/**
 * The main entry-point for the v1 version of the fragments API.
 */
const express = require('express');

// Create a router on which to mount our API endpoints
const router = express.Router();

const contentType = require('content-type');

// Fragment Class
const { Fragment } = require('../../model/fragment');

// Import route handlers
const getHandlers = require('./get');
const postHandlers = require('./post');
const putHandelrs = require('./put');
const deleteHandlers = require('./delete');

// GET Routes

// Define GET /v1/fragments
// Route to get fragments by user
router.get('/fragments', getHandlers.getFragmentsByUser);

// Define GET /v1/fragments/:id
// Route to get a fragment by its ID
router.get('/fragments/:id', getHandlers.getFragmentById);

// Define GET /v1/fragments/:id/info
// Route to get metadata of a fragment by its ID
router.get('/fragments/:id/info', getHandlers.getFragmentInfoById);

// Post routes

// Support sending various Content-Types on the body up to 5M in size
const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      // See if we can parse this content type. If we can, `req.body` will be
      // a Buffer (e.g., `Buffer.isBuffer(req.body) === true`). If not, `req.body`
      // will be equal to an empty Object `{}` and `Buffer.isBuffer(req.body) === false`
      const { type } = contentType.parse(req);
      return Fragment.isSupportedType(type);
    },
  });

// Use a raw body parser for POST, which will give a `Buffer` Object or `{}` at `req.body`
// You can use Buffer.isBuffer(req.body) to test if it was parsed by the raw body parser.
router.post('/fragments', rawBody(), postHandlers.createFragment);

// PUT route
router.put('/fragments/:id', rawBody(), putHandelrs.updateFragment);

// Delete Route
router.delete('/fragments/:id', deleteHandlers.deleteFragmentById);

module.exports = router;
