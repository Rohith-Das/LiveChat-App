 import axios from "axios";


 export const axiosInstance=axios.create({
   baseURL: "https://livechat-app-0tfz.onrender.com/api",
    withCredentials:true
 })
 export const formatMessageTime = (date) => {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};