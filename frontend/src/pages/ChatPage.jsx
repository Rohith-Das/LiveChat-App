


import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { axiosInstance, formatMessageTime } from '../lib/axios';
import { MessageSquare, Send, Users, Loader2, Menu, Check, CheckCheck,Smile  } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../store/useThemeStore';
import EmojiPicker from 'emoji-picker-react'


export default function ChatPage() {
  const { authUser, socket, setOnlineUsers } = useAuthStore();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [chatNotifications, setChatNotifications] = useState({});

  const messagesEndRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);  const navigate = useNavigate();
  const { theme } = useThemeStore();

  // close emoji picker when clicking outside

  useEffect(()=>{
    const handleClickOutside=(event)=>{
      if(emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)&&
        emojiButtonRef.current && !emojiButtonRef.current.contains(event.target)
      ){
        setShowEmojiPicker(false)
      }
    }
    document.addEventListener('mousedown',handleClickOutside);
    return ()=>{
      document.removeEventListener('mousedown',handleClickOutside)
    }
  },[])
// 
useEffect(() => {
  const savedNotifications = localStorage.getItem('chatNotifications');
  if (savedNotifications) {
    setChatNotifications(JSON.parse(savedNotifications));
  }
}, []);
//
//  that tracks chatNotifications changes
useEffect(() => {
  localStorage.setItem('chatNotifications', JSON.stringify(chatNotifications));
}, [chatNotifications]);

  useEffect(() => {
    if (!authUser) {
      navigate('/login');
      return;
    }

    if (socket) {

      socket.on('receiveMessage', (message) => {  
  setMessages((prev) => {
    // Check if message exists by ID or tempId
    const exists = prev.some(msg => 
      msg._id === message._id || 
      msg.tempId === message.tempId
    );
    
    if (exists) {
      // Update existing message (for temp messages)
      return prev.map(msg => 
        (msg._id === message._id || msg.tempId === message.tempId) 
          ? { ...message, tempId: undefined } 
          : msg
      );
    } else {
      // Add new message
      return [...prev, message];
    }
  });

  // Update chat list if this isn't the current chat
  if (message.roomID !== selectedChat?.roomID) {
    fetchChats();
  }
   // Update notification count if this isn't the current chat
  if (message.roomID !== selectedChat?.roomID) {
    setChatNotifications(prev => ({
      ...prev,
      [message.roomID]: (prev[message.roomID] || 0) + 1
    }));
  }
  
  // Mark as delivered if it's the current chat and we're the recipient
  if (message.roomID === selectedChat?.roomID && 
      message.senderID._id !== authUser._id) {
    socket.emit('messageReceived', {
      messageID: message._id,
      roomID: message.roomID
    });
    //clear if open
     setChatNotifications(prev => {
      const newNotifs = {...prev};
      delete newNotifs[message.roomID];
      return newNotifs;
    });
  }
});
      socket.on('loadMessages', (loadedMessages) => {
        setMessages(loadedMessages);
      });

      socket.on('typing', ({ userID }) => {
        if (selectedChat) {
          const otherUser = selectedChat.participant;
          if (otherUser._id === userID) {
            setTypingUser(otherUser);
          }
        }
      });

      socket.on('stopTyping', () => {
        setTypingUser(null);
      });

      socket.on('messageStatusUpdate', ({ messageID, status }) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageID ? { ...msg, status } : msg
          )
        );
        // Update chat list to reflect read status (optional, if you want to show read receipts there)
        setChats(prevChats =>
          prevChats.map(chat => {
            if (chat.roomID === selectedChat?.roomID && chat.lastMessage?._id === messageID) {
              return { ...chat, lastMessage: { ...chat.lastMessage, status } };
            }
            return chat;
          })
        );
      });

      socket.on('bulkMessageStatusUpdate', ({ roomID, userId, status }) => {
        if (roomID === selectedChat?.roomID && userId === authUser._id && status === 'delivered') {
          setMessages(prevMessages =>
            prevMessages.map(msg =>
              msg.senderID._id !== authUser._id && msg.status === 'sent' ? { ...msg, status: 'delivered' } : msg
            )
          );
        }
      });

    //clear notifications when read
socket.on('messageRead', async ({ messageID, roomID }) => {
  try {
    await Message.findByIdAndUpdate(messageID, { status: 'read' });
    io.to(roomID).emit('messageStatusUpdate', { messageID, status: 'read' });
    
    // Clear notification for this chat
    const recipientSocketID = userSocketMap[userId];
    if (recipientSocketID) {
      io.to(recipientSocketID).emit('clearNotification', { roomID });
    }
  } catch (error) {
    console.log('Error in messageRead:', error);
  }
});



// Add this inside your socket event handlers
socket.on('clearNotification', ({ roomID }) => {
  setChatNotifications(prev => {
    const newNotifs = { ...prev };
    delete newNotifs[roomID];
    return newNotifs;
  });
  
  // Also update the chats list
  setChats(prevChats => 
    prevChats.map(chat => 
      chat.roomID === roomID 
        ? { ...chat, unreadCount: 0 }
        : chat
    )
  );
});

socket.on('newMessageNotification', ({ roomID, senderID, senderName, senderAvatar, content, count }) => {
  // Only update if this isn't the currently selected chat
  if (roomID !== selectedChat?.roomID) {
    setChatNotifications(prev => ({
      ...prev,
      [roomID]: (prev[roomID] || 0) + count
    }));

    // Update the chats list to keep it in sync
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.roomID === roomID 
          ? { 
              ...chat, 
              unreadCount: (chat.unreadCount || 0) + count,
              lastMessage: { content, createdAt: new Date() }
            }
          : chat
      )
    );
    
    // Play notification sound
    const notificationSound = new Audio('/notification.mp3');
    notificationSound.play().catch(e => console.log("Audio play failed:", e));
  }
});





      socket.on('userStatus', ({ userID, online }) => {
        setUsers((prev) =>
          prev.map((user) =>
            user._id === userID ? { ...user, online } : user
          )
        );
        setOnlineUsers(users.filter((user) => user.online).map((u) => u._id));
      });

      return () => {
        socket.off('receiveMessage');
        socket.off('loadMessages');
        socket.off('typing');
        socket.off('stopTyping');
        socket.off('messageStatusUpdate');
        socket.off('bulkMessageStatusUpdate');
        socket.off('newMessageNotification');
        socket.off('userStatus');
        socket.off('clearNotification');
      };
    }
  }, [socket, selectedChat, authUser, navigate]);

  useEffect(() => {
    fetchUsers();
    fetchChats();
  }, [authUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    // Mark messages as read when the chat is opened
    if (selectedChat && socket) {
      messages.forEach(message => {
        if (message.senderID._id !== authUser._id && message.status !== 'read') {
          socket.emit('messageRead', { messageID: message._id, roomID: selectedChat.roomID });
        }
      });
    }
  }, [messages, selectedChat, authUser, socket]);

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get('/users');
      setUsers(res.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    }
  };

  const fetchChats = async () => {
    try {
      const res = await axiosInstance.get('/messages/chats');
      setChats(res.data);
    } catch (error) {
      toast.error('Failed to fetch chats');
    }
  };

const handleSelectChat = async (chat) => {
  setIsLoading(true);
  try {
    setSelectedChat(chat);
    setMessages([]);
    
    // Clear notifications for this chat
    setChatNotifications(prev => {
      const newNotifs = { ...prev };
      delete newNotifs[chat.roomID];
      return newNotifs;
    });
    
    // Mark messages as read on the backend
    await axiosInstance.get(`/messages/messages/${chat.roomID}`);
    
    // Update local chats state
    setChats(prevChats =>
      prevChats.map(c =>
        c.roomID === chat.roomID ? { ...c, unreadCount: 0 } : c
      )
    );
    
    // Join the room
    socket.emit('joinRoom', { roomID: chat.roomID, userID: authUser._id });
  } catch (error) {
    toast.error('Failed to load chat');
  } finally {
    setIsLoading(false);
  }
};

  const handleStartChat = async (user) => {
    try {
      const res = await axiosInstance.post('/messages/room', {
        recipientID: user._id,
      });
      const newChat = {
        roomID: res.data.roomID,
        participant: user,
        lastMessage: null,
        unreadCount: 0
      };
      setChats((prev) => {
        if (!prev.find((chat) => chat.roomID === newChat.roomID)) {
          return [newChat, ...prev];
        }
        return prev;
      });
      setSelectedChat(newChat);
      setMessages([]);
      socket.emit('joinRoom', { roomID: newChat.roomID, userID: authUser._id });
    } catch (error) {
      toast.error('Failed to start chat');
    }
  };
const handleSendMessage = async (e) => {
  e.preventDefault();
  if (!messageInput.trim() || !selectedChat) return;

  const tempId = `temp-${Date.now()}`;
  const tempMessage = {
    _id: tempId,
    roomID: selectedChat.roomID,
    senderID: { 
      _id: authUser._id,
      fullName: authUser.fullName,
      profilePic: authUser.profilePic
    },
    content: messageInput,
    status: 'sent',
    createdAt: new Date(),
    tempId // Include tempId in the temp message
  };

  // Optimistically add the temp message
  setMessages(prev => [...prev, tempMessage]);
  setMessageInput('');
  setShowEmojiPicker(false);

  // Emit the message
  socket.emit('sendMessage', {
    roomID: selectedChat.roomID,
    senderID: authUser._id,
    content: messageInput,
    tempId // Send tempId to server
  });

  socket.emit('stopTyping', { 
    roomID: selectedChat.roomID, 
    userID: authUser._id 
  });
};

  const handleTyping = () => {
    if (selectedChat) {
      socket.emit('typing', { roomID: selectedChat.roomID, userID: authUser._id });
    }
  };

  const handleStopTyping = () => {
    if (selectedChat) {
      socket.emit('stopTyping', { roomID: selectedChat.roomID, userID: authUser._id });
    }
  };

  const handleEmojiClick=(emojiData)=>{
     setMessageInput(prev => prev + emojiData.emoji);
    handleTyping()
  }
   const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };
   const renderMessageContent = (content) => {
    return <span style={{ fontSize: '16px', lineHeight: '1.4' }}>{content}</span>;
  };
  
return (
  <div className="min-h-screen pt-16 flex flex-col md:flex-row">
    {/* Mobile Header with Menu Button */}
    <div className="md:hidden flex items-center justify-between p-4 border-b border-base-300">
      <h1 className="text-xl font-bold">Chat App</h1>
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="btn btn-ghost"
      >
        <Menu className="w-5 h-5" />
      </button>
    </div>

   <div
  className={`${showSidebar || !selectedChat ? 'block' : 'hidden'} md:block w-full md:w-1/3 lg:w-1/4 border-r border-base-300 bg-base-100 z-10 absolute md:relative h-[calc(100vh-4rem)]`}
>  
    {/* leftside sidebar on the page */}
     {/* Sidebar: Users and Chats - Independent scrolling */}
      <div className="h-full flex flex-col">
        {/* Fixed sidebar header */}
        <div className="p-4 sticky top-0 bg-base-100 z-10 border-b border-base-300">
          <h2 className="text-lg font-semibold">Chats</h2>
        </div>
        
        {/* Scrollable sidebar content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-2">
            {chats
              .sort((a, b) => {
                const dateA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt) : new Date(0);
                const dateB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt) : new Date(0);
                return dateB - dateA;
              })
              .filter((chat) => chat.participant)
              .map((chat) => (
                <div
                  key={chat.roomID}
                  onClick={() => {
                    handleSelectChat(chat);
                    setShowSidebar(false);
                  }}
                  className={`p-3 rounded-lg cursor-pointer hover:bg-base-300 ${
                    selectedChat?.roomID === chat.roomID ? 'bg-base-300' : ''
                  } relative`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={chat.participant.profilePic || '/user.png'}
                      alt={chat.participant.fullName || 'Unknown User'}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{chat.participant.fullName}</p>
                      <p className="text-sm text-base-content/60 truncate">
                        {chat.lastMessage?.content || 'No messages yet'}
                      </p>
                    </div>
                    {(chatNotifications[chat.roomID] > 0 || chat.unreadCount > 0) && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {chatNotifications[chat.roomID] || chat.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>

          <div className="p-4 border-t border-base-300">
            <h2 className="text-lg font-semibold mb-4">Users</h2>
            <div className="space-y-2">
              {users
                .filter(user => user._id !== authUser._id)
                .map((user) => (
                  <div
                    key={user._id}
                    onClick={() => {
                      handleStartChat(user);
                      setShowSidebar(false);
                    }}
                    className="p-3 rounded-lg cursor-pointer hover:bg-base-300"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.profilePic || '/user.png'}
                        alt={user.fullName}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {user.fullName}
                          {users.find(u => u._id === user._id)?.online && (
                            <span className="text-green-500 font-semibold ml-1">(Online)</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Chat Area - right area of the page*/}
<div className={`flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto ${!selectedChat ? 'hidden md:flex' : ''}`}>
      {selectedChat ? (
        <div className="flex flex-col h-full">
          {/* Fixed chat header */}
          <div className="p-4 border-b border-base-300 flex items-center gap-4 bg-base-100 sticky top-16 z-50">
            <button
              className="md:hidden btn btn-ghost btn-sm"
              onClick={() => {
                setSelectedChat(null);
                setShowSidebar(true);
              }}
            >
              ← Back
            </button>
            <div className="flex items-center gap-3">
              <img
                src={selectedChat.participant.profilePic || '/user.png'}
                alt={selectedChat.participant.fullName}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h2 className="text-lg font-semibold truncate">
                  {selectedChat.participant.fullName}
                  <span>
                    {typingUser?._id === selectedChat.participant._id && (
                      <p className="bg-green-500 text-xs text-base-content/60">
                        typing...
                      </p>
                    )}
                  </span>
                </h2>
              </div>
            </div>
          </div>

          {/* Scrollable messages area */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="animate-spin w-10 h-10 text-gray-500" />
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${
                      message.senderID._id === authUser._id
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >
                    <div
                      style={{ backgroundColor: message.senderID._id === authUser._id ? theme.accent : '' }}
                      className={`max-w-[80%] sm:max-w-md p-3 rounded-lg ${
                        message.senderID._id === authUser._id
                          ? 'bg-primary text-white'
                          : 'bg-base-200 text-base-content'
                      }`}
                    >
                      {renderMessageContent(message.content)}
                      <p className="text-xs text-base-content/60 mt-1 flex items-center justify-end">
                        {formatMessageTime(message.createdAt)}
                        {message.senderID._id === authUser._id && (
                          <span className="ml-2">
                            {message.status === 'sent' ? (
                              <Check className="inline-block w-4 h-4" />
                            ) : message.status === 'delivered' ? (
                              <CheckCheck className="inline-block w-4 h-4" />
                            ) : (
                              <CheckCheck className="inline-block w-4 h-4 text-blue-500" />
                            )}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Fixed message input */}
          <div className="sticky bottom-0 bg-base-200 p-4 border-t border-base-300">
            <form onSubmit={handleSendMessage} className="relative">
              {showEmojiPicker && (
                <div 
                  ref={emojiPickerRef}
                  className="absolute bottom-20 left-4 z-50 shadow-lg rounded-lg overflow-hidden"
                  style={{ 
                    background: 'white',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    width={300}
                    height={400}
                    searchDisabled={false}
                    skinTonesDisabled={false}
                    previewConfig={{
                      showPreview: false
                    }}
                  />
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  ref={emojiButtonRef}
                  type="button"
                  onClick={toggleEmojiPicker}
                  className="btn btn-ghost btn-sm px-2"
                  title="Add emoji"
                >
                  <Smile className="w-5 h-5" />
                </button>
                
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => {
                    setMessageInput(e.target.value);
                    handleTyping();
                  }}
                  onBlur={handleStopTyping}
                  placeholder="Type a message..."
                  className="input input-bordered flex-1"
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!messageInput.trim()}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-base-content/60">
            <MessageSquare className="w-16 h-16 mx-auto mb-4" />
            <p>Select a chat or start a new one</p>
          </div>
        </div>
      )}
    </div>
  </div>
);
}