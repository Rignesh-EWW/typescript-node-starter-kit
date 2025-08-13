const config = require("../../config");

export const ResetPasswordConstants = {
  keyPrefix: "reset_token:",
  expirySeconds: 900, // 15 minutes
  linkPrefix: config.mail.resetPasswordLinkPrefix,
};
