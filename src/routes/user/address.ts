import { addressController } from "@/controllers/user/address.controller";
import { Router } from "express";
import { requireAuth, requireUserAuth } from "@/middlewares/authMiddleware";
import validateRequest from "@/middlewares/validateRequest";
import {
  AddAddressRequestSchema,
  DeleteAddressRequestSchema,
  SetDefaultAddressRequestSchema,
  UpdateAddressRequestSchema,
} from "@/requests/user/address.request";

const router = Router();

router.get("/address", requireUserAuth, addressController.addressList);

router.post(
  "/address/add",
  requireUserAuth,
  validateRequest({ body: AddAddressRequestSchema }),
  addressController.addAddress
);

router.post(
  "/address/update",
  requireUserAuth,
  validateRequest({ body: UpdateAddressRequestSchema }),
  addressController.updateAddress
);

router.post(
  "/address/delete",
  requireUserAuth,
  validateRequest({ body: DeleteAddressRequestSchema }),
  addressController.deleteAddress
);

router.post(
  "/address/set-default",
  requireUserAuth,
  validateRequest({ body: SetDefaultAddressRequestSchema }),
  addressController.setDefaultAddress
);

export default router;
