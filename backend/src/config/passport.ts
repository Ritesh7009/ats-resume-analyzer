import passport from 'passport';
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy, Profile as GitHubProfile } from 'passport-github2';
import { User } from '../models';
import config from './index';

// Serialize user for the session
passport.serializeUser((user: Express.User, done) => {
  done(null, (user as unknown as { _id: string })._id);
});

// Deserialize user from the session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user as unknown as Express.User);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
if (config.oauth.google.clientId && config.oauth.google.clientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.oauth.google.clientId,
        clientSecret: config.oauth.google.clientSecret,
        callbackURL: config.oauth.google.callbackURL,
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: GoogleProfile,
        done: (error: Error | null, user?: Express.User | false) => void
      ) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email found in Google profile'), false);
          }

          // Check if user exists
          let user = await User.findOne({ email: email.toLowerCase() });

          if (user) {
            // Update OAuth info if needed
            if (!user.googleId) {
              user.googleId = profile.id;
              user.isVerified = true;
              await user.save();
            }
          } else {
            // Create new user
            user = await User.create({
              name: profile.displayName || profile.name?.givenName || 'User',
              email: email.toLowerCase(),
              googleId: profile.id,
              isVerified: true,
              authProvider: 'google',
              avatar: profile.photos?.[0]?.value,
            });
          }

          return done(null, user as unknown as Express.User);
        } catch (error) {
          return done(error as Error, false);
        }
      }
    )
  );
}

// GitHub OAuth Strategy
if (config.oauth.github.clientId && config.oauth.github.clientSecret) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: config.oauth.github.clientId,
        clientSecret: config.oauth.github.clientSecret,
        callbackURL: config.oauth.github.callbackURL,
        scope: ['user:email'],
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: GitHubProfile,
        done: (error: Error | null, user?: Express.User | false) => void
      ) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email found in GitHub profile. Please make sure your email is public on GitHub or grant email access.'), false);
          }

          // Check if user exists
          let user = await User.findOne({ email: email.toLowerCase() });

          if (user) {
            // Update OAuth info if needed
            if (!user.githubId) {
              user.githubId = profile.id;
              user.isVerified = true;
              await user.save();
            }
          } else {
            // Create new user
            user = await User.create({
              name: profile.displayName || profile.username || 'User',
              email: email.toLowerCase(),
              githubId: profile.id,
              isVerified: true,
              authProvider: 'github',
              avatar: profile.photos?.[0]?.value,
            });
          }

          return done(null, user as unknown as Express.User);
        } catch (error) {
          return done(error as Error, false);
        }
      }
    )
  );
}

export default passport;
