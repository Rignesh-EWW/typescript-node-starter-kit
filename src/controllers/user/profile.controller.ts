import { Notification } from "./../../../node_modules/.prisma/client/index.d";
import fs from "fs";
import { Request, Response, NextFunction } from "express";
import {
  findUserByEmail,
  findUserById,
  findUserByPhone,
} from "@/repositories/user.repository";
import { updateUserById } from "@/services/user.service";
import { formatUserResponse } from "@/resources/user/user.resource";
import { Messages } from "@/constants/messages";
import { asyncHandler } from "@/utils/asyncHandler";
import { Email } from "@/domain/valueObjects/email.vo";
import { Name } from "@/domain/valueObjects/name.vo";
import { logUserUpdate } from "@/jobs/profile.jobs";
import { success, error } from "@/utils/responseWrapper";
import {
  UpdateLanguageRequestSchema,
  UpdateNotificationRequestSchema,
  UpdateProfileRequestSchema,
} from "@/requests/user/profile.request";
import { saveBase64Image } from "@utils/fileUpload";
import path from "path";
import { ProfileMessages } from "@/constants/profile";

export const getProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const user = await findUserById(userId!);

    if (!user) {
      return res.status(404).json(error(ProfileMessages.userNotFound));
    }
    return res.json(
      success(
        req.translator.t(ProfileMessages.getProfileSuccess),
        formatUserResponse(user)
      )
    );
  }
);

export const updateProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id!;
    const { name, email, phone, gender, dob, profile_image } =
      UpdateProfileRequestSchema.parse(req.body);

    // Step 1: Verify user exists
    const user = await findUserById(userId);
    if (!user) {
      return res
        .status(404)
        .json(error(req.translator.t(ProfileMessages.userNotFound)));
    }

    // Step 2: Validate email uniqueness
    const existingEmailUser = await findUserByEmail(email);
    if (existingEmailUser && existingEmailUser.id !== userId) {
      return res
        .status(409)
        .json(error(req.translator.t(ProfileMessages.emailAlreadyInUse)));
    }

    // Step 3: Validate phone uniqueness
    const existingPhoneUser = await findUserByPhone(phone);
    if (existingPhoneUser && existingPhoneUser.id !== userId) {
      return res
        .status(409)
        .json(error(req.translator.t(ProfileMessages.phoneAlreadyInUse)));
    }

    // Step 4: Handle base64 image upload
    let uploadedFile = user.profile_image ?? null;

    if (profile_image) {
      try {
        // Delete old file if it exists
        if (user.profile_image) {
          const existingPath = path.join(process.cwd(), user.profile_image);
          if (fs.existsSync(existingPath)) {
            fs.unlinkSync(existingPath);
          }
        }
        // Save new image
        uploadedFile = await saveBase64Image(profile_image, "profile_images");
      } catch (err) {
        return res
          .status(400)
          .json(error(req.translator.t(ProfileMessages.invalidFileFormat)));
      }
    }

    // Step 5: Format DOB
    const dobFormatted = dob ? new Date(dob).toISOString() : undefined;

    // Step 6: Update user
    await updateUserById(userId, {
      name: new Name(name).getValue(),
      email: new Email(email).getValue(),
      phone,
      gender,
      dob: dobFormatted,
      profile_image: uploadedFile ?? undefined,
    });

    logUserUpdate(userId, email);

    // Step 7: Return updated user
    const updatedUser = await findUserById(userId);
    if (!updatedUser) {
      return res
        .status(404)
        .json(error(req.translator.t(ProfileMessages.userNotFound)));
    }

    return res.json(
      success(
        req.translator.t(ProfileMessages.updateProfileSuccess),
        formatUserResponse(updatedUser)
      )
    );
  }
);

export const updateLanguage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id!;
    const { language } = UpdateLanguageRequestSchema.parse(req.body);

    // Step 1: Verify user exists
    const user = await findUserById(userId);
    if (!user) {
      return res
        .status(404)
        .json(error(req.translator.t(ProfileMessages.userNotFound)));
    }

    // Step 2: Update language
    await updateUserById(userId, {
      language,
    });

    // Step 3: Fetch updated user
    const updatedUser = await findUserById(userId);
    if (!updatedUser) {
      return res
        .status(404)
        .json(error(req.translator.t(ProfileMessages.userNotFound)));
    }

    return res.json(
      success(
        req.translator.t(ProfileMessages.LanguageUpdatedSuccess),
        formatUserResponse(updatedUser)
      )
    );
  }
);

export const updateNotification = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id!;
    const { notifications_enabled } = UpdateNotificationRequestSchema.parse(
      req.body
    );

    // Step 1: Verify user exists
    const user = await findUserById(userId);
    if (!user) {
      return res
        .status(404)
        .json(error(req.translator.t(ProfileMessages.userNotFound)));
    }

    // Step 2: Update language
    await updateUserById(userId, {
      notifications_enabled,
    });

    // Step 3: Fetch updated user
    const updatedUser = await findUserById(userId);
    if (!updatedUser) {
      return res
        .status(404)
        .json(error(req.translator.t(ProfileMessages.userNotFound)));
    }

    return res.json(
      success(
        req.translator.t(ProfileMessages.NotificationsUpdatedSuccess),
        formatUserResponse(updatedUser)
      )
    );
  }
);
