import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import {io} from 'socket.io-client'

export const useAuthStore = create((set) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isCheckingAuth: true,
  isUpdatingProfile: false,
  onlineUsers:[],
  socket:null,

checkAuth: async () => {
  try {
    const res = await axiosInstance.get("/auth/check");
    set((state) => {
      if (!state.authUser || res.data._id !== state.authUser._id) {
        return { authUser: res.data };
      }
      return {};
    });
  } catch (error) {
    console.log("Check auth error:", error);
    set({ authUser: null });
  } finally {
    set({ isCheckingAuth: false });
  }
},

  signUp:async (data) =>{
    set({isSigningUp:true})
    try {
      const res=await axiosInstance.post("/auth/signup",data)
      set({authUser:res.data})
      toast.success("Account created Successfully")
      return true
    } catch (error) {
  console.log("Signup error:", error);
  toast.error(error.response?.data?.message || "Something went wrong");
  return false;
}finally{
      set({isSigningUp:false})
    }
  },

  logout:async()=>{

    try {
      await axiosInstance.post('/auth/logout')
      set({authUser:null});
      toast.success("Logged Out Successfully")

    } catch (error) {
        toast.error(error.response?.data?.message || "Something went wrong");

    }
  },

  login:async(data)=>{
    set({ isLoggingIn: true });
    try {
      const res=await axiosInstance.post("/auth/login",data)
      set({authUser:res.data});
      toast.success("Logged in Successfully")
      return true
    } catch (error) {
const errorMessage = error.response?.data?.message || "Something went wrong";      return false
    }finally{
      set({isLoggingIn:false})
    }
  },

  updateProfile: async (data) => {
  set({ isUpdatingProfile: true });
  try {
    const res = await axiosInstance.put("/auth/update-profile", data);
    set({ authUser: res.data });
    toast.success("Profile Updated Successfully");
  } catch (error) {
    console.log("error in updating profile", error);
    toast.error(error.response?.data?.message || "Failed to update profile");
  } finally {
    set({ isUpdatingProfile: false });
  }
},
followeUser: async(userId)=>{
  try {
    await axiosInstance.post(`/users/follow/${userId}`)
    toast.success("Followed successfully");
            return true;
  } catch (error) {
                toast.error(error.response?.data?.message || "Failed to follow user");
            return false;
  }
},
  unfollowUser: async (userId) => {
        try {
            await axiosInstance.post(`/users/unfollow/${userId}`);
            toast.success("Unfollowed successfully");
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to unfollow user");
            return false;
        }
    },

}));
