 import Message from "../models/messageModel.js";
 import ChatRoom from "../models/chatRoomModel.js";
 import User from "../models/userModel.js";

 export const createChatRoom=async(req,res)=>{
  try {
    const {recipientID}=req.body;
    const userID=req.user._id;
    if(!recipientID){
            return res.status(400).json({ message: "Recipient ID is required" });
    }
    const recipient=await User.findById(recipientID)
     if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    const roomID=[userID.toString(),recipientID.toString()].sort().join("_");
    let chatRoom=await ChatRoom.findOne({roomID});
    if(!chatRoom){
      chatRoom=new ChatRoom({
        roomID,
        participants:[userID,recipientID],
      })
      await chatRoom.save()
    }
     res.status(200).json({ roomID });
  } catch (error) {
      console.log("Error in createChatRoom:", error);
    res.status(500).json({ message: "Internal server error" });
  }
 }

 export const getUserChats = async (req, res) => {
  try {
    const userID = req.user._id;

    const chatRooms = await ChatRoom.find({
      participants: userID,
    }).populate("participants", "fullName email profilePic");

    const chats = await Promise.all(
      chatRooms.map(async (room) => {
        const lastMessage = await Message.findOne({ roomID: room.roomID })
          .sort({ createdAt: -1 })
          .select("content createdAt");

        const otherParticipant = room.participants.find(
          (p) => p._id.toString() !== userID.toString()
        );

        let unreadCount = 0;

        if (otherParticipant) {
          unreadCount = await Message.countDocuments({
            roomID: room.roomID,
            senderID: otherParticipant._id,
            status: { $in: ["sent", "delivered"] },
          });
        }

        return {
          roomID: room.roomID,
          participant: otherParticipant || room.participants[0], // fallback if only one participant
          lastMessage,
          unreadCount,
        };
      })
    );
    res.status(200).json(chats);
  } catch (error) {
    console.log("Error in getUserChats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


 export const getMessages=async(req,res)=>{
  try {
    const {roomID}=req.params;
    const userID=req.user._id;
    const chatRoom=await ChatRoom.findOne({
      roomID,
      participants:userID,
    })
     if (!chatRoom) {
      return res.status(403).json({ message: "Unauthorized or room not found" });
    }
    const messages = await Message.find({ roomID })
      .populate("senderID", "fullName profilePic")
      .sort({ createdAt: 1 })
      .limit(50);
      
//user opne chat double tick
       await Message.updateMany(
      { roomID: roomID, senderID: { $ne: userID }, status: { $in: ["sent", "delivered"] } },
      { $set: { status: 'read' } }
    );

    res.status(200).json(messages);

  } catch (error) {
        console.log("Error in getMessages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
 }

 export const downloadFile=async(req,res)=>{
  try {
    
    const {messageId}=req.params;
    const message=await Message.findById(messageId);
     if (!message || !message.url) {
       return res.status(404).json({ message: 'File not found' });
      } 
       res.setHeader('Content-Disposition', `attachment; filename="${message.fileName}"`);
       res.redirect(message.url);
  } catch (error) {
     console.error('Error downloading file:', error);
       res.status(500).json({ message: 'Failed to download file' });
  }
 }