// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({
  path:
    !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
      ? `${__dirname}/../../../../.env`
      : `${__dirname}/../../../../.env.${process.env.NODE_ENV}`,
});

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_TYPE,
    timezone: process.env.DB_TIMEZONE,
  },
  test: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_TYPE,
    timezone: process.env.DB_TIMEZONE,
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_TYPE,
    timezone: process.env.DB_TIMEZONE,
  },
};
