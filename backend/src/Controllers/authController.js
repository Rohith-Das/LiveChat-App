import User from '../models/userModel.js'
import bcrypt from 'bcrypt'
import { generateToken } from '../lib/utils.js'
import cloudinary from '../lib/cloudinary.js'


export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All Fields Are Required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "password must be at least 6 characters" });
    }
    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "email already exists" });
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      fullName,
      email,
      password: hashPassword
    });
    generateToken(newUser._id, res);
    await newUser.save();
    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
    });
  } catch (error) {
    console.log("error in signup controller", error);
    res.status(500).json({ message: "internal server error" });
  }
};


export const login=async(req,res)=>{

const{email,password}=req.body

    try {
        const user=await User.findOne({email})
        if(!user){
            return res.status(400).json({message:"Invalid Credentials"})
        }
      const isPasswordCorrect=  await bcrypt.compare(password,user.password)
      if(! isPasswordCorrect){
        return res.status(400).json({message:"Invalid Credentials"})
      }
      generateToken(user._id,res)
      res.status(200).json({
        _id:user._id,
        fullName:user.fullName,
        email:user.email,
        profilePic:user.profilePic,
      })
    } catch (error) {
        console.log("error in login controller",error);
        res.status(500).json({message:"internal server error"})
        
    }
}


export const logout=async(req,res)=>{

    try {
        res.cookie("jwt","",{maxAge:0})
        res.status(200).json({message:"Logged out successfully"})
    } catch (error) {
        console.log("error in logout controller",error);

    }
}

export const updateProfile=async(req,res)=>{

    try {
        const {profilePic}=req.body
     const userId= req.user._id
    //  if(!profilePic){
    //     return res.status(400).json({message:"profile pic is required"})
    //  }
     const uploadResponse=await cloudinary.uploader.upload(profilePic)
     const updateUser=await User.findByIdAndUpdate(userId,{profilePic:uploadResponse.secure_url},{new:true})
     res.status(200).json(updateUser)
     

    } catch (error) {
        console.log("error in updata profile",error);
        res.status(500).json({message:"internal error"})
    }
}
export const checkAuth=(req,res)=>{
    try {
        res.status(200).json(req.user)
    } catch (error) {
        console.log('error in checkauth',error.message);
        res.status(500).json({message:"internal server error"})
        
    }
}