// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const passport = require('passport');
const logger = require('./logger');
const pino = require('pino-http')({
  logger,
});
const authenticate = require('./auth');
const { createErrorResponse } = require('./response');

// Create an express app instance
const app = express();

// Use pino logging middleware
app.use(pino);

// Use helmetjs security middleware
app.use(helmet());

// Use CORS middleware
app.use(cors());

// Use gzip/deflate compression middleware
app.use(compression());

// Set up passport authentication middleware
passport.use(authenticate.strategy());
app.use(passport.initialize());

// Define our routes
app.use('/', require('./routes'));

// Add 404 middleware to handle requests for resources that can't be found
app.use((req, res) => {
  res.status(404).json(createErrorResponse(404, 'not found'));
});

// Add error-handling middleware to handle other errors
app.use((err, req, res) => {
  const status = err.status || 500;
  const message = err.message || 'Unable to process request';

  if (status > 499) {
    logger.error({ err }, 'Error processing request');
  }

  res.status(status).json(createErrorResponse(message, status));
});

// Export our `app` for server.js
module.exports = app;
