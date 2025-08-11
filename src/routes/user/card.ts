import { Router } from "express";

import { requireAuth, requireUserAuth } from "@/middlewares/authMiddleware";
import {
  AddCardRequestSchema,
  DeleteCardRequestSchema,
  SetDefaultCardRequestSchema,
} from "@/requests/user/card.request";
import { cardController } from "@/controllers/user/card.controller";
import validateRequest from "@/middlewares/validateRequest";

const router = Router();

router.get("/cards", requireUserAuth, cardController.cardList);

router.post(
  "/cards/add",
  requireUserAuth,
  validateRequest({ body: AddCardRequestSchema }),
  cardController.addCard
);

router.post(
  "/cards/delete",
  requireUserAuth,
  validateRequest({ body: DeleteCardRequestSchema }),
  cardController.deleteCard
);

router.post(
  "/cards/set-default",
  requireUserAuth,
  validateRequest({ body: SetDefaultCardRequestSchema }),
  cardController.setDefaultCard
);

export default router;
