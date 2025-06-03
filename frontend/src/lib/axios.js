 import axios from "axios";


 export const axiosInstance=axios.create({
    baseURL: "http://localhost:5002/api",
    withCredentials:true
 })
 export const formatMessageTime = (date) => {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};