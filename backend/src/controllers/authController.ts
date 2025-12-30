import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models';
import config from '../config';
import { emailService } from '../services';
import { ApiResponse, AuthTokens, JwtPayload, RegisterInput, LoginInput } from '../types';

/**
 * Generate access and refresh tokens
 */
const generateTokens = (user: { _id: unknown; email: string; isPremium: boolean }): AuthTokens => {
  const payload: JwtPayload = {
    userId: String(user._id),
    email: user.email,
    isPremium: user.isPremium,
  };

  const accessTokenOptions: SignOptions = {
    expiresIn: config.jwt.expiresIn,
  };

  const refreshTokenOptions: SignOptions = {
    expiresIn: config.jwt.refreshExpiresIn,
  };

  const accessToken = jwt.sign(payload, config.jwt.secret, accessTokenOptions);
  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, refreshTokenOptions);

  return { accessToken, refreshToken };
};

/**
 * Register new user
 * POST /api/auth/register
 */
export const register = async (
  req: Request<object, ApiResponse, RegisterInput>,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: 'An account with this email already exists.',
      });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate verification token
    const verificationToken = uuidv4();

    // Create user
    const user = new User({
      name,
      email: email.toLowerCase(),
      passwordHash,
      verificationToken,
    });

    await user.save();

    // Send verification email
    try {
      await emailService.sendVerificationEmail(email, name, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    // Generate tokens
    const tokens = generateTokens(user);

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please verify your email.',
      data: {
        user: user.toJSON(),
        ...tokens,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create account. Please try again.',
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (
  req: Request<object, ApiResponse, LoginInput>,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
      return;
    }

    // Check if user uses OAuth (no password)
    if (!user.passwordHash) {
      res.status(401).json({
        success: false,
        error: `This account uses ${user.authProvider} login. Please sign in with ${user.authProvider}.`,
      });
      return;
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
      return;
    }

    // Generate tokens
    const tokens = generateTokens(user);

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        user: user.toJSON(),
        ...tokens,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed. Please try again.',
    });
  }
};

/**
 * Verify email
 * POST /api/auth/verify-email
 */
export const verifyEmail = async (
  req: Request<object, ApiResponse, { token: string }>,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { token } = req.body;

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      res.status(400).json({
        success: false,
        error: 'Invalid or expired verification token.',
      });
      return;
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully.',
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Verification failed. Please try again.',
    });
  }
};

/**
 * Forgot password - send reset email
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (
  req: Request<object, ApiResponse, { email: string }>,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Always return success to prevent email enumeration
    if (!user) {
      res.json({
        success: true,
        message: 'If an account exists with this email, a reset link will be sent.',
      });
      return;
    }

    // Generate reset token
    const resetToken = uuidv4();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // Send reset email
    try {
      await emailService.sendPasswordResetEmail(email, user.name, resetToken);
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
    }

    res.json({
      success: true,
      message: 'If an account exists with this email, a reset link will be sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process request. Please try again.',
    });
  }
};

/**
 * Reset password
 * POST /api/auth/reset-password
 */
export const resetPassword = async (
  req: Request<object, ApiResponse, { token: string; password: string }>,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token.',
      });
      return;
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset password. Please try again.',
    });
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh-token
 */
export const refreshToken = async (
  req: Request<object, ApiResponse, { refreshToken: string }>,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Refresh token is required.',
      });
      return;
    }

    try {
      const decoded = jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
      
      const user = await User.findById(decoded.userId);
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'User not found.',
        });
        return;
      }

      const tokens = generateTokens(user);

      res.json({
        success: true,
        data: tokens,
      });
    } catch {
      res.status(401).json({
        success: false,
        error: 'Invalid refresh token.',
      });
    }
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh token.',
    });
  }
};

/**
 * Get current user
 * GET /api/auth/me
 */
export const getCurrentUser = async (
  req: Request,
  res: Response<ApiResponse>
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated.',
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found.',
      });
      return;
    }

    res.json({
      success: true,
      data: { user: user.toJSON() },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user data.',
    });
  }
};
