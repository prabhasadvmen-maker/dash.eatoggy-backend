import crypto from 'crypto';

export const requestIdMiddleware = (req, res, next) => {
  const incomingId = req.headers['x-request-id'] || req.headers['x-correlation-id'];
  const requestId = incomingId || crypto.randomUUID();

  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  next();
};

export default requestIdMiddleware;
