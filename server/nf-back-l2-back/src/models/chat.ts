import mongoose, { Document, Schema } from "mongoose";

export interface IChat {
  participants: mongoose.Types.ObjectId[];
  lastMessage: mongoose.Types.ObjectId;
}

export interface ChatModel extends IChat, Document {}

const chatSchema = new Schema({
  participants: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: "message",
  },
});

const chatModel = mongoose.model<ChatModel>("Chat", chatSchema);

export { chatModel };
