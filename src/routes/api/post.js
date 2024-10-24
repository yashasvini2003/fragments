const { createErrorResponse, createSuccessResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

async function createFragment(req, res) {
  // Get the owner ID by hashing the user and Content Type
  const ownerId = req.user;
  const contentType = req.headers['content-type'];
  const reqBody = req.body;

  if (!['text/plain'].includes(contentType)) {
    res.status(415).json(createErrorResponse(415, 'unsupported type'));
    return;
  }

  if (!Buffer.isBuffer(reqBody)) {
    res.status(400).json(createErrorResponse(400, 'no data'));
    return;
  }

  if (reqBody.toString().trim() == '') {
    res.status(400).json(createErrorResponse(400, 'no data'));
    return;
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

module.exports = createFragment;
