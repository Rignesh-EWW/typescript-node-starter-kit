import { Request, Response, NextFunction } from "express";
import { success, error } from "@/utils/responseWrapper";
import { asyncHandler } from "@/utils/asyncHandler";
import { getWalletTransactions } from "@/repositories/wallet.repository";

import { WalletMessages } from "@/constants/wallet";
import { formatWalletTransactionList } from "@/resources/user/wallet.resource";
import {
  createPaymentDetails,
  createWalletTransaction,
} from "@/services/wallet.service";
import { create } from "domain";
import { findUserById } from "@/repositories/user.repository";
import { updateUserWalletBalance } from "@/services/user.service";

export const walletTransactions = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const walletTransactionsList = await getWalletTransactions(userId);
    console.log(walletTransactionsList);
    return res.json(
      success("test", formatWalletTransactionList(walletTransactionsList))
    );
  }
);

export const addMoney = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const { amount } = req.body;

  // 1️⃣ Validate amount
  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json(error("Invalid amount"));
  }

  // 2️⃣ Update wallet balance atomically
  const updatedUser = await updateUserWalletBalance(userId, amount, "credit");

  // 3️⃣ Save transaction
  await createWalletTransaction({
    user_id: userId,
    operation_type: "A",
    amount: amount,
    description: "Topup wallet",
    description_ar: "Topup wallet AR",
  });

  // 4️⃣ Save payment details
  await createPaymentDetails({
    order_id: 12324,
    payment_id: "123456789",
    payment_type: "card",
    payment_status: "success",
    payment_response: "Payment successful",
    amount: amount,
    payment_message: "Payment successful",
    transaction_type: "wallet-topup",
  });

  // 5️⃣ Fetch updated transactions
  const walletTransactions = await getWalletTransactions(userId);

  return res.json(
    success(req.translator.t(WalletMessages.topupSuccess), {
      wallet_balance: updatedUser.wallet_balance,
      transactions: formatWalletTransactionList(walletTransactions),
    })
  );
});

export const walletController = {
  walletTransactions,
  addMoney,
};
