const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const { hasExtension, separateIdExtensionAndMediaType } = require('../../model/data/utils');
const logger = require('../../logger');

const deleteFragmentById = async (req, res) => {
  const fragmentId = req.params.id;

  try {
    if (hasExtension(fragmentId)) {
      const { id } = separateIdExtensionAndMediaType(fragmentId);
      await Fragment.delete(req.user, id);
      res.status(200).json(createSuccessResponse());
    } else {
      await Fragment.delete(req.user, fragmentId);
      res.status(200).json(createSuccessResponse());
    }
  } catch (error) {
    if (error.message.includes('missing entry')) {
      const errorMessage = `Fragment with ID '${
        hasExtension(fragmentId) ? separateIdExtensionAndMediaType(fragmentId).id : fragmentId
      }' does not exist.`;
      res.status(404).json(createErrorResponse(404, errorMessage));
    } else {
      logger.error(error);
      res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
    }
  }
};

module.exports = {
  deleteFragmentById,
};
