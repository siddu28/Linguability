import { useState, useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import { supabase } from '../lib/supabaseClient'
import { Send, MessageCircle } from 'lucide-react'
import './ChatPanel.css'

const SOCKET_URL = 'http://localhost:3001'

function ChatPanel({ roomId, userId, userName }) {
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [isConnected, setIsConnected] = useState(false)
    const socketRef = useRef(null)
    const messagesEndRef = useRef(null)
    const chatBodyRef = useRef(null)

    // Auto-scroll to bottom
    const scrollToBottom = useCallback(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [])

    // Load message history from Supabase
    useEffect(() => {
        if (!roomId) return

        const loadHistory = async () => {
            try {
                const { data, error } = await supabase
                    .from('room_messages')
                    .select('*')
                    .eq('room_id', roomId)
                    .order('created_at', { ascending: true })
                    .limit(100)

                if (error) {
                    console.error('Error loading message history:', error)
                    return
                }

                if (data && data.length > 0) {
                    setMessages(data)
                }
            } catch (err) {
                console.error('Error loading messages:', err)
            }
        }

        loadHistory()
    }, [roomId])

    // Connect to Socket.io
    useEffect(() => {
        if (!roomId || !userId) return

        const socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling']
        })

        socketRef.current = socket

        socket.on('connect', () => {
            console.log('[Chat] Connected to server')
            setIsConnected(true)
            socket.emit('join-room', roomId, userId)
        })

        socket.on('disconnect', () => {
            console.log('[Chat] Disconnected from server')
            setIsConnected(false)
        })

        socket.on('receive-message', (message) => {
            console.log('[Chat] Message received:', message.user_name, message.content)
            setMessages(prev => {
                // Avoid duplicates (in case both socket and Supabase deliver)
                const exists = prev.some(m => m.id === message.id)
                if (exists) return prev
                return [...prev, message]
            })
        })

        socket.on('connect_error', (err) => {
            console.error('[Chat] Connection error:', err.message)
            setIsConnected(false)
        })

        return () => {
            socket.disconnect()
        }
    }, [roomId, userId])

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom()
    }, [messages, scrollToBottom])

    // Send message
    const sendMessage = (e) => {
        e.preventDefault()

        const trimmed = newMessage.trim()
        if (!trimmed || !socketRef.current || !isConnected) return

        socketRef.current.emit('send-message', {
            roomId,
            userId,
            userName,
            content: trimmed
        })

        setNewMessage('')
    }

    // Handle Enter key
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage(e)
        }
    }

    // Format timestamp
    const formatTime = (dateStr) => {
        const date = new Date(dateStr)
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    // Get avatar initial
    const getInitial = (name) => {
        return (name || '?').charAt(0).toUpperCase()
    }

    // Generate a consistent color from username
    const getAvatarColor = (name) => {
        const colors = [
            '#e74c6f', '#8b5cf6', '#3b82f6', '#10b981',
            '#f59e0b', '#ef4444', '#6366f1', '#14b8a6'
        ]
        let hash = 0
        for (let i = 0; i < (name || '').length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash)
        }
        return colors[Math.abs(hash) % colors.length]
    }

    return (
        <div className="chat-panel">
            {/* Header */}
            <div className="chat-header">
                <div className="chat-header-left">
                    <MessageCircle size={18} />
                    <h3>Chat</h3>
                </div>
                <div className={`chat-status ${isConnected ? 'online' : 'offline'}`}>
                    <span className="chat-status-dot"></span>
                    <span>{isConnected ? 'Live' : 'Offline'}</span>
                </div>
            </div>

            {/* Messages */}
            <div className="chat-body" ref={chatBodyRef}>
                {messages.length === 0 ? (
                    <div className="chat-empty">
                        <MessageCircle size={32} />
                        <p>No messages yet</p>
                        <span>Start the conversation!</span>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.user_id === userId
                        const showAvatar = index === 0 || messages[index - 1]?.user_id !== msg.user_id

                        return (
                            <div
                                key={msg.id || index}
                                className={`chat-message ${isMe ? 'mine' : 'theirs'}`}
                            >
                                {!isMe && showAvatar && (
                                    <div className="message-sender-name">
                                        {msg.user_name}
                                    </div>
                                )}
                                <div className="message-row">
                                    {!isMe && showAvatar && (
                                        <div
                                            className="message-avatar"
                                            style={{ backgroundColor: getAvatarColor(msg.user_name) }}
                                        >
                                            {getInitial(msg.user_name)}
                                        </div>
                                    )}
                                    {!isMe && !showAvatar && (
                                        <div className="message-avatar-spacer"></div>
                                    )}
                                    <div className="message-bubble">
                                        <p className="message-content">{msg.content}</p>
                                        <span className="message-time">{formatTime(msg.created_at)}</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form className="chat-input-bar" onSubmit={sendMessage}>
                <input
                    type="text"
                    className="chat-input"
                    placeholder={isConnected ? 'Type a message...' : 'Connecting...'}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={!isConnected}
                    maxLength={500}
                />
                <button
                    type="submit"
                    className="chat-send-btn"
                    disabled={!newMessage.trim() || !isConnected}
                    aria-label="Send message"
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    )
}

export default ChatPanel
