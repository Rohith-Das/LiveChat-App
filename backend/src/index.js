
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


dotenv.config()

const app=express();

connectDB()

app.use(express.json({limit:'10mb'}))
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser())


const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    },
});

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));



const PORT = process.env.PORT || 5002;

app.use('/api/auth',authRoutes)
app.use('/api/messages',messageRoutes)
app.use('/api/users',userRoutes)


io.on("connection",(socket)=>{
  console.log('user connected',socket.id);
  socket.on("joinRoom",({userId,otherUserId})=>{
    const roomId=[userId,otherUserId].sort().join("_");
    socket.join(roomId);
      console.log(`User ${userId} joined room ${roomId}`);
  })
  socket.on("sendMessage",async ({roomId,senderId,receiverId,text,image})=>{
    const message={
      senderId,
      receiverId,
      text,
      image,
    };
    io.to(roomId).emit("receiveMessage",message);

    try {
      await axiosInstance.post("/api/message",{
         senderId,
      receiverId,
      text,
      image,
      })
    } catch (error) {
       console.error("Error saving message:", error);
    }

  });

  socket.on("disconnect",()=>{
            console.log("User disconnected:", socket.id);
  })
  
})

server.listen(PORT, ()=>{
    console.log(`🚀 Server running on http://localhost:${PORT}`);
})



