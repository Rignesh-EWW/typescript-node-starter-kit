import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getFaq = async () => {
  // const result = await prisma.$queryRaw`SELECT * FROM faq`;
  // console.log(result);
  // return result;
  return prisma.faq.findMany({
    orderBy: { id: "asc" },
  });
};
