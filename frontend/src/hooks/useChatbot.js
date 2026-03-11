import { useState, useCallback, useRef } from 'react'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

// Generate a random session ID for conversation context
function generateSessionId() {
    return 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
}

export function useChatbot() {
    const [messages, setMessages] = useState([
        {
            id: 'welcome',
            text: "Hello! 👋 I'm **LinguaBot**, your AI assistant for Linguability!\n\nI know everything about this platform and can help you:\n\n🧭 **Navigate** — \"Take me to lessons\"\n📖 **Learn** — Hindi, Tamil, Telugu, English\n🎤 **Practice** — Pronunciation, vocabulary, listening\n📋 **Quiz** — Test your knowledge\n👥 **Connect** — Join study rooms\n♿ **Accessibility** — Dyslexia fonts, ADHD settings\n\nJust ask me anything! What would you like to do today? 😊",
            sender: 'bot',
            timestamp: new Date()
        }
    ])
    const [isLoading, setIsLoading] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const sessionIdRef = useRef(generateSessionId())
    const recognitionRef = useRef(null)

    const sendMessage = useCallback(async (text) => {
        if (!text.trim() || isLoading) return

        const userMessage = {
            id: 'user_' + Date.now(),
            text: text.trim(),
            sender: 'user',
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setIsLoading(true)

        try {
            const response = await fetch(`${BACKEND_URL}/api/chatbot`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text.trim(),
                    sessionId: sessionIdRef.current
                })
            })

            const data = await response.json()
            const botReply = data.reply || data.error || "Sorry, I couldn't process that. Please try again."

            const botMessage = {
                id: 'bot_' + Date.now(),
                text: botReply,
                sender: 'bot',
                timestamp: new Date()
            }

            setMessages(prev => [...prev, botMessage])

            return botReply
        } catch (err) {
            console.error('Chatbot API error:', err)

            const errorMessage = {
                id: 'bot_err_' + Date.now(),
                text: "I'm having trouble connecting right now. Please make sure the backend server is running and try again! 🔄",
                sender: 'bot',
                timestamp: new Date()
            }

            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }, [isLoading])

    // Text-to-Speech
    const speak = useCallback((text) => {
        if (!window.speechSynthesis) return

        // Strip markdown-style formatting for cleaner speech
        const cleanText = text
            .replace(/\[\/[^\]]+\]/g, '') // remove [/path] navigation markers
            .replace(/\*\*/g, '')         // remove bold markers
            .replace(/\*/g, '')            // remove italic markers
            .replace(/#{1,6}\s/g, '')      // remove heading markers
            .replace(/\|/g, '')            // remove table pipes

        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(cleanText)
        utterance.rate = 0.9
        utterance.pitch = 1
        window.speechSynthesis.speak(utterance)
    }, [])

    const stopSpeaking = useCallback(() => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel()
        }
    }, [])

    // Voice Input (Speech-to-Text)
    const startListening = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SpeechRecognition) {
            console.warn('Speech Recognition not supported')
            return
        }

        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript
            if (transcript) {
                sendMessage(transcript)
            }
        }

        recognition.onstart = () => setIsListening(true)
        recognition.onend = () => setIsListening(false)
        recognition.onerror = () => setIsListening(false)

        recognitionRef.current = recognition
        recognition.start()
    }, [sendMessage])

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop()
        }
        setIsListening(false)
    }, [])

    const clearMessages = useCallback(() => {
        setMessages([{
            id: 'welcome',
            text: "Hello! 👋 I'm **LinguaBot**! How can I help you navigate Linguability today?\n\n🧭 Navigation • 📖 Lessons • 🎤 Practice • 📋 Quiz • 👥 Study Rooms • ♿ Accessibility",
            sender: 'bot',
            timestamp: new Date()
        }])
        sessionIdRef.current = generateSessionId()
    }, [])

    return {
        messages,
        isLoading,
        isListening,
        sendMessage,
        speak,
        stopSpeaking,
        startListening,
        stopListening,
        clearMessages
    }
}
