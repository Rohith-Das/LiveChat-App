 import express from 'express'
import  {protectRoute} from '../middlewares/auth.middleware.js'
import {  sendMessage ,getMessages} from '../Controllers/message.controller.js'

 const router=express.Router()


router.post("/", protectRoute, sendMessage);
router.get("/:receiverId", protectRoute, getMessages);
 export default router