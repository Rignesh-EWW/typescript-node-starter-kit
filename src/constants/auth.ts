export const SupportedSocialProviders = [
  "google",
  "facebook",
  "apple",
] as const;
export const DefaultUserRole = "user";

export const AuthMessages = {
  emailExists: "messages.auth.emailExists",
  phoneExists: "messages.auth.phoneExists",
  userNotFound: "messages.auth.userNotFound",
  invalidCredentials: "messages.auth.invalidCredentials",
  registered: "messages.auth.registered",
  login: "messages.auth.login",
  OTPsent: "messages.auth.OTPSent",
  invalidOTP: "messages.auth.invalidOTP",
  OTPVerified: "messages.auth.OTPVerified",
  linkInvalidORExpired: "messages.auth.linkInvalidORExpired",
  passwordResetSuccess: "messages.auth.passwordResetSuccess",
  invalidImage: "messages.auth.invalidImage",
  linkSent: "messages.auth.linkSent",
};
