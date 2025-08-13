const config = require("../../../config");

export const formatUserForAdmin = (u: any) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  dob: u.dob,
  gender: u.gender,
  wallet_balance: u.wallet_balance,
  profile_image: u.profile_image
    ? `${config.app.baseUrl}${u.profile_image}`
    : null,
  notifications_enabled: u.notifications_enabled,
  created_at: u.created_at,
  status: u.status,
});

export const formatUserListForAdmin = (users: any[]) =>
  users.map(formatUserForAdmin);
