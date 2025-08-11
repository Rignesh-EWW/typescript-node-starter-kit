import { WalletEntity } from "@/domain/entities/wallet.entity";
export const formatWalletResponse = (walletTransaction: WalletEntity) => ({
  id: walletTransaction.id,
  user_id: walletTransaction.user_id,
  operation_type: walletTransaction.operation_type,
  amount: walletTransaction.amount,
  description: walletTransaction.description,
  description_ar: walletTransaction.description_ar,
  created_at: walletTransaction.created_at,
});

export const formatWalletTransactionList = (list: WalletEntity[]) =>
  list.map(formatWalletResponse);
