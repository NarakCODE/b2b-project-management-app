import dotenv from 'dotenv';
dotenv.config();
/**
 * Get Access to the App Configuration.
 * This is a simple wrapper around the environment variables allow to call them in a cleaner way.
 * @usage
 * const config = getConfig();
 * console.log(config.NODE_ENV);
 * console.log(config.PORT);
 */

import { getEnv } from '../utils/get-env';

const appConfig = () => ({
  NODE_ENV: getEnv('NODE_ENV', process.env.NODE_ENV),
  PORT: getEnv('PORT', '5000'),
  BASE_PATH: getEnv('BASE_PATH', '/api'),
  MONGODB_URI: getEnv('MONGODB_URI', process.env.MONGODB_URI),

  SESSION_SECRET: getEnv('SESSION_SECRET', 'session_secret_key'),
  SESSION_EXPIRES_IN: getEnv('SESSION_EXPIRES_IN', '1d'),

  GOOGLE_CLIENT_ID: getEnv('GOOGLE_CLIENT_ID', process.env.GOOGLE_CLIENT_ID),
  GOOGLE_CLIENT_SECRET: getEnv(
    'GOOGLE_CLIENT_SECRET',
    process.env.GOOGLE_CLIENT_SECRET
  ),
  GOOGLE_CALLBACK_URL: getEnv(
    'GOOGLE_CALLBACK_URL',
    process.env.GOOGLE_CALLBACK_URL
  ),

  FRONTEND_ORIGIN: getEnv('FRONTEND_ORIGIN', process.env.FRONTEND_ORIGIN),
  FRONTEND_GOOGLE_CALLBACK_URL: getEnv(
    'FRONTEND_GOOGLE_CALLBACK_URL',
    process.env.FRONTEND_GOOGLE_CALLBACK_URL
  ),
});

export const config = appConfig();
