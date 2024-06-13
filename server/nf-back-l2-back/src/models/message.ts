import mongoose, { Document, Schema } from "mongoose";

export interface IMessage {
  text: string;
  sender: mongoose.Types.ObjectId;
  chat: mongoose.Types.ObjectId;
}

export interface MessageModel extends IMessage, Document {}

const messageSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chat: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const messageModel = mongoose.model<MessageModel>("Message", messageSchema);

export { messageModel };
