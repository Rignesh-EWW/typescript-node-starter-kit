import { walletController } from "@/controllers/user/wallet.controller";
import { Router } from "express";
import { requireAuth, requireUserAuth } from "@/middlewares/authMiddleware";
import validateRequest from "@/middlewares/validateRequest";
import { AddMoneyRequestSchema } from "@/requests/user/wallet.request";

const router = Router();

router.get(
  "/wallet-transactions",
  requireUserAuth,
  walletController.walletTransactions
);

router.post(
  "/add-money",
  requireUserAuth,
  validateRequest({ body: AddMoneyRequestSchema }),
  walletController.addMoney
);

export default router;
