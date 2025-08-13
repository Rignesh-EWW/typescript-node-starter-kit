import 'dotenv/config';
const config = require("../../config");

export const env = {
  APP_ENV: config.app.nodeEnv,
};

export const isProduction = env.APP_ENV === 'production';
export const isDevelopment = env.APP_ENV === 'development';
export const isTest = env.APP_ENV === 'test';
