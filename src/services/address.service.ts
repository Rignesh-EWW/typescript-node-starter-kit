import { AddressType, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createAddress = async (data: {
  user_id: number;
  address_type: AddressType;
  full_address: string;
  lat: string;
  lng: string;
  house_number: string;
  is_default: boolean;
}) => {
  return prisma.address.create({ data });
};

export const updateAddressById = async (
  id: number,
  data: {
    address_type?: AddressType;
    full_address?: string;
    lat?: string;
    lng?: string;
    house_number?: string;
  }
) => {
  return prisma.address.update({
    where: { id },
    data,
  });
};

export const deleteAddressById = async (id: number) => {
  return prisma.address.update({
    where: { id },
    data: { deleted_at: new Date() },
  });
};

export const unsetAllAddressDefault = async (user_id: number) => {
  return prisma.address.updateMany({
    where: { user_id, is_default: true },
    data: { is_default: false },
  });
};
export const setDefaultUserAddress = async (id: number) => {
  return prisma.address.update({
    where: { id },
    data: { is_default: true },
  });
};
