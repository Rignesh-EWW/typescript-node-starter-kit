import { Card } from "./../../../node_modules/.prisma/client/index.d";
import { Request, Response, NextFunction } from "express";
import { success, error } from "@/utils/responseWrapper";
import { asyncHandler } from "@/utils/asyncHandler";
import {
  findCardById,
  getCard,
  getCardType,
  getExistCard,
} from "@/repositories/card.repository";
import { formatCardList } from "@/resources/user/cards.resource";
import { encrypt } from "@utils/encryption";
import {
  createCard,
  deleteCardById,
  unsetAllCardDefault,
  setDefaultUserCard,
} from "@/services/card.service";
import { CardMessages } from "@/constants/card";

//==============================================================================
export const cardList = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const cards = await getCard(userId);
    return res.json(
      success(
        req.translator.t(CardMessages.cardListFetch),
        formatCardList(cards)
      )
    );
  }
);

export const addCard = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { card_holder_name, card_number, exp_date_month, exp_date_year } =
      req.body;

    // Encrypt sensitive fields
    const encryptedCardHolderName = encrypt(card_holder_name);
    const encryptedExpiryMonth = encrypt(exp_date_month);
    const encryptedExpiryYear = encrypt(exp_date_year);

    const cleanedCardNumber = card_number.replace(/\s+/g, ""); // Remove all spaces
    const last4Digits = cleanedCardNumber.slice(-4);
    // Format to masked version like xxxx xxxx xxxx 4242
    const maskedCardNumber = `xxxx xxxx xxxx ${last4Digits}`;
    // Encrypt the masked version
    const encryptedCardNumber = encrypt(maskedCardNumber);

    // Check if any default card exists for user
    const userId = req.user!.id;

    const existingCard = await getExistCard(Number(userId));
    const sanitizedCardNumber = card_number.replace(/\D/g, "").trim();
    const cardType = await getCardType(sanitizedCardNumber);
    const is_default = existingCard ? false : true;

    const newCard = await createCard({
      user_id: Number(userId),
      card_holder_name: encryptedCardHolderName,
      exp_date_month: encryptedExpiryMonth,
      exp_date_year: encryptedExpiryYear,
      formated_card_no: encryptedCardNumber,
      payment_id: "payment_id", // Replace with actual logic
      token: "token", // Replace with actual logic
      verification_token: "verification_token", // Replace with actual logic
      is_default,
      card_type: cardType,
    });

    if (!newCard) {
      return res.json(error(req.translator.t(CardMessages.cardAddFailed)));
    }

    const cards = await getCard(userId);

    return res.json(
      success(
        req.translator.t(CardMessages.cardAddSuccess),
        formatCardList(cards)
      )
    );
  }
);
export const deleteCard = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { card_id } = req.body;
    const userId = req.user!.id;
    // Validate card existence
    const cardData = await findCardById(card_id);
    if (!cardData) {
      return res
        .status(404)
        .json(error(req.translator.t(CardMessages.cardNotFound)));
    }

    // Prevent deletion of default card
    if (cardData.is_default) {
      return res
        .status(400)
        .json(error(req.translator.t(CardMessages.cardDeleteDefault)));
    }

    // Delete card
    const deleted = await deleteCardById(card_id);
    if (!deleted) {
      return res
        .status(500)
        .json(error(req.translator.t(CardMessages.cardDeleteFailed)));
    }

    // Fetch updated card list
    const cards = await getCard(userId);

    return res.json(
      success(
        req.translator.t(CardMessages.cardDeleteSuccess),
        formatCardList(cards)
      )
    );
  }
);

export const setDefaultCard = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { card_id } = req.body;

    // Validate card existence
    const card = await findCardById(card_id);
    if (!card || card.user_id !== userId) {
      return res
        .status(404)
        .json(error(req.translator.t(CardMessages.cardNotFound)));
    }

    // Unset all other cards as default
    await unsetAllCardDefault(userId);
    await setDefaultUserCard(card_id);
    // Return updated list
    const cards = await getCard(userId);
    return res.json(
      success(
        req.translator.t(CardMessages.SetDefaultCardSuccess),
        formatCardList(cards)
      )
    );
  }
);

export const cardController = {
  cardList,
  addCard,
  deleteCard,
  setDefaultCard,
};
