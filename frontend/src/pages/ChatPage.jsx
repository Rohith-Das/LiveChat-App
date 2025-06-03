import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { axiosInstance } from '../lib/axios';
import { MessageSquare, Send, Users, Loader2, Menu } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../store/useThemeStore';

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
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const {theme}=useThemeStore()

  useEffect(() => {
    if (!authUser) {
      navigate('/login');
      return;
    }

    if (socket) {
      socket.on('receiveMessage', (message) => {
        if (message.roomID === selectedChat?.roomID) {
          setMessages((prev) => [...prev, message]);
          socket.emit('messageReceived', {
            messageID: message._id,
            roomID: message.roomID,
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
      });

      socket.on('newMessageNotification', ({ roomID }) => {
        fetchChats();
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
        socket.off('newMessageNotification');
        socket.off('userStatus');
      };
    }
  }, [socket, selectedChat, authUser, navigate]);

  useEffect(() => {
    fetchUsers();
    fetchChats();
  }, [authUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      console.log('Chats response:', res.data);
      setChats(res.data);
    } catch (error) {
      toast.error('Failed to fetch chats');
    }
  };

  const handleSelectChat = async (chat) => {
    setIsLoading(true);
    try {
      setSelectedChat(chat);
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
      };
      setChats((prev) => {
        if (!prev.find((chat) => chat.roomID === newChat.roomID)) {
          return [...prev, newChat];
        }
        return prev;
      });
      setSelectedChat(newChat);
      socket.emit('joinRoom', { roomID: newChat.roomID, userID: authUser._id });
    } catch (error) {
      toast.error('Failed to start chat');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedChat) return;
    socket.emit('sendMessage', {
      roomID: selectedChat.roomID,
      senderID: authUser._id,
      content: messageInput,
    });
    setMessageInput('');
    socket.emit('stopTyping', { roomID: selectedChat.roomID, userID: authUser._id });
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

      {/* Sidebar: Users and Chats - Hidden on mobile when chat is selected */}
      <div 
        className={`${showSidebar || !selectedChat ? 'block' : 'hidden'} md:block w-full md:w-1/3 lg:w-1/4 border-r border-base-300 p-4 bg-base-100 z-10 absolute md:relative h-[calc(100vh-4rem)] md:h-auto overflow-y-auto`}
      >
        <h2 className="text-lg font-semibold mb-4">Chats</h2>
        <div className="space-y-2">
          {chats
            .filter((chat) => chat.participant)
            .map((chat) => (
              <div
                key={chat.roomID}
                onClick={() => {
                  handleSelectChat(chat);
                  setShowSidebar(false); // Close sidebar on mobile when chat is selected
                }}
                className={`p-3 rounded-lg cursor-pointer hover:bg-base-300 ${
                  selectedChat?.roomID === chat.roomID ? 'bg-base-300' : ''
                }`}
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
                </div>
              </div>
            ))}
        </div>
        <h2 className="text-lg font-semibold mt-6 mb-4">Users</h2>
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user._id}
              onClick={() => {
                handleStartChat(user);
                setShowSidebar(false); // Close sidebar on mobile when chat is started
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
                  <p className="font-medium truncate">{user.fullName}</p>
                  <p className="text-sm text-base-content/60 truncate">
                    {user.online ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${!selectedChat ? 'hidden md:flex' : ''}`}>
        {selectedChat ? (
          <>
            {/* Chat Header with Back Button on Mobile */}
            <div className="p-4 border-b border-base-300 flex items-center gap-4">
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
                  </h2>
                  {typingUser && (
                    <p className="text-xs text-base-content/60">
                      typing...
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto">
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
                        <p className="break-words">{message.content}</p>
                        <p className="text-xs text-base-content/60 mt-1">
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {message.senderID._id === authUser._id && (
                            <span className="ml-2">
                              {message.status === 'sent'
                                ? '✓'
                                : message.status === 'delivered'
                                ? '✓✓'
                                : '✓✓ (read)'}
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
            
            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-base-200">
              <div className="flex gap-2">
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
          </>
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