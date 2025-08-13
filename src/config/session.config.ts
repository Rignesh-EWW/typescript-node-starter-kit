import session from "express-session";
const config = require("../../config");

const sessionConfig = {
  secret: config.token.sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }, // Set to true if using HTTPS
};

export default sessionConfig;
