export type Message = {
  id?: string;
  senderId: string;
  receiverId: string;
  chatId?: string; // make optional if not always used
  content: string;
  createdAt?: string;
};
