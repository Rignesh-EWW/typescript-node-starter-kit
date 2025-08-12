import { io } from "socket.io-client";
import { Request, Response, NextFunction } from "express";
import { success, error } from "@/utils/responseWrapper";
import { asyncHandler } from "@/utils/asyncHandler";
import { createMessage } from "@/services/chat.service";
import { ChatMessages } from "@/constants/chat";
import { getMessages } from "@/repositories/chat.repository";
import { formatChatList } from "@/resources/user/chat.resource";

export const sendMessage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { sender_type, sender_id, receiver_type, receiver_id, message } =
      req.body;

    // Save in DB
    const savedMessage = await createMessage({
      sender_type,
      sender_id,
      receiver_type,
      receiver_id,
      message,
    });

    // Emit real-time message to receiver's room
    const io = req.app.get("io");
    const roomName = `${receiver_type}_${receiver_id}`;
    io.to(roomName).emit("new_message", savedMessage);

    // Fetch updated chat list
    const messageList = await getMessages(sender_id, receiver_id);

    return res.json(
      success(
        req.translator.t(ChatMessages.messageSent),
        formatChatList(messageList)
      )
    );
  }
);

export const chatController = {
  sendMessage,
};
