import { Router, Request, Response } from 'express';
import passport from '../config/passport';
import jwt, { SignOptions } from 'jsonwebtoken';
import config from '../config';
import { AuthTokens, JwtPayload } from '../types';

const router = Router();

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

// ==================== Google OAuth ====================

/**
 * Initiate Google OAuth
 * GET /api/auth/google
 */
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

/**
 * Google OAuth callback
 * GET /api/auth/google/callback
 */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${config.frontendUrl}/login?error=google_auth_failed`,
  }),
  (req: Request, res: Response) => {
    try {
      const user = req.user as unknown as { _id: unknown; email: string; isPremium: boolean };
      
      if (!user) {
        return res.redirect(`${config.frontendUrl}/login?error=no_user`);
      }

      const tokens = generateTokens(user);
      
      // Redirect to frontend with tokens in URL (frontend will extract and store them)
      const redirectUrl = new URL(`${config.frontendUrl}/auth/callback`);
      redirectUrl.searchParams.set('accessToken', tokens.accessToken);
      redirectUrl.searchParams.set('refreshToken', tokens.refreshToken);
      redirectUrl.searchParams.set('provider', 'google');
      
      return res.redirect(redirectUrl.toString());
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      return res.redirect(`${config.frontendUrl}/login?error=callback_failed`);
    }
  }
);

// ==================== GitHub OAuth ====================

/**
 * Initiate GitHub OAuth
 * GET /api/auth/github
 */
router.get(
  '/github',
  passport.authenticate('github', {
    scope: ['user:email'],
    session: false,
  })
);

/**
 * GitHub OAuth callback
 * GET /api/auth/github/callback
 */
router.get(
  '/github/callback',
  passport.authenticate('github', {
    session: false,
    failureRedirect: `${config.frontendUrl}/login?error=github_auth_failed`,
  }),
  (req: Request, res: Response) => {
    try {
      const user = req.user as unknown as { _id: unknown; email: string; isPremium: boolean };
      
      if (!user) {
        return res.redirect(`${config.frontendUrl}/login?error=no_user`);
      }

      const tokens = generateTokens(user);
      
      // Redirect to frontend with tokens in URL (frontend will extract and store them)
      const redirectUrl = new URL(`${config.frontendUrl}/auth/callback`);
      redirectUrl.searchParams.set('accessToken', tokens.accessToken);
      redirectUrl.searchParams.set('refreshToken', tokens.refreshToken);
      redirectUrl.searchParams.set('provider', 'github');
      
      return res.redirect(redirectUrl.toString());
    } catch (error) {
      console.error('GitHub OAuth callback error:', error);
      return res.redirect(`${config.frontendUrl}/login?error=callback_failed`);
    }
  }
);

export default router;
