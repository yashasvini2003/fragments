// src/routes/api/get.js

/**
 * Get a list of fragments for the current user
 */
module.exports = (req, res) => {
    // TODO: this is just a placeholder. To get something working, return an empty array...
    res.status(200).json({
      status: 'ok',
      // TODO: change me
      fragments: [],
    });
  };


/*   const express = require('express');
const { createSuccessResponse, createErrorResponse } = require('../../response');

const router = express.Router();

/**
 * Get a list of fragments for the current user
 */
/**router.get('/', (req, res) => {
  // Assuming you want to return an empty array for now
  const fragments = []; // Replace with actual logic to fetch fragments

  // Send a 200 OK response using createSuccessResponse
  res.status(200).json(createSuccessResponse({ fragments }));
});

module.exports = router;
 */