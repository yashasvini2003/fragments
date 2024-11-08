// src/routes/api/post.js

// Import required modules and dependencies
const { createErrorResponse, createSuccessResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
//const hashUser = require('../../hash');
const { validateContentType } = require('../../model/data/utils');
const logger = require('../../logger');

// Handler function for creating a new fragment
async function createFragment(req, res) {
  // Get the owner ID by hashing the user and Content Type
  const ownerId = req.user;
  const contentType = req.headers['content-type'];
  try {
    // To check if the content type is valid
    await validateContentType(req.body, contentType);
  } catch (err) {
    res.status(415).send(createErrorResponse(415, err.message));
    return; // Exit the function to prevent further execution
  }
  try {
    // Create a new fragment object with owner ID and content type
    let data = new Fragment({ ownerId, type: contentType });

    // Save the fragment object and set data
    await data.save();
    await data.setData(req.body);

    // Build the base URL using the request protocol and host
    const baseUrl = req.protocol + '://' + req.get('host');

    // Set the Location header with the URL of the newly created fragment
    res.set('Location', `${process.env.API_URL || baseUrl}/v1/fragments/${data.id}`);

    // Send the success response with the created fragment data
    res.status(201).json(
      createSuccessResponse({
        fragment: data,
      })
    );
  } catch (err) {
    logger.error(err); // Log the error using Pino logger
    res.status(500).send(createErrorResponse(500, err.message));
  }
}

module.exports = {
  createFragment,
};
