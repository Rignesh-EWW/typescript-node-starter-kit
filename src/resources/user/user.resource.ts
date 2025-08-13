import { UserEntity } from "@/domain/entities/user.entity";

export const formatUserResponse = (user: UserEntity) => ({
  id: user.id,
  name: user.displayName,
  email: user.email,
  phone: user.phoneSafe,
  gender: user.gender,
  dob: user.dobFormatted,
  device_type: user.device_type,
  device_token: user.deviceTokenSafe,
  profile_image: user.profileImageUrl,
  language: user.language,
  notifications_enabled: user.notifications_enabled,
  wallet_balance: user.wallet_balance,
});
