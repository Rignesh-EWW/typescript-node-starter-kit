import { Decimal } from "@prisma/client/runtime/library";
import fs from "fs";
import path from "path";

const BASE_URL = process.env.BASE_URL || "";
export class UserEntity {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly email: string,
    public readonly phone: string,
    public readonly gender: string | null, // "Male", "Female", "Other"
    public readonly dob: string | null, // ISO string or null
    public readonly device_type: string, // "android" | "ios"
    public readonly device_token: string | null,
    public readonly language: string,
    public readonly notifications_enabled: boolean,
    public readonly wallet_balance: Decimal | null,
    public readonly profile_image: string | null
  ) {}

  get displayName(): string {
    return this.name
      ? this.name.charAt(0).toUpperCase() + this.name.slice(1)
      : "";
  }

  get phoneSafe(): string {
    return this.phone || "";
  }

  get deviceTokenSafe(): string | null {
    return this.device_token ?? null;
  }

  get profileImageUrl(): string | null {
    if (!this.profile_image || this.profile_image.trim() === "") {
      return null;
    }

    return this.profile_image;
  }

  get dobFormatted(): string | null {
    return this.dob ? new Date(this.dob).toISOString().split("T")[0] : null;
  }
}
