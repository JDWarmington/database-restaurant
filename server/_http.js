// Small shared helpers for the route files.

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const badRequest = (msg) => new HttpError(400, msg);
export const notFound   = (msg) => new HttpError(404, msg);
export const conflict   = (msg) => new HttpError(409, msg);

// Wrap an async route handler so thrown errors flow into Express's error
// middleware. Distinguishes HttpError (known status) from anything else
// (treat as 500 in the global handler in server/index.js).
export const asyncRoute = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export function parseId(value, label = 'id') {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    throw badRequest(`Invalid ${label}.`);
  }
  return n;
}

export function requireRating(value) {
  const r = Number(value);
  if (!Number.isInteger(r) || r < 1 || r > 10) {
    throw badRequest('Rating must be an integer between 1 and 10.');
  }
  return r;
}
