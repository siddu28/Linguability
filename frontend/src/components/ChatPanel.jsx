import { useState, useEffect, useRef, useCallback } from 'react'
import { Send } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import './ChatPanel.css'

function ChatPanel({ roomId, user, isOpen }) {
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

    // Fetch existing messages
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

    // Initial fetch and real-time subscription
    useEffect(() => {
        if (!roomId) return

        fetchMessages()

        // Subscribe to new messages
        const subscription = supabase
            .channel(`room_${roomId}_messages`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'room_messages',
                    filter: `room_id=eq.${roomId}`
                },
                (payload) => {
                    setMessages(prev => [...prev, payload.new])
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(subscription)
        }
    }, [roomId, fetchMessages])

    // Send message
    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!newMessage.trim() || !user || sending) return

        setSending(true)
        const messageText = newMessage.trim()
        setNewMessage('')

        try {
            const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous'

            const { error } = await supabase
                .from('room_messages')
                .insert({
                    room_id: roomId,
                    user_id: user.id,
                    user_name: userName,
                    content: messageText
                })

            if (error) throw error
        } catch (err) {
            console.error('Error sending message:', err)
            setNewMessage(messageText) // Restore message on error
        } finally {
            setSending(false)
        }
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
                                key={message.id}
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
                    disabled={sending}
                />
                <button
                    type="submit"
                    className="chat-send-btn"
                    disabled={!newMessage.trim() || sending}
                    aria-label="Send message"
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    )
}

export default ChatPanel
