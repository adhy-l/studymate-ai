const { errorResponse } = require('../utils/responseUtils');

/**
 * Middleware generator to require non-empty body fields
 * @param {string[]} requiredFields
 */
const requireFields = (requiredFields = []) => {
  return (req, res, next) => {
    const missing = [];

    for (const field of requiredFields) {
      if (req.body[field] === undefined || req.body[field] === null || (typeof req.body[field] === 'string' && req.body[field].trim() === '')) {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      return errorResponse(
        res,
        400,
        `Field berikut wajib diisi: ${missing.join(', ')}`,
        { missingFields: missing }
      );
    }

    next();
  };
};

module.exports = {
  requireFields
};
