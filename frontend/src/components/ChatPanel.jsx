import { useState, useEffect, useRef, useCallback } from 'react'
import { Send } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import './ChatPanel.css'

function ChatPanel({ roomId, user, isOpen, socket }) {
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [sending, setSending] = useState(false)
    const messagesEndRef = useRef(null)

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [messages, scrollToBottom])

    // Fetch existing messages from Supabase (History)
    const fetchMessages = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('room_messages')
                .select('*')
                .eq('room_id', roomId)
                .order('created_at', { ascending: true })

            if (error) throw error
            setMessages(data || [])
        } catch (err) {
            console.error('Error fetching messages:', err)
        }
    }, [roomId])

    // Initial fetch and Socket listeners
    useEffect(() => {
        if (!roomId) return

        fetchMessages()

        if (socket) {
            socket.on('receive-message', (message) => {
                setMessages(prev => {
                    // Avoid duplicates if we are also fetching or if same message comes twice
                    // (Using ID check is good practice)
                    if (prev.some(m => m.id === message.id)) return prev
                    return [...prev, message]
                })
            })
        }

        return () => {
            if (socket) {
                socket.off('receive-message')
            }
        }
    }, [roomId, fetchMessages, socket])

    // Send message via Socket
    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!newMessage.trim() || !user || !socket) return

        // setSending(true) // Optional: disable while sending if we want to confirm receipt? 
        // With sockets, it's fire and forget mostly, or wait for ack.
        // For optimisitc UI, we typically just send.

        const messageText = newMessage.trim()
        setNewMessage('')

        // Emit to server
        const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous'

        socket.emit('send-message', {
            roomId,
            userId: user.id,
            userName: userName,
            content: messageText
        })

        // We don't strictly need to add it manually if the server broadcasts back to us too.
        // But for faster UI, we might want to append pending message.
        // The server implementation above uses `io.in(roomId).emit` so it WILL come back to sender.
        // So we can just wait for 'receive-message' or append optimistically.
        // Let's rely on the broadcast for simplicity and consistency of IDs.
    }

    // Format timestamp
    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (!isOpen) return null

    return (
        <div className="chat-panel">
            <div className="chat-header">
                <h3>Chat</h3>
            </div>

            <div className="chat-messages">
                {messages.length === 0 ? (
                    <div className="chat-empty">
                        <p>No messages yet</p>
                        <span>Start the conversation!</span>
                    </div>
                ) : (
                    messages.map((message) => {
                        const isOwn = message.user_id === user?.id
                        return (
                            <div
                                key={message.id || Math.random()} // Fallback key if temp ID collision
                                className={`chat-message ${isOwn ? 'own' : 'other'}`}
                            >
                                {!isOwn && (
                                    <span className="message-sender">{message.user_name}</span>
                                )}
                                <div className="message-bubble">
                                    <p className="message-content">{message.content}</p>
                                    <span className="message-time">
                                        {formatTime(message.created_at)}
                                    </span>
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-form" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="chat-input"
                    disabled={!socket} // Disable if no connection
                />
                <button
                    type="submit"
                    className="chat-send-btn"
                    disabled={!newMessage.trim() || !socket}
                    aria-label="Send message"
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    )
}

export default ChatPanel
