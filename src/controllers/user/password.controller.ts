import { User } from "./../../../node_modules/.prisma/client/index.d";
import { Request, Response, NextFunction } from "express";
import {
  ChangePasswordRequestSchema,
  ResetPasswordBodySchema,
  ResetPasswordParamsSchema,
} from "@/requests/user/password.request";
import { comparePassword, hashPassword } from "@/utils/hash";
import { changeUserPassword } from "@/services/user.service";
import { findUserWithPasswordById } from "@/repositories/user.repository";
import { Password } from "@/domain/valueObjects/password.vo";
import {
  isBlocked,
  recordFailedAttempt,
  clearFailedAttempts,
} from "@/utils/passwordAttempt";
import { logPasswordChange } from "@/jobs/password.jobs";
import { asyncHandler } from "@/utils/asyncHandler";
import { userEmitter } from "@/events/emitters/userEmitter";
import { success, error } from "@/utils/responseWrapper";
import { getUserIdFromToken, deleteResetToken } from "@/utils/resetToken";
import { PasswordMessages } from "@/constants/password";

export const changePassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { current_password, new_password } =
      ChangePasswordRequestSchema.parse(req.body);

    if (await isBlocked(userId)) {
      return res
        .status(429)
        .json(error(req.translator.t(PasswordMessages.tooManyAttempts)));
    }

    const user = await findUserWithPasswordById(userId);
    if (!user)
      return res
        .status(404)
        .json(error(req.translator.t(PasswordMessages.userNotFound)));

    const current = new Password(current_password);
    const nextPassword = new Password(new_password);

    const match = await comparePassword(current.getValue(), user.password);
    if (!match) {
      await recordFailedAttempt(userId);
      return res
        .status(401)
        .json(error(req.translator.t(PasswordMessages.incorrectPassword)));
    }

    const hashed = await hashPassword(nextPassword.getValue());

    await changeUserPassword(userId, hashed);
    await clearFailedAttempts(userId);

    logPasswordChange(userId);
    userEmitter.emit("user.passwordChanged", { userId });

    return res.json(
      success(req.translator.t(PasswordMessages.passwordChanged))
    );
  }
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = ResetPasswordParamsSchema.parse(req.params);
    const { new_password } = ResetPasswordBodySchema.parse(req.body);

    const userId = await getUserIdFromToken(token);
    if (!userId)
      return res
        .status(400)
        .json(error(req.translator.t(PasswordMessages.invalidToken)));

    const nextPassword = new Password(new_password);
    const hashed = await hashPassword(nextPassword.getValue());

    await changeUserPassword(Number(userId), hashed);
    await deleteResetToken(token);

    userEmitter.emit("user.passwordReset", { userId: Number(userId) });

    return res.json(
      success(req.translator.t(PasswordMessages.passwordChanged))
    );
  }
);
