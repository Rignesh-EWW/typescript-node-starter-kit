import { PaymentDetail } from "./../../node_modules/.prisma/client/index.d";
import {
  OperationType,
  PaymentStatus,
  PaymentType,
  Prisma,
  PrismaClient,
} from "@prisma/client";

const prisma = new PrismaClient();

export const createWalletTransaction = async (data: {
  user_id: number;
  operation_type: OperationType;
  amount: Prisma.Decimal;
  description: string;
  description_ar: string;
}) => {
  return prisma.walletTransaction.create({ data });
};

export const createPaymentDetails = async (data: {
  order_id: number;
  payment_id: string;
  payment_type: PaymentType;
  payment_status: PaymentStatus;
  payment_response: string;
  amount: Prisma.Decimal;
  payment_message: string;
  transaction_type: string;
}) => {
  return prisma.paymentDetail.create({ data });
};
