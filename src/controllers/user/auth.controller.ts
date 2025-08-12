import { DeviceType } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import {
  findUserByEmail,
  findUserById,
  findUserByPhone,
} from "@/repositories/user.repository";
import { createUser, updateUserById } from "@/services/user.service";
import { hashPassword, comparePassword } from "@/utils/hash";
import { generateSession } from "@/utils/session";
import { formatUserResponse } from "@/resources/user/user.resource";
import { AuthMessages, DefaultUserRole } from "@/constants/auth";

import { logAppleCheck } from "@/jobs/logAppleCheck";
import { userEmitter } from "@/events/emitters/userEmitter";
import { logRegistration, logLogin } from "@/jobs/auth.jobs";
import { generateOtp, saveOtpToRedis } from "@/utils/otp";
import { logOtpSend } from "@/jobs/otp.jobs";
import { generateResetToken } from "@/utils/resetToken";
import { ResetPasswordConstants } from "@/constants/reset";
import { logResetLink } from "@/jobs/reset.jobs";
import { Email } from "@/domain/valueObjects/email.vo";
import { Password } from "@/domain/valueObjects/password.vo";
import { UserEntity } from "@/domain/entities/user.entity";
import { appEmitter, APP_EVENTS } from "@/events/emitters/appEmitter";

import { asyncHandler } from "@/utils/asyncHandler";
import { issueAuthToken } from "@/utils/authToken";
import { signJwt } from "@/utils/jwt";
import { success, error } from "@/utils/responseWrapper";
import { deleteOTP, insertOTP } from "@/services/otpVarification.service";
import { findUserByPhoneAndOTP } from "@/repositories/otpVerification.repository";
import {
  deleteToken,
  resetLinkInsert,
} from "@/services/passwordResetToken.service";
import { sendEmail } from "@utils/sendMail";
import { findUserByEmailResetToken } from "@/repositories/passwordResetToken.repository";
import { generateThumbnail, saveBase64Image } from "@utils/fileUpload";
import fs, { existsSync } from "fs";
import path from "path";

const registerUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      name,
      email,
      phone,
      gender,
      dob,
      password,
      device_type,
      device_token,
      profile_image,
    } = req.body;

    const emailVO = new Email(email);
    const passwordVO = new Password(password);

    // Step 1: Check if user already exists
    const [existingEmail, existingPhone] = await Promise.all([
      findUserByEmail(emailVO.getValue()),
      findUserByPhone(phone),
    ]);

    if (existingEmail)
      return res
        .status(409)
        .json(error(req.translator.t(AuthMessages.emailExists)));
    if (existingPhone)
      return res
        .status(409)
        .json(error(req.translator.t(AuthMessages.phoneExists)));

    // Step 2: Handle base64 image upload
    let uploadedFile = "";
    if (profile_image) {
      try {
        uploadedFile = await saveBase64Image(profile_image, "profile_images");
      } catch (err) {
        return res
          .status(400)
          .json(error(req.translator.t(AuthMessages.invalidImage)));
      }
    }

    // Step 3: Hash password and create user
    const hashed = await hashPassword(passwordVO.getValue());

    const user = await createUser({
      name,
      email: emailVO.getValue(),
      phone,
      gender,
      dob,
      password: hashed,
      device_type,
      device_token,
      profile_image: uploadedFile,
    });

    // Step 4: Trigger events and login
    appEmitter.emit(APP_EVENTS.USER_REGISTERED, {
      id: user.id,
      email: user.email,
    });

    await generateSession(req, user.id, "user");

    logRegistration(email);
    userEmitter.emit("user.registered", { id: user.id, email });

    // Step 5: Final fetch and respond
    const userdata = await findUserById(user.id);
    if (!userdata) {
      return res
        .status(404)
        .json(error(req.translator.t(AuthMessages.userNotFound)));
    }

    return res.json(
      success(
        req.translator.t(AuthMessages.registered),
        formatUserResponse(userdata)
      )
    );
  }
);

const deleteFileIfExists = async (filePath: string | undefined) => {
  if (!filePath) return;
  const absolutePath = path.join(process.cwd(), filePath);
  if (existsSync(absolutePath)) {
    try {
      await fs.unlinkSync(absolutePath);
    } catch (err) {
      console.error(`Failed to delete file ${absolutePath}:`, err);
    }
  }
};

const loginUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, device_type, device_token } = req.body;

    const emailVO = new Email(email);
    const passwordVO = new Password(password);

    // Step 1: Find user by email
    const user = await findUserByEmail(emailVO.getValue());
    if (!user) {
      return res
        .status(404)
        .json(error(req.translator.t(AuthMessages.userNotFound)));
    }

    // Step 2: Validate password
    const isMatch = await comparePassword(passwordVO.getValue(), user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json(error(req.translator.t(AuthMessages.invalidCredentials)));
    }

    // Step 3: Update device info
    await updateUserById(user.id, { device_type, device_token });

    // Step 4: Create session & issue token
    await generateSession(req, user.id, "user");
    const token = issueAuthToken(user.id, "user");

    // Step 5: Log and emit
    logLogin(user.email);
    userEmitter.emit("user.loggedIn", { id: user.id, email: user.email });

    const userdata = await findUserById(user.id);
    if (!userdata) {
      return res
        .status(404)
        .json(error(req.translator.t(AuthMessages.userNotFound)));
    }
    // Step 6: Respond
    return res.json(
      success(req.translator.t(AuthMessages.login), {
        user: formatUserResponse(userdata),
        token,
      })
    );
  }
);

const loginWithOTP = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { phone } = req.body;

    const userRecord = await findUserByPhone(phone);
    const otp = generateOtp();
    const otpInsert = await insertOTP({
      phone,
      otp,
    });
    let new_user = "N";
    if (!userRecord) {
      new_user = "Y";
    }

    // code for the SMS gateway
    return res.json(
      success(req.translator.t(AuthMessages.OTPsent), {
        otp,
        new_user,
      })
    );
  }
);

const verifyOTPLogin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { phone, otp, device_type, device_token } = req.body;

    // Step 1: Verify OTP
    const otpRecord = await findUserByPhoneAndOTP({ phone, otp });

    if (!otpRecord) {
      return res
        .status(400)
        .json(error(req.translator.t(AuthMessages.invalidOTP)));
    }

    // Step 2: Check if user exists
    const user = await findUserByPhone(otpRecord.phone);
    if (!user) {
      return res
        .status(404)
        .json(error(req.translator.t(AuthMessages.userNotFound)));
    }

    // Step 3: Update device info
    await updateUserById(user.id, { device_type, device_token });

    // Step 4: Delete OTP
    await deleteOTP(otpRecord.id);

    // Step 5: Issue token
    const token = issueAuthToken(user.id, "user");

    const userdata = await findUserById(user.id);
    if (!userdata) {
      return res
        .status(404)
        .json(error(req.translator.t(AuthMessages.userNotFound)));
    }

    // Step 6: Send response
    return res.json(
      success(req.translator.t(AuthMessages.login), {
        user: formatUserResponse(userdata),
        token,
      })
    );
  }
);

const sendOTP = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { phone } = req.body;

    const userRecord = await findUserByPhone(phone);

    if (userRecord) {
      return res
        .status(404)
        .json(error(req.translator.t(AuthMessages.phoneExists)));
    }
    const otp = generateOtp();
    const otpInsert = await insertOTP({
      phone,
      otp,
    });

    // code for the SMS gateway
    return res.json(
      success(req.translator.t(AuthMessages.OTPsent), {
        otp,
      })
    );
  }
);

const verifyOTP = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { phone, otp, device_type, device_token } = req.body;
    console.log(req.body);
    // Step 1: Verify OTP
    const otpRecord = await findUserByPhoneAndOTP({ phone, otp });

    if (!otpRecord) {
      return res
        .status(400)
        .json(error(req.translator.t(AuthMessages.invalidOTP)));
    }

    // Step 6: Delete used OTP
    await deleteOTP(otpRecord.id);

    return res.json(success(req.translator.t(AuthMessages.OTPVerified)));
  }
);

const socialLogin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Social login is not supported by the current schema
    return res.status(400).json(error("Social login is not supported."));
  }
);

const appleDetails = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    logAppleCheck(id);
    userEmitter.emit("appleDetailsChecked", { id });

    // Apple details lookup is not supported by the current schema
    return res
      .status(400)
      .json(error("Apple details lookup is not supported."));
  }
);

const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await findUserByEmail(email);
  if (!user) {
    return res
      .status(404)
      .json(error(req.translator.t(AuthMessages.userNotFound)));
  }

  // Generate secure token and expiry
  const token = crypto.randomUUID(); // Or use nanoid
  const expires_at = new Date(Date.now() + 15 * 60 * 1000); // 15 min
  const insertResetLink = await resetLinkInsert({
    email,
    token,
    expires_at,
  });
  const resetUrl = `https://yourapp.com/reset-password?token=${token}`;
  const htmlTemplate = `
    <h2>Password Reset</h2>
    <p>Click the link below to reset your password. This link will expire in 15 minutes.</p>
    <a href="${resetUrl}">${resetUrl}</a>
  `;
  const subject = "Reset your password";
  await sendEmail(email, subject, htmlTemplate);

  return res.json(success(req.translator.t(AuthMessages.linkSent)));
});

const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  console.log(token);
  const resetTokenRecord = await findUserByEmailResetToken(token);
  if (!resetTokenRecord) {
    return res
      .status(404)
      .json(error(req.translator.t(AuthMessages.linkInvalidORExpired)));
  }

  console.log("resetTokenRecord", resetTokenRecord);

  if (!resetTokenRecord || resetTokenRecord.expires_at < new Date()) {
    return res
      .status(400)
      .json(error(req.translator.t(AuthMessages.linkInvalidORExpired)));
  }

  const user = await findUserByEmail(resetTokenRecord.email);
  if (!user) {
    return res
      .status(404)
      .json(error(req.translator.t(AuthMessages.userNotFound)));
  }
  console.log("user", user);

  const hashedPassword = await hashPassword(newPassword);

  const updatedUser = await updateUserById(user.id, {
    password: hashedPassword,
  });

  await deleteToken(resetTokenRecord.id);

  return res.json(success(req.translator.t(AuthMessages.passwordResetSuccess)));
});

export const authenticationController = {
  registerUser,
  loginUser,
  loginWithOTP,
  verifyOTPLogin,
  sendOTP,
  verifyOTP,
  socialLogin,
  appleDetails,
  forgotPassword,
  resetPassword,
};
