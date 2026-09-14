export class ApiError extends Error {
  constructor(message, statusCode = 500, errors = [], isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const successResponse = (res, { statusCode = 200, message = 'Success', data = null, meta = null } = {}) => {
  const payload = {
    success: true,
    message,
    data
  };
  if (meta) payload.meta = meta;
  return res.status(statusCode).json(payload);
};

export const errorResponse = (res, { statusCode = 500, message = 'Error', errors = [], code = null } = {}) => {
  const payload = {
    success: false,
    message
  };
  if (errors && errors.length > 0) payload.errors = errors;
  if (code) payload.code = code;
  return res.status(statusCode).json(payload);
};

export default {
  ApiError,
  successResponse,
  errorResponse
};
