import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

interface AppError extends Error {
  statusCode?: number;
  code?: string;
  errors?: Record<string, unknown>[];
}

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response<ApiResponse>,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  if (err.code === '11000') {
    statusCode = 409;
    message = 'Duplicate entry found';
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (
  _req: Request,
  res: Response<ApiResponse>,
  _next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    error: 'Resource not found',
  });
};

/**
 * Async handler wrapper to catch errors
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
