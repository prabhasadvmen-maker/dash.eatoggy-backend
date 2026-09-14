import { ApiError } from './apiResponse.js';

export const validateRequiredFields = (requiredFields, source = 'body') => {
  return (req, res, next) => {
    const data = req[source] || {};
    const missing = [];

    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        missing.push(`${field} is required`);
      }
    }

    if (missing.length > 0) {
      return next(new ApiError('Validation Error', 400, missing));
    }

    next();
  };
};

export default validateRequiredFields;
