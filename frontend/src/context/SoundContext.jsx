import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const SoundContext = createContext()

// Pre-defined avatar options
export const AVATAR_OPTIONS = [
    { id: 'default', emoji: '👤', label: 'Default' },
    { id: 'student', emoji: '🎓', label: 'Student' },
    { id: 'reader', emoji: '📚', label: 'Reader' },
    { id: 'star', emoji: '⭐', label: 'Star' },
    { id: 'rocket', emoji: '🚀', label: 'Rocket' },
    { id: 'brain', emoji: '🧠', label: 'Brain' },
    { id: 'fire', emoji: '🔥', label: 'On Fire' },
    { id: 'trophy', emoji: '🏆', label: 'Champion' },
    { id: 'diamond', emoji: '💎', label: 'Diamond' },
    { id: 'crown', emoji: '👑', label: 'Royal' },
    { id: 'ninja', emoji: '🥷', label: 'Ninja' },
    { id: 'wizard', emoji: '🧙', label: 'Wizard' },
    { id: 'astronaut', emoji: '👨‍🚀', label: 'Astronaut' },
    { id: 'artist', emoji: '🎨', label: 'Artist' },
    { id: 'music', emoji: '🎵', label: 'Musical' },
    { id: 'globe', emoji: '🌍', label: 'Explorer' },
]

export function SoundProvider({ children }) {
    // Sound settings
    const [soundEnabled, setSoundEnabled] = useState(() => {
        const saved = localStorage.getItem('soundEnabled')
        return saved !== 'false' // Default to true
    })

    const [volume, setVolume] = useState(() => {
        const saved = localStorage.getItem('soundVolume')
        return saved ? parseFloat(saved) : 0.7
    })

    // Text-to-Speech settings
    const [ttsEnabled, setTtsEnabled] = useState(() => {
        const saved = localStorage.getItem('ttsEnabled')
        return saved === 'true'
    })

    const [ttsVoice, setTtsVoice] = useState(null)
    const [ttsRate, setTtsRate] = useState(() => {
        const saved = localStorage.getItem('ttsRate')
        return saved ? parseFloat(saved) : 1.0
    })

    const [availableVoices, setAvailableVoices] = useState([])
    const [isSpeaking, setIsSpeaking] = useState(false)

    // Load available voices
    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis?.getVoices() || []
            setAvailableVoices(voices)
            
            // Set default voice (prefer English)
            if (!ttsVoice && voices.length > 0) {
                const englishVoice = voices.find(v => v.lang.startsWith('en'))
                setTtsVoice(englishVoice || voices[0])
            }
        }

        loadVoices()
        window.speechSynthesis?.addEventListener('voiceschanged', loadVoices)
        
        return () => {
            window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices)
        }
    }, [])

    // Persist settings
    useEffect(() => {
        localStorage.setItem('soundEnabled', soundEnabled.toString())
    }, [soundEnabled])

    useEffect(() => {
        localStorage.setItem('soundVolume', volume.toString())
    }, [volume])

    useEffect(() => {
        localStorage.setItem('ttsEnabled', ttsEnabled.toString())
    }, [ttsEnabled])

    useEffect(() => {
        localStorage.setItem('ttsRate', ttsRate.toString())
    }, [ttsRate])

    // Toggle sound
    const toggleSound = useCallback(() => {
        setSoundEnabled(prev => !prev)
    }, [])

    // Play a sound effect
    const playSound = useCallback((type = 'click') => {
        if (!soundEnabled) return

        // Create simple audio feedback using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)()
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)

            // Different sounds for different actions
            const sounds = {
                click: { freq: 800, duration: 0.1 },
                success: { freq: 1200, duration: 0.15 },
                error: { freq: 400, duration: 0.2 },
                notification: { freq: 600, duration: 0.3 },
                levelUp: { freq: 1000, duration: 0.4 }
            }

            const sound = sounds[type] || sounds.click
            oscillator.frequency.value = sound.freq
            gainNode.gain.value = volume * 0.3

            oscillator.start()
            oscillator.stop(audioContext.currentTime + sound.duration)
        } catch (e) {
            console.warn('Audio not supported:', e)
        }
    }, [soundEnabled, volume])

    // Text-to-Speech - Speak text
    const speak = useCallback((text, options = {}) => {
        if (!window.speechSynthesis) {
            console.warn('Speech synthesis not supported')
            return
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.voice = options.voice || ttsVoice
        utterance.rate = options.rate || ttsRate
        utterance.pitch = options.pitch || 1
        utterance.volume = volume

        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => setIsSpeaking(false)
        utterance.onerror = () => setIsSpeaking(false)

        window.speechSynthesis.speak(utterance)
    }, [ttsVoice, ttsRate, volume])

    // Stop speaking
    const stopSpeaking = useCallback(() => {
        window.speechSynthesis?.cancel()
        setIsSpeaking(false)
    }, [])

    // Read page content aloud
    const readPageAloud = useCallback(() => {
        if (!window.speechSynthesis) {
            alert('Text-to-speech is not supported in your browser')
            return
        }

        // Get main content text
        const mainContent = document.querySelector('main') || document.body
        const elementsToRead = mainContent.querySelectorAll('h1, h2, h3, p, .stat-value, .stat-label, .lesson-title, .lesson-subtitle, .section-title')
        
        let textToRead = ''
        elementsToRead.forEach(el => {
            const text = el.textContent?.trim()
            if (text && text.length > 0) {
                textToRead += text + '. '
            }
        })

        if (textToRead) {
            speak(textToRead)
        } else {
            speak('No content available to read.')
        }
    }, [speak])

    const value = {
        // Sound
        soundEnabled,
        setSoundEnabled,
        toggleSound,
        volume,
        setVolume,
        playSound,
        
        // TTS
        ttsEnabled,
        setTtsEnabled,
        ttsVoice,
        setTtsVoice,
        ttsRate,
        setTtsRate,
        availableVoices,
        isSpeaking,
        speak,
        stopSpeaking,
        readPageAloud,
    }

    return (
        <SoundContext.Provider value={value}>
            {children}
        </SoundContext.Provider>
    )
}

export function useSound() {
    const context = useContext(SoundContext)
    if (!context) {
        throw new Error('useSound must be used within a SoundProvider')
    }
    return context
}

export default SoundContext
