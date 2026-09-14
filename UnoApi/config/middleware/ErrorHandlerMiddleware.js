import { ZodError } from 'zod';
import BaseException from '../exceptions/BaseException.js';

const ErrorHandlerMiddleware = (err, req, res, next) => {
  // Catch custom exceptions
  if (err instanceof BaseException) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }

  // Catch Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      details: (err.errors || err.issues).map(e => ({
        path: e.path.join('.'),
        message: e.message
      }))
    });
  }

  // Log unhandled errors for debugging
  console.error('Unhandled Exception:', err);

  // Fallback for unexpected errors
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
};

export default ErrorHandlerMiddleware;
