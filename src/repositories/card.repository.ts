import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getCard = async (userId: number) => {
  return prisma.card.findMany({
    where: { user_id: userId, deleted_at: null },
    orderBy: { id: "asc" },
  });
};

export const getExistCard = async (user_id: number) => {
  return prisma.card.findFirst({
    where: {
      user_id,
    },
  });
};

export const findCardById = async (id: number) => {
  return prisma.card.findUnique({ where: { id } });
};

export function getCardType(cardNumber: string): string {
  const number = cardNumber.replace(/\D/g, ""); // remove non-digits

  if (/^4[0-9]{12}(?:[0-9]{3})?$/.test(number)) return "visa";
  if (/^5[1-5][0-9]{14}$/.test(number)) return "mastercard";
  if (/^3[47][0-9]{13}$/.test(number)) return "americanexpress";
  if (/^6(?:011|5[0-9]{2})[0-9]{12}$/.test(number)) return "discover";
  if (/^3(?:0[0-5]|[68][0-9])[0-9]{11}$/.test(number)) return "dinersclub";
  if (/^35(2[89]|[3-8][0-9])[0-9]{12}$/.test(number)) return "jcb";

  return "other";
}
