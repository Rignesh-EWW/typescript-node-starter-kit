import { AddressEntity } from "@/domain/entities/address.entity";
export const formatAddressResponse = (address: AddressEntity) => ({
  id: address.id,
  user_id: address.user_id,
  address_type: address.address_type,
  full_address: address.full_address,
  lat: address.lat,
  lng: address.lng,
  house_number: address.house_number,
  status: address.status,
  is_default: address.is_default,
});

export const formatAddressList = (list: AddressEntity[]) =>
  list.map(formatAddressResponse);
