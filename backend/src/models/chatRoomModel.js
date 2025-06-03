import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema(
  {
    roomID: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);

export default ChatRoom;