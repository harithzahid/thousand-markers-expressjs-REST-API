import dotenv from 'dotenv';

dotenv.config();

export const USER_TYPE = {
  CONTRACTOR: 'contractor',
  OWNER: 'owner'
}

export const JOB = {
  WELDING: 'welding',
  HOUSEKEEPING: 'housekeeping',
  WOODWORKING: 'woodworking',
  BRICKLAYING: 'bricklaying',
  PLUMBING: 'plumbing',
  DRIVING: 'driving',
  DRILLING: 'drilling',
  BABYSITTING: 'babysitting',
  HEAVYLIFTING: 'heavylifting'
}

export const NODE_ENVIRONMENTS = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
  STAGING: 'staging',
};

export const DB_CONNECTION_URL =
  process.env.NODE_ENV === NODE_ENVIRONMENTS.DEVELOPMENT
    ? process.env.MONGO_URI_DEV
    : process.env.NODE_ENV === NODE_ENVIRONMENTS.STAGING
    ? process.env.MONGO_URI_STAGING
    : process.env.MONGO_URI_PROD;

export const CLIENT_APP_BASE_URL =
  process.env.NODE_ENV === NODE_ENVIRONMENTS.DEVELOPMENT
    ? process.env.SITE_BASE_URL_DEVELOPMENT
    : process.env.NODE_ENV === NODE_ENVIRONMENTS.STAGING
    ? process.env.SITE_BASE_URL_STAGING
    : process.env.SITE_BASE_URL_PRODUCTION;
