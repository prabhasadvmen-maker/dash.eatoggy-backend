const SENSITIVE_KEYS = [
  'password',
  'token',
  'otp',
  'secret',
  'authorization',
  'creditcard',
  'cvv',
  'jwt_secret',
  'razorpay_key_secret',
  'r2_secret_access_key',
  'mongodb_uri'
];

function sanitize(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitize);

  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
      cleaned[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      cleaned[key] = sanitize(value);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

function formatLog(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const reqId = meta.requestId ? ` [ReqID: ${meta.requestId}]` : '';
  const sanitizedMeta = Object.keys(meta).length > 0 ? ` | ${JSON.stringify(sanitize(meta))}` : '';
  return `[${timestamp}] [${level.toUpperCase()}]${reqId} ${message}${sanitizedMeta}`;
}

export const logger = {
  info: (message, meta) => {
    console.log(formatLog('info', message, meta));
  },
  error: (message, meta) => {
    console.error(formatLog('error', message, meta));
  },
  warn: (message, meta) => {
    console.warn(formatLog('warn', message, meta));
  },
  debug: (message, meta) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(formatLog('debug', message, meta));
    }
  }
};

export default logger;
