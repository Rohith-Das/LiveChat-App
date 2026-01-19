 import express from 'express'
import  {protectRoute} from '../middlewares/auth.middleware.js'
import { getMessages,getUserChats,createChatRoom ,downloadFile} from '../Controllers/message.controller.js'
 const router=express.Router()
 
router.get("/chats", protectRoute, getUserChats);
router.post("/room", protectRoute, createChatRoom);
router.get("/messages/:roomID", protectRoute, getMessages);
router.get('/download/:messageId',protectRoute,downloadFile)
 export default router