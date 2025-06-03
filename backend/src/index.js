
import http from 'http'
import {Server} from 'socket.io'
import cookieParser from "cookie-parser"
import express from "express"
import dotenv from "dotenv"
import userRoutes from './routes/userRoutes.js'
import authRoutes from './routes/authRoutes.js'
import { connectDB } from "./lib/db.js"
import messageRoutes from './routes/messageRoutes.js'
import cors from 'cors'
import { Socket } from 'dgram'
import { axiosInstance } from '../../frontend/src/lib/axios.js'
import jwt from 'jsonwebtoken'
import Message from './models/messageModel.js'
import ChatRoom from './models/chatRoomModel.js'

dotenv.config()

const app=express();
const server=http.createServer(app)
const io=new Server(server,{
  cors:{
     origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  },
})
connectDB()

app.use(express.json())
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser())


app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

const userSocketMap = {};

io.on('connection', (socket) => {
  const token = socket.handshake.auth.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userSocketMap[decoded.userId] = socket.id;
    } catch (error) {
      console.log('Socket authentication error:', error);
      socket.disconnect();
    }
  }

  socket.on('joinRoom', async ({ roomID, userID }) => {
    socket.join(roomID);
    const messages = await Message.find({ roomID })
      .populate('senderID', 'fullName profilePic')
      .sort({ createdAt: 1 })
      .limit(50);
    socket.emit('loadMessages', messages);
  });

  socket.on('sendMessage', async ({ roomID, senderID, content }) => {
    try {
      const message = new Message({
        roomID,
        senderID,
        content,
        status: 'sent',
      });
      await message.save();
      const populatedMessage = await Message.findById(message._id).populate(
        'senderID',
        'fullName profilePic'
      );
      io.to(roomID).emit('receiveMessage', populatedMessage);

      const chatRoom = await ChatRoom.findOne({ roomID });
      const recipientID = chatRoom.participants.find(
        (id) => id.toString() !== senderID.toString()
      );
      const recipientSocketID = userSocketMap[recipientID];
      if (recipientSocketID) {
        io.to(recipientSocketID).emit('newMessageNotification', { roomID });
      }
    } catch (error) {
      console.log('Error in sendMessage:', error);
    }
  });

  socket.on('typing', ({ roomID, userID }) => {
    socket.to(roomID).emit('typing', { userID });
  });

  socket.on('stopTyping', ({ roomID, userID }) => {
    socket.to(roomID).emit('stopTyping', { userID });
  });

  socket.on('messageReceived', async ({ messageID, roomID }) => {
    try {
      await Message.findByIdAndUpdate(messageID, { status: 'delivered' });
      io.to(roomID).emit('messageStatusUpdate', { messageID, status: 'delivered' });
    } catch (error) {
      console.log('Error in messageReceived:', error);
    }
  });

  socket.on('messageRead', async ({ messageID, roomID }) => {
    try {
      await Message.findByIdAndUpdate(messageID, { status: 'read' });
      io.to(roomID).emit('messageStatusUpdate', { messageID, status: 'read' });
    } catch (error) {
      console.log('Error in messageRead:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    const userID = Object.keys(userSocketMap).find(
      (key) => userSocketMap[key] === socket.id
    );
    if (userID) {
      delete userSocketMap[userID];
      io.emit('userStatus', { userID, online: false });
    }
  });
});

const PORT = process.env.PORT || 5002;

app.use('/api/auth',authRoutes)
app.use('/api/messages',messageRoutes)
app.use('/api/users',userRoutes)


server.listen(PORT, ()=>{
    console.log(`🚀 Server running on http://localhost:${PORT}`);
})



