'use client';

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import axios, { AxiosError } from 'axios';
import { userData } from '@/interfaces/interfaces';
interface Message {
    _id: string;
    sender: userData;
    roomId: string;
    message: string;
    messageFiles: string[] | null;
    createdAt: Date;
    updatedAt: Date;
    __v: number;
}


interface User {
    _id: string;
    fullName: string;
    profilePicture?: string;
}

const ChatRoom = ({ roomId, currentUser }: { roomId?: string; currentUser: userData }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    // Initialize socket connection
    useEffect(() => {
        const newSocket = io("https://signaling-server-for-ht-center.onrender.com", { path: "/socketio", transports: ["websocket", "polling"] });
        setSocket(newSocket);

        newSocket.on('connect', () => {
            setIsConnected(true);
            newSocket.emit('join-room', { roomId });
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
        });

        newSocket.on('receiveMessage', (messageData: Message) => {
            console.log('Received message:', messageData);
            setMessages(prev => [...prev, messageData]);
        });

        newSocket.on('messageError', (success: boolean, message: string) => {
            setError(message);
        });

        newSocket.on('messageSuccess', (success: boolean, messageId: string) => {
            setError(null);

        });

        // Load previous messages
        const fetchMessages = async () => {
            try {
                const response = await axios.get(`/api/messages/${roomId}`);
                setMessages(response.data.messages);
            } catch (error: unknown) {
                if (error instanceof AxiosError) {
                    console.error('Error fetching messages:', error?.response?.data?.message);
                } else {
                    console.error('Error fetching messages:', error);
                }
            }
        };

        fetchMessages();

        return () => {
            newSocket.disconnect();
        };
    }, [roomId]);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const sendMessage = async () => {
        if ((!newMessage.trim() && !selectedFile) || !socket) return;

        try {
            setLoading(true);
            socket.emit('sendMessage', {
                message: newMessage.trim(),
                sender: currentUser._id,
                roomId,
                messageFiles: selectedFile ? [selectedFile] : null
            });

            setNewMessage('');
            setSelectedFile(null);
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                console.error('Error sending message:', error?.response?.data?.message);
            } else {
                console.error('Error sending message:', error);
            }
        }finally{
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
            {/* Chat Header */}
            <div className="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Chat Room</h2>
                    <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {isConnected ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
                {messages?.map((message) => (
                    <MessageBubble
                        key={message._id}
                        message={message}
                        isOwn={message.sender._id === currentUser._id}
                    />
                ))}

                <div ref={messagesEndRef} />
                
               
            </div>

            {/* Message Input */}
            <div className="bg-white dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                {selectedFile && (
                    <div className="flex items-center justify-between mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <span className="text-sm text-blue-700 dark:text-blue-300 truncate">
                            {selectedFile.name}
                        </span>
                        <button
                            onClick={() => setSelectedFile(null)}
                            className="text-red-500 hover:text-red-700"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                <div className="flex space-x-3">
                    {/* File Upload Button */}
                    <label className="flex-shrink-0 cursor-pointer">
                        <input
                            type="file"
                            onChange={handleFileSelect}
                            className="hidden"
                            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                        />
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                        </div>
                    </label>

                    {/* Message Input */}
                    <div className="flex-1 relative">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            rows={1}
                        />
                    </div>

                    {/* Send Button */}
                    <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() && !selectedFile}
                        className="flex-shrink-0 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

// Message Bubble Component
const MessageBubble = ({ message, isOwn }: { message: Message; isOwn: boolean }) => {
    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
            <div className={`max-w-xs lg:max-w-md ${isOwn ? 'ml-10' : 'mr-10'}`}>
                {/* Sender Name for others */}
                {!isOwn && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 ml-1">
                        {message.sender?.fullName}
                    </p>
                )}

                <div className="flex items-start gap-2">
                    {/* Profile Picture for others */}
                    {!isOwn && (
                        <img
                            src={message.sender?.profilePicture || '/profile.png'}
                            alt="Profile"
                            className="w-6 h-6 rounded-full object-cover flex-shrink-0 mt-1"
                        />
                    )}

                    {/* Message Content */}
                    <div className={`px-3 py-2 rounded-xl ${isOwn
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        }`}>
                        <p className="text-sm">{message.message}</p>

                        {/* File Attachments */}
                        {message.messageFiles && message.messageFiles.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-opacity-20">
                                {message.messageFiles.map((file, index) => (
                                    <FilePreview key={index} fileUrl={file} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Profile Picture for self */}
                    {isOwn && (
                        <img
                            src={message.sender?.profilePicture || '/profile.png'}
                            alt="Profile"
                            className="w-6 h-6 rounded-full object-cover flex-shrink-0 mt-1"
                        />
                    )}
                </div>

                {/* Timestamp */}
                <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mt-1`}>
                    <p className={`text-xs ${isOwn ? 'text-gray-500 dark:text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                </div>
            </div>
        </div>
    );
};

// File Preview Component
const FilePreview = ({ fileUrl }: { fileUrl: string }) => {
    const fileExtension = fileUrl.split('.').pop()?.toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension || '');
    const isVideo = ['mp4', 'webm', 'ogg'].includes(fileExtension || '');
    const isAudio = ['mp3', 'wav', 'ogg'].includes(fileExtension || '');

    return (
        <div className="p-2">
            {isImage ? (
                <img
                    src={fileUrl}
                    alt="Attachment"
                    className="max-w-full h-auto rounded cursor-pointer"
                    onClick={(e) => {
                        const el = e.currentTarget;
                        if (!document.fullscreenElement) {
                            el.requestFullscreen().catch((err) => console.warn("Failed to enter fullscreen:", err));
                        } else {
                            document.exitFullscreen();
                        }
                    }}
                />

            ) : isVideo ? (
                <video src={fileUrl} controls className="max-w-full rounded" />
            ) : isAudio ? (
                <audio src={fileUrl} controls className="w-full" />
            ) : (
                <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 dark:text-blue-400 hover:underline"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download File
                </a>
            )}
        </div>
    );
};

export default ChatRoom;