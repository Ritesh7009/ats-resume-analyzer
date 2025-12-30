import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import { JwtPayload, ApiResponse } from '../types';

// Extend Express Request type
declare global {
  namespace Express {
    interface User {
      userId: string;
      email: string;
      isPremium: boolean;
    }
  }
}

/**
 * Authentication middleware to verify JWT tokens
 */
export const authenticate = (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      req.user = decoded;
      next();
    } catch {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token.',
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed.',
    });
  }
};

/**
 * Optional authentication - continues if no token, but validates if present
 */
export const optionalAuth = (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      req.user = decoded;
    } catch {
      // Token invalid but continue anyway for optional auth
    }
    
    next();
  } catch {
    next();
  }
};

/**
 * Premium access middleware - requires user to have premium subscription
 */
export const requirePremium = (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): void => {
  if (!req.user?.isPremium) {
    res.status(403).json({
      success: false,
      error: 'This feature requires a premium subscription.',
    });
    return;
  }
  next();
};
