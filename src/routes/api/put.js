/* global */

// Import required modules and dependencies
const { createErrorResponse, createSuccessResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const { validateContentType } = require('../../model/data/utils');
const logger = require('../../logger');

// importing Utils Functions.
const { hasExtension, separateIdExtensionAndMediaType } = require('../../model/data/utils');

async function updateFragment(req, res) {
  const contentType = req.headers['content-type'];
  const reqFragmentId = req.params.id;

  try {
    try {
      // To check if the content type is valid
      await validateContentType(req.body, contentType);
    } catch (error) {
      return res
        .status(415)
        .json(createErrorResponse(415, `Invalid data supplied: ${error.message}`));
    }

    // Determine whether the request has an extension or not
    const { id } = hasExtension(reqFragmentId)
      ? separateIdExtensionAndMediaType(reqFragmentId)
      : { id: reqFragmentId };

    // Fetch the fragment by id, and check if it exists
    let fragment;
    try {
      fragment = new Fragment(await Fragment.byId(req.user, id));
    } catch {
      return res.status(404).json(createErrorResponse(404, `Fragment with ID ${id} not found.`));
    }

    // Check if the content type is matching
    if (fragment.mimeType !== contentType) {
      return res
        .status(400)
        .json(
          createErrorResponse(
            400,
            `Supplied content type is ${contentType} but the requested fragment's content type is ${fragment.mimeType}. Fragment's content type cannot be changed after it is created.`
          )
        );
    }

    // Update the fragment data and save it
    fragment.setData(req.body);
    fragment.save();
    return res.status(200).json(createSuccessResponse({ fragment: fragment }));
  } catch (error) {
    // Log the error using Pino logger
    logger.error(error);
    return res.status(500).json(createErrorResponse(500, `An error occurred: ${error}`));
  }
}

module.exports = {
  updateFragment,
};
