import { useState, useEffect, useCallback, useRef } from 'react'
import {
    Volume2,
    Mic,
    MicOff,
    ChevronLeft,
    ChevronRight,
    Check,
    X,
    RefreshCw,
    Home
} from 'lucide-react'
import { getWordsForLesson } from '../data/wordsData'
import { getNumbersForLesson } from '../data/numbersData'
import { getSentencesForLesson } from '../data/sentencesData'
import { useSettings } from '../context/SettingsContext'
import Button from './Button'
import FocusModeToggle from './FocusModeToggle'
import './LessonViewer.css'

function LessonViewer({
    language,
    section,
    lessonTitle,
    onClose,
    onProgress // Callback: (progressPercent, isComplete) => void
}) {
    // Get user accessibility settings
    const { getStyleValues, getSpeechRate, settings } = useSettings()
    const [words, setWords] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [visitedWords, setVisitedWords] = useState([0]) // Track visited words for progress
    const [learnedWords, setLearnedWords] = useState([])
    const [isListening, setIsListening] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [spokenText, setSpokenText] = useState('')
    const [matchResult, setMatchResult] = useState(null) // 'correct', 'incorrect', null
    const [recognition, setRecognition] = useState(null)
    const [availableVoices, setAvailableVoices] = useState([])
    const [voiceError, setVoiceError] = useState(null)
    const [highlightedCharIndex, setHighlightedCharIndex] = useState(-1)
    const textToSpeakRef = useRef('')

    // Load available voices
    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices()
            setAvailableVoices(voices)
        }

        // Load voices immediately if available
        loadVoices()

        // Also load when voices change (some browsers load async)
        window.speechSynthesis.onvoiceschanged = loadVoices

        return () => {
            window.speechSynthesis.onvoiceschanged = null
        }
    }, [])

    // Load data for this lesson based on section type
    useEffect(() => {
        let lessonData = []

        // Determine section type and get appropriate data
        const sectionLower = section.toLowerCase()

        if (sectionLower === 'words') {
            lessonData = getWordsForLesson(language.id, lessonTitle)
        } else if (sectionLower === 'numbers') {
            lessonData = getNumbersForLesson(language.id, lessonTitle)
        } else if (sectionLower === 'sentences') {
            lessonData = getSentencesForLesson(language.id, lessonTitle)
        }

        setWords(lessonData)
    }, [language.id, section, lessonTitle])

    // Initialize Speech Recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
            const recognitionInstance = new SpeechRecognition()

            recognitionInstance.continuous = false
            recognitionInstance.interimResults = false
            recognitionInstance.lang = getLanguageCode(language.id)

            recognitionInstance.onresult = (event) => {
                const transcript = event.results[0][0].transcript.toLowerCase()
                setSpokenText(transcript)
                checkPronunciation(transcript)
                setIsListening(false)
            }

            recognitionInstance.onerror = (event) => {
                console.error('Speech recognition error:', event.error)
                setIsListening(false)
                setMatchResult('error')
            }

            recognitionInstance.onend = () => {
                setIsListening(false)
            }

            setRecognition(recognitionInstance)
        }
    }, [language.id])

    // Get language code for speech APIs
    const getLanguageCode = (langId) => {
        const codes = {
            english: 'en-US',
            hindi: 'hi-IN',
            tamil: 'ta-IN',
            telugu: 'te-IN'
        }
        return codes[langId] || 'en-US'
    }

    // Find best available voice for language
    const findVoiceForLanguage = (langCode) => {
        if (availableVoices.length === 0) return null

        // Try to find exact match
        let voice = availableVoices.find(v => v.lang === langCode)

        // Try partial match (e.g., 'ta' for Tamil)
        if (!voice) {
            const langPrefix = langCode.split('-')[0]
            voice = availableVoices.find(v => v.lang.startsWith(langPrefix))
        }

        // For Indian languages, try Google voices which often have better support
        if (!voice && ['hi-IN', 'ta-IN', 'te-IN'].includes(langCode)) {
            voice = availableVoices.find(v =>
                v.name.toLowerCase().includes('google') &&
                v.lang.startsWith(langCode.split('-')[0])
            )
        }

        return voice
    }

    const currentWord = words[currentIndex]
    const progress = words.length > 0 ? (visitedWords.length / words.length) * 100 : 0
    const learnedProgress = words.length > 0 ? (learnedWords.length / words.length) * 100 : 0

    // Text-to-Speech: Listen to pronunciation
    const handleListen = useCallback(() => {
        if (!currentWord || isSpeaking) return

        setVoiceError(null)
        setIsSpeaking(true)

        const langCode = getLanguageCode(language.id)
        const nativeVoice = findVoiceForLanguage(langCode)

        // Find English voice for fallback
        const englishVoice = availableVoices.find(v =>
            v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Microsoft') || v.default)
        ) || availableVoices.find(v => v.lang.startsWith('en'))

        // Clean phonetic text for TTS - remove IPA slashes and special characters
        const cleanPhonetic = (text) => {
            if (!text) return ''
            return text
                .replace(/\//g, '') // Remove slashes
                .replace(/[ˈˌ]/g, '') // Remove stress marks
                .replace(/ː/g, '') // Remove length marks
                .replace(/ṁ/g, 'm') // Convert special m
                .replace(/ṇ/g, 'n') // Convert retroflex n
                .replace(/ṉ/g, 'n') // Convert Tamil n
                .replace(/ṟ/g, 'r') // Convert Tamil r
                .replace(/ḷ/g, 'l') // Convert retroflex l
                .replace(/ā/g, 'aa') // Convert long a
                .replace(/ī/g, 'ee') // Convert long i
                .replace(/ū/g, 'oo') // Convert long u
                .replace(/ē/g, 'ay') // Convert long e
                .replace(/ō/g, 'oh') // Convert long o
                .replace(/ś/g, 'sh') // Convert palatal s
                .replace(/ṣ/g, 'sh') // Convert retroflex s
                .replace(/ṭ/g, 't') // Convert retroflex t
                .replace(/ḍ/g, 'd') // Convert retroflex d
                .replace(/r̥/g, 'ri') // Convert vocalic r
                .replace(/ñ/g, 'ny') // Convert palatal n  
                .replace(/θ/g, 'th') // Convert theta
                .replace(/ð/g, 'th') // Convert eth
                .replace(/ŋ/g, 'ng') // Convert eng
                .trim()
        }

        // Decide what to speak and which voice to use
        let textToSpeak = currentWord.word
        let voiceToUse = nativeVoice
        let usingFallback = false

        // For Indian languages without native voice, use speakable pronunciation with English voice
        if (!nativeVoice && ['tamil', 'telugu', 'hindi'].includes(language.id)) {
            textToSpeak = currentWord.speakable || currentWord.translation
            voiceToUse = englishVoice
            usingFallback = true
        }

        textToSpeakRef.current = textToSpeak
        const utterance = new SpeechSynthesisUtterance(textToSpeak)
        utterance.rate = getSpeechRate() // Use user's preferred reading speed

        if (voiceToUse) {
            utterance.voice = voiceToUse
            utterance.lang = voiceToUse.lang
        } else {
            utterance.lang = langCode
        }

        // Word-level highlighting via onboundary
        utterance.onboundary = (event) => {
            if (event.name === 'word') {
                setHighlightedCharIndex(event.charIndex)
            }
        }

        utterance.onend = () => {
            setIsSpeaking(false)
            setHighlightedCharIndex(-1)
            if (usingFallback) {
                setVoiceError(`Playing phonetic pronunciation. Native ${language.name} voice not available.`)
            }
        }

        utterance.onerror = (event) => {
            console.error('TTS error:', event)
            setIsSpeaking(false)
            setHighlightedCharIndex(-1)
            setVoiceError(`Unable to play audio. Check browser TTS support.`)
        }

        setHighlightedCharIndex(-1)
        window.speechSynthesis.cancel() // Cancel any ongoing speech
        window.speechSynthesis.speak(utterance)
    }, [currentWord, language.id, language.name, isSpeaking, availableVoices])

    // Speech Recognition: Start listening
    const handleSpeak = () => {
        if (!recognition || isListening) return

        setSpokenText('')
        setMatchResult(null)
        setIsListening(true)

        try {
            recognition.lang = getLanguageCode(language.id)
            recognition.start()
        } catch (err) {
            console.error('Failed to start recognition:', err)
            setIsListening(false)
        }
    }

    // Stop listening
    const handleStopListening = () => {
        if (recognition && isListening) {
            recognition.stop()
            setIsListening(false)
        }
    }

    // Check if pronunciation matches
    const checkPronunciation = (spoken) => {
        if (!currentWord) return

        const expected = currentWord.word.toLowerCase()
        const spokenClean = spoken.trim().toLowerCase()

        // Simple matching - check if the spoken text contains the expected word
        // Or if they share significant similarity
        const isMatch =
            spokenClean === expected ||
            expected.includes(spokenClean) ||
            spokenClean.includes(expected) ||
            calculateSimilarity(spokenClean, expected) > 0.6

        setMatchResult(isMatch ? 'correct' : 'incorrect')

        if (isMatch && !learnedWords.includes(currentIndex)) {
            setLearnedWords(prev => [...prev, currentIndex])
        }
    }

    // Calculate string similarity (Levenshtein-based)
    const calculateSimilarity = (str1, str2) => {
        const longer = str1.length > str2.length ? str1 : str2
        const shorter = str1.length > str2.length ? str2 : str1

        if (longer.length === 0) return 1.0

        const editDistance = levenshteinDistance(longer, shorter)
        return (longer.length - editDistance) / longer.length
    }

    const levenshteinDistance = (str1, str2) => {
        const matrix = []

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i]
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1]
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    )
                }
            }
        }

        return matrix[str2.length][str1.length]
    }

    // Navigation
    const goNext = () => {
        if (currentIndex < words.length - 1) {
            const nextIndex = currentIndex + 1
            setCurrentIndex(nextIndex)
            // Mark as visited
            if (!visitedWords.includes(nextIndex)) {
                setVisitedWords(prev => [...prev, nextIndex])
            }
            setSpokenText('')
            setMatchResult(null)
        }
    }

    const goPrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1)
            setSpokenText('')
            setMatchResult(null)
        }
    }

    const markAsLearned = () => {
        if (!learnedWords.includes(currentIndex)) {
            setLearnedWords(prev => [...prev, currentIndex])
        }
        goNext()
    }

    const tryAgain = () => {
        setSpokenText('')
        setMatchResult(null)
    }

    // Handle closing with progress report
    const handleClose = () => {
        // Calculate actual progress based on visited/learned words
        const progressPercent = words.length > 0
            ? Math.round((visitedWords.length / words.length) * 100)
            : 0

        // Lesson is complete only if all words have been visited
        const isComplete = words.length > 0 && visitedWords.length >= words.length

        // Report progress to parent
        if (onProgress) {
            onProgress(progressPercent, isComplete)
        }

        // Close the viewer
        onClose()
    }

    if (words.length === 0) {
        return (
            <div className="lesson-viewer">
                <div className="lesson-viewer-content">
                    <p>No words found for this lesson.</p>
                    <Button onClick={handleClose}>Go Back</Button>
                </div>
            </div>
        )
    }

    return (
        <div className={`lesson-viewer ${settings.focusMode ? 'focus-mode-active' : ''}`}>
            <FocusModeToggle />
            {/* Header */}
            <div className="viewer-header">
                <button className="back-home-btn" onClick={handleClose}>
                    <Home size={20} />
                </button>
                <div className="breadcrumb">
                    <span>{language.name}</span>
                    <ChevronRight size={16} />
                    <span>{section}</span>
                </div>
                <h2 className="viewer-title">{lessonTitle}</h2>
            </div>

            {/* Progress */}
            <div className="viewer-progress">
                <span className="progress-text">Item {currentIndex + 1} of {words.length}</span>
                <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                </div>
                <span className="progress-percent">{Math.round(progress)}% complete</span>
            </div>

            {/* Word Card */}
            <div className={`word-card ${matchResult ? matchResult : ''}`}>
                <div className="word-main" style={getStyleValues()}>
                    {(() => {
                        // Split word/sentence into individual words for TTS highlighting
                        const text = currentWord.word
                        const spokenText_ = textToSpeakRef.current
                        const wordsArr = text.split(/\s+/)
                        if (wordsArr.length <= 1 || highlightedCharIndex < 0 || !isSpeaking) {
                            // Single word or no highlighting — show with pulse if speaking
                            return <span className={isSpeaking && highlightedCharIndex >= 0 ? 'tts-highlight' : ''}>{text}</span>
                        }
                        // Multi-word: map charIndex from spoken text to display words
                        const spokenWords = spokenText_.split(/\s+/)
                        let charPos = 0
                        let activeSpokenIdx = 0
                        for (let i = 0; i < spokenWords.length; i++) {
                            if (charPos + spokenWords[i].length > highlightedCharIndex) {
                                activeSpokenIdx = i
                                break
                            }
                            charPos += spokenWords[i].length + 1
                        }
                        // Map spoken word index to display word index (they may differ for fallback)
                        const ratio = wordsArr.length / Math.max(spokenWords.length, 1)
                        const activeDisplayIdx = Math.min(Math.floor(activeSpokenIdx * ratio), wordsArr.length - 1)
                        return wordsArr.map((w, i) => (
                            <span key={i} className={i === activeDisplayIdx ? 'tts-highlight' : ''}>
                                {w}{i < wordsArr.length - 1 ? ' ' : ''}
                            </span>
                        ))
                    })()}
                </div>

                {/* Listen Button */}
                <button
                    className={`listen-btn ${isSpeaking ? 'speaking' : ''}`}
                    onClick={handleListen}
                    disabled={isSpeaking}
                >
                    <Volume2 size={20} />
                    {isSpeaking ? 'Speaking...' : 'Listen'}
                </button>

                {/* Voice Error Message */}
                {voiceError && (
                    <div className="voice-error">
                        ⚠️ {voiceError}
                    </div>
                )}

                {/* Phonetic */}
                <div className="phonetic-badge">
                    {currentWord.phonetic}
                </div>

                {/* Translation */}
                <div className="word-translation">
                    {currentWord.translation}
                </div>

                {/* Speak Section */}
                <div className="speak-section">
                    <button
                        className={`speak-btn ${isListening ? 'listening' : ''}`}
                        onClick={isListening ? handleStopListening : handleSpeak}
                    >
                        {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                        {isListening ? 'Stop' : 'Speak'}
                    </button>

                    {spokenText && (
                        <div className="spoken-text">
                            You said: "<strong>{spokenText}</strong>"
                        </div>
                    )}

                    {matchResult === 'correct' && (
                        <div className="match-feedback correct">
                            <Check size={20} />
                            Great pronunciation!
                        </div>
                    )}

                    {matchResult === 'incorrect' && (
                        <div className="match-feedback incorrect">
                            <X size={20} />
                            Not quite right. Try again!
                            <button className="retry-btn" onClick={tryAgain}>
                                <RefreshCw size={16} />
                                Retry
                            </button>
                        </div>
                    )}

                    {matchResult === 'error' && (
                        <div className="match-feedback error">
                            Could not recognize speech. Please try again.
                        </div>
                    )}
                </div>
            </div>

            {/* Dots Indicator */}
            <div className="dots-indicator">
                {words.map((_, index) => (
                    <span
                        key={index}
                        className={`dot ${index === currentIndex ? 'active' : ''} ${learnedWords.includes(index) ? 'learned' : ''}`}
                        onClick={() => {
                            setCurrentIndex(index)
                            setSpokenText('')
                            setMatchResult(null)
                        }}
                    />
                ))}
            </div>

            {/* Navigation */}
            <div className="viewer-navigation">
                <Button
                    variant="secondary"
                    icon={ChevronLeft}
                    onClick={goPrevious}
                    disabled={currentIndex === 0}
                >
                    Previous
                </Button>

                {currentIndex === words.length - 1 ? (
                    <Button
                        variant="primary"
                        icon={Check}
                        onClick={handleClose}
                    >
                        Finish Lesson
                    </Button>
                ) : (
                    <Button
                        variant="primary"
                        onClick={goNext}
                    >
                        Next
                        <ChevronRight size={18} />
                    </Button>
                )}
            </div>
        </div>
    )
}

export default LessonViewer
