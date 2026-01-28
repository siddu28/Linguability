import { useState, useEffect, useCallback } from 'react'
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
import Button from './Button'
import './LessonViewer.css'

function LessonViewer({
    language,
    section,
    lessonTitle,
    onClose
}) {
    const [words, setWords] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [visitedWords, setVisitedWords] = useState([0]) // Track visited words for progress
    const [learnedWords, setLearnedWords] = useState([])
    const [isListening, setIsListening] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [spokenText, setSpokenText] = useState('')
    const [matchResult, setMatchResult] = useState(null) // 'correct', 'incorrect', null
    const [recognition, setRecognition] = useState(null)

    // Load words for this lesson
    useEffect(() => {
        const lessonWords = getWordsForLesson(language.id, lessonTitle)
        setWords(lessonWords)
    }, [language.id, lessonTitle])

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

    const currentWord = words[currentIndex]
    const progress = words.length > 0 ? (visitedWords.length / words.length) * 100 : 0
    const learnedProgress = words.length > 0 ? (learnedWords.length / words.length) * 100 : 0

    // Text-to-Speech: Listen to pronunciation
    const handleListen = useCallback(() => {
        if (!currentWord || isSpeaking) return

        setIsSpeaking(true)
        const utterance = new SpeechSynthesisUtterance(currentWord.word)
        utterance.lang = getLanguageCode(language.id)
        utterance.rate = 0.8 // Slower for learning

        utterance.onend = () => setIsSpeaking(false)
        utterance.onerror = () => setIsSpeaking(false)

        window.speechSynthesis.cancel() // Cancel any ongoing speech
        window.speechSynthesis.speak(utterance)
    }, [currentWord, language.id, isSpeaking])

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

    if (words.length === 0) {
        return (
            <div className="lesson-viewer">
                <div className="lesson-viewer-content">
                    <p>No words found for this lesson.</p>
                    <Button onClick={onClose}>Go Back</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="lesson-viewer">
            {/* Header */}
            <div className="viewer-header">
                <button className="back-home-btn" onClick={onClose}>
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
                <div className="word-main">
                    {currentWord.word}
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
                        onClick={onClose}
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
