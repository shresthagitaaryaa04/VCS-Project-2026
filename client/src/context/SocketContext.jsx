import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import useChatStore from '../store/useChatStore';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const SocketContext = createContext(null);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const { isAuthenticated, user } = useAuthStore();

    useEffect(() => {
        // Only connect if user is authenticated
        if (!isAuthenticated || !user) {
            // Disconnect if socket exists
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        // Create socket connection
        const serverUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, "");
        const token = localStorage.getItem('token');

        const newSocket = io(serverUrl, {
            auth: {
                token: token
            },
            query: {
                userId: user._id,
                token: token
            },
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        // Connection event handlers
        newSocket.on('connect', () => {
            console.log('Socket connected:', newSocket.id);
            setIsConnected(true);
        });

        newSocket.on('disconnect', (reason) => {
            console.log(' Socket disconnected:', reason);
            setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
            setIsConnected(false);
        });

        setSocket(newSocket);

        // Cleanup on unmount or when dependencies change
        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, [isAuthenticated, user]);

    // Handle Global Socket Events
    useEffect(() => {
        if (!socket) return;

        const fetchConversations = async () => {
             try {
                const res = await axios.get('/api/chat/conversations');
                if (res.data.success) {
                    useChatStore.getState().setConversations(res.data.conversations);
                }
            } catch (error) {
                console.error("Failed to fetch conversations:", error);
            }
        };

        const handleNewMessage = (message) => {
            const { activeConversation, addMessage, conversations, updateConversation, incrementUnreadCount } = useChatStore.getState();

            addMessage(message);

            const existingConv = conversations.find(c => c._id === message.conversationId);
            if (existingConv) {
                updateConversation({
                    _id: message.conversationId,
                    lastMessage: message,
                    updatedAt: new Date().toISOString()
                });

                if (!activeConversation || activeConversation._id !== message.conversationId) {
                    incrementUnreadCount(message.conversationId);
                } else {
                    socket.emit('mark_read', { conversationId: message.conversationId });
                }
            } else {
                fetchConversations();
            }
        };

        const handleConversationUpdated = (updatedConv) => {
            const { updateConversation, conversations } = useChatStore.getState();
            const existing = conversations.find(c => c._id === updatedConv._id);
            if (existing) {
                updateConversation(updatedConv);
            } else {
                fetchConversations();
            }
        };

        const handleTyping = ({ conversationId, userId, isTyping }) => {
            useChatStore.getState().setTyping(conversationId, userId, isTyping);
        };
        
        const handleOnlineUsers = ({ userIds }) => {
            useChatStore.getState().setOnlineUsers(userIds);
        };

        const handleUserOnline = ({ userId }) => {
            useChatStore.getState().addOnlineUser(userId);
        };

        const handleUserOffline = ({ userId }) => {
            useChatStore.getState().removeOnlineUser(userId);
        };

        const handleFriendRequestAccepted = (data) => {
            const name = data.name || data.senderName || 'Someone';
            toast.success(`${name} accepted your friend request! 🎉`, {
                position: 'bottom-right',
                duration: 5000,
                style: { background: '#1a472a', color: '#fff' }
            });
        };

        socket.on('new_message', handleNewMessage);
        socket.on('conversation_updated', handleConversationUpdated);
        socket.on('user_typing', handleTyping);
        socket.on('online_users', handleOnlineUsers);
        socket.on('user_online', handleUserOnline);
        socket.on('user_offline', handleUserOffline);
        socket.on('friend_request_accepted', handleFriendRequestAccepted);

        fetchConversations();

        return () => {
            socket.off('new_message', handleNewMessage);
            socket.off('conversation_updated', handleConversationUpdated);
            socket.off('user_typing', handleTyping);
            socket.off('online_users', handleOnlineUsers);
            socket.off('user_online', handleUserOnline);
            socket.off('user_offline', handleUserOffline);
            socket.off('friend_request_accepted', handleFriendRequestAccepted);
        };
    }, [socket]);

    const value = {
        socket,
        isConnected
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
