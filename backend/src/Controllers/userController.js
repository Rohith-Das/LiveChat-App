 import User from "../models/userModel.js";

 export const getUsers=async(req,res)=>{
    try {
        const users=await User.find({_id:{$ne:req.user._id}}).select(
            "fullName email profilePic"
        )
         res.status(200).json(users);
    } catch (error) {
            console.log("Error in getUsers:", error);
    res.status(500).json({ message: "Internal server error" });
    }
 }