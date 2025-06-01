import Message from "../models/messageModel.js";
import User from "../models/userModel.js";


//get messages between two users
export const getMessages=async(req,res)=>{

    try {
        const {receiverId}=req.params
        const senderId=req.user._id;
        const messages=await Message.find({
            $or:[
              // {senderId:myId, receiverId:userTOChatid},
                {senderId, receiverId},
                {senderId:receiverId,receiverId:senderId}
            ],
        }).sort({createdAt:1})
        res.status(200).json(messages)
    } catch (error) {
        console.log("error in getmessage",error);
        res.status(500).json({message:"internal error"})
    }
}
export const sendMessage= async(req,res)=>{
  try {
    const{text,image,}=req.body
    const{id:receiverId}=req.params
    const senderId=req.user._id;

    let imgUrl;
        if(image){
          const uploadResponse=await cloudinary.uploader.upload(image)
          imgUrl=uploadResponse.secure_url
        }

    const newMessage=new Message({
      senderId,
      receiverId,
      text,
      image:imgUrl,
    })    
await newMessage.save()

// realtime functionality goes here  => socket.io
    res.status(201).json(newMessage)

  } catch (error) {
    console.log("error in sendmessage",error);
    res.status(500).json({message:"internal error"})
  }
}
