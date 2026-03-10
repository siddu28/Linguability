import { useState, useRef, useEffect, useCallback, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { useChatbot } from '../hooks/useChatbot'
import './Chatbot.css'

// ── Icons (inline SVG to avoid extra dependencies) ──────────────────────
const ChatIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
)

const CloseIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
)

const SendIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
)

const MicIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
)

const VolumeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
)

const RefreshIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
)

// ── Quick Action Chips ──────────────────────────────────────────────────
const QUICK_ACTIONS = [
    { label: '🔢 Math', message: 'Help me with math' },
    { label: '🌍 Translate', message: 'Translate hello to all languages' },
    { label: '📋 Quiz', message: 'Give me a vocabulary quiz' },
    { label: '📚 Lessons', message: 'Take me to my lessons' },
    { label: '🎯 Practice', message: 'Where can I practice?' },
    { label: '❓ Help', message: 'What can you help me with?' },
]

// ── Parse navigation links and markdown from bot messages ───────────────
function parseMessageWithLinks(text, navigate) {
    // First split by [/path] patterns
    const parts = text.split(/(\[\/[^\]]+\])/g)

    return parts.map((part, i) => {
        const navMatch = part.match(/^\[(\/[^\]]+)\]$/)
        if (navMatch) {
            const path = navMatch[1]
            return (
                <button
                    key={i}
                    className="chatbot-nav-link"
                    onClick={() => navigate(path)}
                    title={`Go to ${path}`}
                >
                    {path}
                </button>
            )
        }
        // Render bold markdown: **text** → <strong>text</strong>
        const boldParts = part.split(/(\*\*[^*]+\*\*)/g)
        if (boldParts.length > 1) {
            return (
                <Fragment key={i}>
                    {boldParts.map((bp, j) => {
                        const boldMatch = bp.match(/^\*\*(.+)\*\*$/)
                        if (boldMatch) {
                            return <strong key={j}>{boldMatch[1]}</strong>
                        }
                        return <Fragment key={j}>{bp}</Fragment>
                    })}
                </Fragment>
            )
        }
        return <Fragment key={i}>{part}</Fragment>
    })
}

// ── Chatbot Component ───────────────────────────────────────────────────
function Chatbot() {
    const [isOpen, setIsOpen] = useState(false)
    const [inputValue, setInputValue] = useState('')
    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)
    const navigate = useNavigate()
    const { settings } = useSettings()

    const {
        messages,
        isLoading,
        isListening,
        sendMessage,
        speak,
        stopSpeaking,
        startListening,
        stopListening,
        clearMessages
    } = useChatbot()

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isLoading])

    // Focus input when panel opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300)
        } else {
            stopSpeaking()
        }
    }, [isOpen, stopSpeaking])

    // Keyboard: Escape to close
    useEffect(() => {
        function handleKeyDown(e) {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false)
            }
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen])

    const handleSend = useCallback(() => {
        if (!inputValue.trim() || isLoading) return
        sendMessage(inputValue)
        setInputValue('')
    }, [inputValue, isLoading, sendMessage])

    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }, [handleSend])

    const handleQuickAction = useCallback((message) => {
        sendMessage(message)
    }, [sendMessage])

    // Apply accessibility settings styles
    const panelStyle = {
        fontFamily: settings.fontFamily === 'opendyslexic'
            ? '"OpenDyslexic", "Comic Sans MS", sans-serif'
            : settings.fontFamily === 'serif'
                ? 'Georgia, "Times New Roman", serif'
                : undefined,
        fontSize: settings.textSize === 'large' ? '15px'
            : settings.textSize === 'extra-large' ? '16.5px'
                : settings.textSize === 'small' ? '12.5px'
                    : undefined,
        lineHeight: settings.lineSpacing === 'relaxed' ? '1.8'
            : settings.lineSpacing === 'spacious' ? '2.2'
                : settings.lineSpacing === 'compact' ? '1.4'
                    : undefined,
        letterSpacing: settings.letterSpacing === 'wide' ? '0.05em'
            : settings.letterSpacing === 'extra-wide' ? '0.1em'
                : settings.letterSpacing === 'tight' ? '-0.025em'
                    : undefined,
    }

    return (
        <>
            {/* Floating Bubble */}
            <button
                id="chatbot-bubble"
                className="chatbot-bubble"
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? 'Close chat assistant' : 'Open chat assistant'}
                title="Chat with LinguaBot"
            >
                {isOpen ? <CloseIcon /> : <ChatIcon />}
            </button>

            {/* Chat Panel */}
            {isOpen && (
                <div
                    className="chatbot-panel"
                    style={panelStyle}
                    role="dialog"
                    aria-label="Chat assistant"
                >
                    {/* Header */}
                    <div className="chatbot-header">
                        <div className="chatbot-header-left">
                            <div className="chatbot-avatar">🤖</div>
                            <div className="chatbot-header-info">
                                <h3>LinguaBot</h3>
                                <span>Your learning assistant</span>
                            </div>
                        </div>
                        <div className="chatbot-header-actions">
                            <button
                                className="chatbot-header-btn"
                                onClick={clearMessages}
                                title="Clear conversation"
                                aria-label="Clear conversation"
                            >
                                <RefreshIcon />
                            </button>
                            <button
                                className="chatbot-header-btn"
                                onClick={() => setIsOpen(false)}
                                title="Close chat"
                                aria-label="Close chat"
                            >
                                <CloseIcon />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="chatbot-messages" aria-live="polite">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`chatbot-msg ${msg.sender}`}>
                                <div>
                                    {msg.sender === 'bot'
                                        ? parseMessageWithLinks(msg.text, navigate)
                                        : msg.text
                                    }
                                </div>
                                {msg.sender === 'bot' && msg.id !== 'welcome' && (
                                    <div className="chatbot-msg-actions">
                                        <button
                                            className="chatbot-msg-action-btn"
                                            onClick={() => speak(msg.text)}
                                            title="Read aloud"
                                            aria-label="Read message aloud"
                                        >
                                            <VolumeIcon />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}

                        {isLoading && (
                            <div className="chatbot-typing">
                                <div className="chatbot-typing-dot" />
                                <div className="chatbot-typing-dot" />
                                <div className="chatbot-typing-dot" />
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Actions */}
                    <div className="chatbot-quick-actions">
                        {QUICK_ACTIONS.map((action) => (
                            <button
                                key={action.label}
                                className="chatbot-quick-btn"
                                onClick={() => handleQuickAction(action.message)}
                                disabled={isLoading}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="chatbot-input-area">
                        <input
                            ref={inputRef}
                            id="chatbot-input"
                            className="chatbot-input"
                            type="text"
                            placeholder="Type a message..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyPress}
                            disabled={isLoading}
                            aria-label="Type a message to LinguaBot"
                        />
                        <button
                            className={`chatbot-input-btn chatbot-mic-btn ${isListening ? 'listening' : ''}`}
                            onClick={isListening ? stopListening : startListening}
                            title={isListening ? 'Stop listening' : 'Voice input'}
                            aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                        >
                            <MicIcon />
                        </button>
                        <button
                            className="chatbot-input-btn chatbot-send-btn"
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isLoading}
                            title="Send message"
                            aria-label="Send message"
                        >
                            <SendIcon />
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}

export default Chatbot
