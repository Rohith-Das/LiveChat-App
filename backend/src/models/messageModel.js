import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    roomID: {
      type: String,
      required: true,
      index: true,
    },
    senderID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
       default: "",
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    type:{
      type:String,
       enum: ["text", "image", "video", "audio", "document"],
      default: "text",
    },
    url:{
      type:String,
    },
    fileName:{
      type:String,
    },
    tempId: { 
      type: String,
    }
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;