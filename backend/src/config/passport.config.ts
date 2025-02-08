import passport from 'passport';
import { Request } from 'express';
import { config } from './app.config';
import {
  Strategy as GoogleStrategy,
  VerifyCallback,
} from 'passport-google-oauth2';
import { Strategy as LocalStrategy } from 'passport-local';
import { NotFoundException } from '../utils/appError';
import { ProviderEnum } from '../enums/account-provider.enum';
import {
  loginOrCreateAccountService,
  verifyUserService,
} from '../services/auth.service';
import UserModel from '../models/user.model';
import { Profile } from 'passport-google-oauth';

passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: config.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async function (
      req: Request,
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) {
      try {
        const { email, sub: googleId, picture } = profile._json;

        if (!googleId) {
          throw new NotFoundException('Google ID (sub) is missing');
        }

        if (!email) {
          throw new NotFoundException('Email is required from Google profile');
        }

        const { user } = await loginOrCreateAccountService({
          provider: ProviderEnum.GOOGLE,
          displayName: profile.displayName || email.split('@')[0],
          providerId: googleId,
          picture: picture || undefined,
          email: email,
        });

        done(null, user);
      } catch (error) {
        console.error('Google authentication error:', error);
        done(error, false);
      }
    }
  )
);

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      session: true,
    },
    async (email, password, done) => {
      try {
        const user = await verifyUserService({ email, password });
        return done(null, user);
      } catch (error: any) {
        return done(error, false, { message: error?.message });
      }
    }
  )
);
// passport.serializeUser((user: any, done) => done(null, user));
// passport.deserializeUser((user: any, done) => done(null, user));

passport.serializeUser((user: any, done) => done(null, user._id)); // Store only the user ID
passport.deserializeUser(async (id: string, done) => {
  try {
    console.log('Deserializing user with ID:', id); // Log the user ID
    const user = await UserModel.findById(id);
    if (!user) {
      console.error('User not found for ID:', id); // Log if user is not found
      return done(new Error('User not found'), null);
    }
    console.log('Deserialized user:', user); // Log the fetched user
    done(null, user);
  } catch (error) {
    console.error('Error deserializing user:', error); // Log any errors
    done(error, null);
  }
});
