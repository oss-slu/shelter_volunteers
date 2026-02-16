export const ENVIROMENT = process.env.NODE_ENV;
export const SERVER =
  ENVIROMENT === "production"
    ? "/api"
    : process.env.REACT_APP_SERVER_URL || "http://localhost:5001";
export const REACT_APP_GOOGLE_CLIENT_ID =
  "502797726301-ngbeicta74g8alif8206o001b72aie3e.apps.googleusercontent.com";
