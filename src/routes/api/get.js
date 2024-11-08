// src/routes/api/get.js

const { createSuccessResponse, createErrorResponse } = require('../../response');

//importing Fragment class..
const { Fragment } = require('../../model/fragment');

const logger = require('../../logger');

// importing Utils Functions.
const {
  hasExtension,
  separateIdExtensionAndMediaType,
  isConversionPossible,
  convertFragment,
} = require('../../model/data/utils');

async function getFragmentById(req, res) {
  const fragmentId = req.params.id;

  try {
    if (hasExtension(fragmentId)) {
      await handleFragmentWithExtension(fragmentId, req, res);
    } else {
      await handleFragmentWithoutExtension(fragmentId, req, res);
    }
  } catch (error) {
    logger.error(error);
    handleErrorResponse(
      res,
      404,
      `Fragment with ID '${
        hasExtension(fragmentId) ? separateIdExtensionAndMediaType(fragmentId).id : fragmentId
      }' does not exist.`
    );
  }
}

async function handleFragmentWithExtension(fragmentId, req, res) {
  const { id, extension, mediaType } = separateIdExtensionAndMediaType(fragmentId);
  let fragment = new Fragment(await Fragment.byId(req.user, id));

  try {
    if (isConversionPossible(fragment.type, extension)) {
      let data = await fragment.getData();
      const convertedData = await convertFragment(data, fragment.type, extension, mediaType);
      res.set('Content-Type', mediaType);
      res.status(200).send(convertedData);
    } else {
      let errorMessage = mediaType
        ? `The requested conversion from Media Type '${fragment.type}' to '${mediaType}' is not possible.`
        : `The requested conversion from Media Type '${fragment.type}' to extension '.${extension}' is not possible.`;
      handleErrorResponse(res, 415, errorMessage);
    }
  } catch (error) {
    // eror can  occure during conversion thus need to handle it
    logger.error(error); // Log the error using Pino logger
    res.status(500).json(createErrorResponse(500, `An error occurred: ${error}`));
  }
}

async function handleFragmentWithoutExtension(fragmentId, req, res) {
  let fragment = new Fragment(await Fragment.byId(req.user, fragmentId));
  let data = await fragment.getData();
  res.set('Content-Type', fragment.type);
  res.status(200).send(data);
}

function handleErrorResponse(res, statusCode, errorMessage) {
  res.status(statusCode).json(createErrorResponse(statusCode, errorMessage));
}

async function getFragmentsByUser(req, res) {
  const expand = req.query.expand;
  try {
    let fragments = await Fragment.byUser(req.user, expand);
    res.status(200).json(createSuccessResponse({ fragments: fragments }));
  } catch (error) {
    logger.error(error); // Log the error using Pino logger
    res.status(500).json(createErrorResponse(500, `An error occurred: ${error}`));
  }
}

async function getFragmentInfoById(req, res) {
  const fragmentId = req.params.id;

  try {
    let fragment;
    if (hasExtension(fragmentId)) {
      const { id } = separateIdExtensionAndMediaType(fragmentId);
      fragment = await Fragment.byId(req.user, id);
    } else fragment = await Fragment.byId(req.user, fragmentId);
    res.status(200).json(createSuccessResponse({ fragment: fragment }));
  } catch (error) {
    logger.error(error);
    res
      .status(404)
      .json(createErrorResponse(404, `Fragment with ID '${fragmentId}' does not exist.`));
  }
}

module.exports = {
  getFragmentById,
  getFragmentsByUser,
  getFragmentInfoById,
};
