import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError, z } from 'zod';
import type { ApiError } from '@replate/shared';
import { logger } from '../logger.ts';

/** Throw from a route to send a specific status and message to the client. */
export class HttpError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function body(code: string, message: string): ApiError {
  return { error: { code, message } };
}

export const notFound: RequestHandler = (req, res) => {
  res.status(404).json(body('NOT_FOUND', `No route for ${req.method} ${req.path}`));
};

// Express 5 forwards errors from async handlers here, so routes can simply throw.
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json(body('VALIDATION_ERROR', z.prettifyError(err)));
    return;
  }
  if (err instanceof HttpError) {
    res.status(err.status).json(body(err.code, err.message));
    return;
  }
  // express.json() raises this for malformed or oversized bodies.
  if (typeof err?.status === 'number' && err.status >= 400 && err.status < 500) {
    res.status(err.status).json(body('BAD_REQUEST', err.message));
    return;
  }
  (req.log ?? logger).error({ err }, 'Unhandled error');
  res.status(500).json(body('INTERNAL_ERROR', 'Something went wrong. Please try again.'));
};
