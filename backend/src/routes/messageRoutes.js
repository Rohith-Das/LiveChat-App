 import express from 'express'
import  {protectRoute} from '../middlewares/auth.middleware.js'
import { getMessages,getUserChats,createChatRoom } from '../Controllers/message.controller.js'
 const router=express.Router()
 
router.get("/chats", protectRoute, getUserChats);
router.post("/room", protectRoute, createChatRoom);
router.get("/messages/:roomID", protectRoute, getMessages);

 export default router