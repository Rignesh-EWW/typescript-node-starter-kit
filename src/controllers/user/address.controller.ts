import { Request, Response, NextFunction } from "express";
import { success, error } from "@/utils/responseWrapper";
import { asyncHandler } from "@/utils/asyncHandler";
import {
  findAddressById,
  getAddress,
  getExistAddress,
} from "@/repositories/address.repository";
import { formatAddressList } from "@/resources/user/address.resource";
import {
  createAddress,
  deleteAddressById,
  setDefaultUserAddress,
  unsetAllAddressDefault,
  updateAddressById,
} from "@/services/address.service";
import { AddressMessages } from "@/constants/address";

export const addressList = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const addresses = await getAddress(userId);
    return res.json(
      success(
        req.translator.t(req.translator.t(AddressMessages.addressList)),
        formatAddressList(addresses)
      )
    );
  }
);

export const addAddress = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { address_type, full_address, lat, lng, house_number } = req.body;
    const userId = req.user!.id;

    const existingAddress = await getExistAddress(Number(userId));
    const is_default = existingAddress ? false : true;

    const newAddress = await createAddress({
      user_id: Number(userId),
      address_type: address_type,
      full_address: full_address,
      lat: lat,
      lng: lng,
      house_number: house_number,
      is_default,
    });

    if (!newAddress) {
      return res.json(
        error(req.translator.t(AddressMessages.addressAddFailed))
      );
    }
    const addresses = await getAddress(userId);

    return res.json(
      success(
        req.translator.t(AddressMessages.addressAddSuccess),
        formatAddressList(addresses)
      )
    );
  }
);

export const updateAddress = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { address_id, address_type, full_address, lat, lng, house_number } =
      req.body;

    const userId = req.user!.id;

    // Fetch address to verify ownership
    const address = await findAddressById(address_id);

    if (!address || address.user_id !== userId) {
      return res
        .status(404)
        .json(error(req.translator.t(AddressMessages.addressNotFound)));
    }

    // Perform update
    const updatedAddress = await updateAddressById(address_id, {
      address_type,
      full_address,
      lat,
      lng,
      house_number,
    });

    if (!updatedAddress) {
      return res
        .status(400)
        .json(error(req.translator.t(AddressMessages.addressUpdateFailed)));
    }

    const addresses = await getAddress(userId);

    return res.json(
      success(
        req.translator.t(AddressMessages.addressUpdateSuccess),
        formatAddressList(addresses)
      )
    );
  }
);

export const deleteAddress = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { address_id } = req.body;
    const userId = req.user!.id;
    // Validate address existence
    const addressData = await findAddressById(address_id);
    if (!addressData) {
      return res
        .status(404)
        .json(error(req.translator.t(AddressMessages.addressNotFound)));
    }

    // Prevent deletion of default address
    if (addressData.is_default) {
      return res
        .status(400)
        .json(error(req.translator.t(AddressMessages.addressDefault)));
    }

    // Delete address
    const deleted = await deleteAddressById(address_id);
    if (!deleted) {
      return res
        .status(500)
        .json(error(req.translator.t(AddressMessages.addressDeleteFailed)));
    }

    // Fetch updated address list
    const addresses = await getAddress(userId);

    return res.json(
      success(
        req.translator.t(AddressMessages.addressDeleteSuccess),
        formatAddressList(addresses)
      )
    );
  }
);

export const setDefaultAddress = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { address_id } = req.body;

    // Validate address existence
    const address = await findAddressById(address_id);
    if (!address || address.user_id !== userId) {
      return res
        .status(404)
        .json(error(req.translator.t(AddressMessages.addressNotFound)));
    }

    // Unset all other addressws as default
    await unsetAllAddressDefault(userId);
    await setDefaultUserAddress(address_id);
    // Return updated list
    const addresses = await getAddress(userId);
    return res.json(
      success(
        req.translator.t(AddressMessages.addressDefaultSet),
        formatAddressList(addresses)
      )
    );
  }
);

export const addressController = {
  addressList,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
