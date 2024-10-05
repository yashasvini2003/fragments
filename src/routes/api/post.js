// // Import required modules and dependencies
// //const API_URL = process.env.API_URL || 'http://localhost:8080';
// const { createErrorResponse, createSuccessResponse } = require('../../response');
// const Fragment = require('../../model/fragment');
// const logger = require('../../logger');

// // Handler function for creating a new fragment
// async function createFragment(req, res) {
//   const ownerId = req.user; // req.user is set by the authentication middleware

//   // Ensure the user is authenticated
//   if (!ownerId) {
//     return res.status(401).json(createErrorResponse(401, 'Unauthorized'));
//   }

//   const contentType = req.headers['content-type'];

//   // Check for unsupported content type
//   if (!Fragment.isSupportedType(contentType)) {
//     return res.status(415).json(createErrorResponse(415, 'Unsupported content type!'));
//   }

//   // Handle empty body (no data)
//   if (!req.body || req.body.length === 0) {
//     return res.status(400).json(createErrorResponse(400, 'Fragment data is empty'));
//   }

//   try {
//     // Create a new fragment object with owner ID and content type
//     let data = new Fragment({ ownerId, type: contentType });

//     // Save the fragment object and set data
//     await data.save();
//     await data.setData(req.body);

//     // Set the Location header with the URL of the newly created fragment
//     res.set('Location', `${API_URL}/v1/fragments/${data.id}`);

//     // Send the success response with the created fragment data
//     res.status(201).json(
//       createSuccessResponse({
//         fragment: data,
//         status: 'ok', // Ensure to match the expected response format
//       })
//     );
//   } catch (err) {
//     logger.error(err); // Log the error using the logger
//     res.status(500).json(createErrorResponse(500, err.message));
//   }
// }

// module.exports = createFragment;

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
