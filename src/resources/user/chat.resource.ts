import { ChatEntity } from "@/domain/entities/chat.entity";

export const formatChatResponse = (message: ChatEntity) => ({
  id: message.id,
  sender_type: message.sender_type,
  sender_id: message.sender_id,
  receiver_type: message.receiver_type,
  receiver_id: message.receiver_id,
  message: message.message,
  created_at: message.created_at,
});

export const formatChatList = (list: ChatEntity[]) =>
  list.map(formatChatResponse);
