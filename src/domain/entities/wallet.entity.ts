import { Prisma } from "@prisma/client";

export class WalletEntity {
  constructor(
    public readonly id: number,
    public readonly user_id: number | null,
    public readonly operation_type: string | null,
    public readonly amount: Prisma.Decimal | null,
    public readonly description: string | null,
    public readonly description_ar: string | null,
    public readonly created_at: Date | null // ✅ now matches Prisma type
  ) {}
}
