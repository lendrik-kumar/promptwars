'use strict';

/**
 * Input validation middleware helpers.
 * Centralises request validation using express-validator.
 */

const { validationResult } = require('express-validator');

/**
 * Reads validation errors from express-validator and returns 422 if any found.
 * Attach after any chain of check() validators.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      error:   'Validation failed',
      details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  return next();
}

module.exports = { validate };
