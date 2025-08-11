import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createCard = async (data: {
  user_id: number;
  card_holder_name: string;
  exp_date_month: string;
  exp_date_year: string;
  formated_card_no: string;
  payment_id: string;
  token: string;
  verification_token: string;
  is_default: boolean;
  card_type: string;
}) => {
  return prisma.card.create({ data });
};

export const deleteCardById = async (id: number) => {
  return prisma.card.update({
    where: { id },
    data: { deleted_at: new Date() },
  });
};

export const unsetAllCardDefault = async (user_id: number) => {
  return prisma.card.updateMany({
    where: { user_id, is_default: true },
    data: { is_default: false },
  });
};
export const setDefaultUserCard = async (id: number) => {
  return prisma.card.update({
    where: { id },
    data: { is_default: true },
  });
};
