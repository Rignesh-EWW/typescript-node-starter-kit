import { Faq, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getFaq = async () => {
  return prisma.faq.findMany({
    orderBy: { id: "asc" },
    where: { deleted_at: null },
  });
};

export const getFaqById = async (id: number) => {
  return prisma.faq.findUnique({
    where: { id, deleted_at: null },
  });
};

export const createFaq = async (faq: any) => {
  return prisma.faq.create({
    data: {
      question: faq.question,
      answer: faq.answer,
      status: true,
    },
  });
};

export const updateFaq = async (id: number, faq: any) => {
  return prisma.faq.update({
    where: { id },
    data: {
      question: faq.question,
      answer: faq.answer,
    },
  });
};

export const deleteFaq = async (id: number) => {
  return prisma.faq.update({
    where: { id },
    data: { deleted_at: new Date(), status: false },
  });
};

export const toggleFaqStatus = async (id: number) => {
  const faq = await prisma.faq.findUnique({
    where: { id },
  });
  return prisma.faq.update({
    where: { id },
    data: { status: { set: !faq?.status } },
  });
};
