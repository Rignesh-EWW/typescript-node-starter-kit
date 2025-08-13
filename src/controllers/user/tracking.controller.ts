import { io } from "socket.io-client";
import { Request, Response, NextFunction } from "express";
import { success, error } from "@/utils/responseWrapper";
import { asyncHandler } from "@/utils/asyncHandler";
import { TrackingMessages } from "@/constants/tracking";

export const liveTracking = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { lat, lng, sender_id, receiver_id } = req.body;

    // Emit real-time tracking to receiver's room
    const io = req.app.get("io");
    const roomName = `user_${receiver_id}`;
    io.to(roomName).emit("live-tracking", [{ lat: lat, lng: lng }]);

    return res.json(success(req.translator.t(TrackingMessages.locationSent)));
  }
);

export const trackingController = {
  liveTracking,
};
