import { useState, useEffect, useCallback, useRef } from 'react'
import { Volume2, Mic, MicOff, ChevronRight, Check, X, AlertCircle } from 'lucide-react'
import { calculatePronunciationScore } from '../data/pronunciationData'
import './PronunciationTest.css'

function PronunciationTest({
    words,
    testConfig,
    textToSpeech = true,
    speechRate = 0.8,
    onComplete,
    initialState = null,
    onProgressUpdate = null
}) {
    // Initialize from saved state if resuming
    const [currentWordIndex, setCurrentWordIndex] = useState(
        initialState?.currentIndex ?? 0
    )
    const [isListening, setIsListening] = useState(false)
    const [spokenText, setSpokenText] = useState('')
    const [score, setScore] = useState(null)
    const [feedback, setFeedback] = useState(null)
    const [results, setResults] = useState(initialState?.results ?? [])
    const [totalScore, setTotalScore] = useState(initialState?.totalScore ?? 0)
    const [showNext, setShowNext] = useState(false)
    const [error, setError] = useState(null)
    const [browserSupport, setBrowserSupport] = useState(true)

    const recognitionRef = useRef(null)
    const currentWord = words[currentWordIndex]
    const progress = ((currentWordIndex) / words.length) * 100

    // Check browser support for SpeechRecognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SpeechRecognition) {
            setBrowserSupport(false)
            setError('Speech Recognition is not supported in this browser. Please use Chrome or Edge.')
        }
    }, [])

    // Initialize Speech Recognition
    const initializeRecognition = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SpeechRecognition) return null

        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'
        recognition.maxAlternatives = 1

        recognition.onstart = () => {
            setIsListening(true)
            setError(null)
            setSpokenText('')
            setFeedback(null)
            setScore(null)
        }

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript
            setSpokenText(transcript)

            // Calculate score
            const matchScore = calculatePronunciationScore(transcript, currentWord.word)
            setScore(matchScore)

            // Determine feedback
            if (matchScore >= 80) {
                setFeedback('excellent')
            } else if (matchScore >= 60) {
                setFeedback('good')
            } else if (matchScore >= 40) {
                setFeedback('fair')
            } else {
                setFeedback('poor')
            }

            // Record result
            const newResult = {
                wordId: currentWord.id,
                expected: currentWord.word,
                spoken: transcript,
                score: matchScore,
                feedback: matchScore >= 60 ? 'pass' : 'fail'
            }
            const updatedResults = [...results, newResult]
            setResults(updatedResults)

            // Update total score
            const newTotalScore = totalScore + matchScore
            setTotalScore(newTotalScore)
            setShowNext(true)

            // Save progress after each word
            if (onProgressUpdate) {
                onProgressUpdate(currentWordIndex + 1, updatedResults)
            }
        }

        recognition.onerror = (event) => {
            setIsListening(false)
            if (event.error === 'no-speech') {
                setError('No speech detected. Please try again.')
            } else if (event.error === 'audio-capture') {
                setError('No microphone found. Please check your microphone.')
            } else if (event.error === 'not-allowed') {
                setError('Microphone access denied. Please allow microphone access.')
            } else {
                setError(`Error: ${event.error}`)
            }
        }

        recognition.onend = () => {
            setIsListening(false)
        }

        return recognition
    }, [currentWord])

    // Start listening
    const startListening = () => {
        if (!browserSupport) return

        const recognition = initializeRecognition()
        if (recognition) {
            recognitionRef.current = recognition
            recognition.start()
        }
    }

    // Stop listening
    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop()
        }
        setIsListening(false)
    }

    // Play word pronunciation using TTS
    const playPronunciation = useCallback(() => {
        if (!textToSpeech || !window.speechSynthesis) return

        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(currentWord.word)
        utterance.rate = speechRate
        utterance.lang = 'en-US'
        window.speechSynthesis.speak(utterance)
    }, [currentWord, textToSpeech, speechRate])

    // Move to next word
    const handleNextWord = () => {
        if (currentWordIndex < words.length - 1) {
            setCurrentWordIndex(prev => prev + 1)
            setSpokenText('')
            setScore(null)
            setFeedback(null)
            setShowNext(false)
            setError(null)
        } else {
            // Test complete
            const averageScore = Math.round(totalScore / words.length)
            onComplete({
                score: averageScore,
                totalWords: words.length,
                passedWords: results.filter(r => r.score >= 60).length,
                results: results
            })
        }
    }

    // Skip word (counts as 0)
    const handleSkipWord = () => {
        const skippedResult = {
            wordId: currentWord.id,
            expected: currentWord.word,
            spoken: '(skipped)',
            score: 0,
            feedback: 'skipped'
        }
        const updatedResults = [...results, skippedResult]
        setResults(updatedResults)
        setShowNext(true)
        setScore(0)
        setFeedback('skipped')

        // Save progress for skipped word
        if (onProgressUpdate) {
            onProgressUpdate(currentWordIndex + 1, updatedResults)
        }
    }

    if (!currentWord) {
        return <div className="pronunciation-loading">Loading test...</div>
    }

    const getFeedbackMessage = () => {
        switch (feedback) {
            case 'excellent': return '🎉 Excellent! Perfect pronunciation!'
            case 'good': return '👍 Good job! Clear pronunciation.'
            case 'fair': return '🔄 Fair attempt. Try listening again.'
            case 'poor': return '❌ Needs practice. Listen and try again.'
            case 'skipped': return '⏭️ Skipped'
            default: return ''
        }
    }

    const getFeedbackClass = () => {
        switch (feedback) {
            case 'excellent': return 'feedback-excellent'
            case 'good': return 'feedback-good'
            case 'fair': return 'feedback-fair'
            case 'poor': return 'feedback-poor'
            case 'skipped': return 'feedback-skipped'
            default: return ''
        }
    }

    return (
        <div className="pronunciation-test-container">
            {/* Header with progress */}
            <div className="pronunciation-header">
                <div className="pronunciation-progress-info">
                    <span className="word-counter">
                        Word {currentWordIndex + 1} of {words.length}
                    </span>
                    <span className="current-score">
                        Score: {results.length > 0 ? Math.round(totalScore / results.length) : 0}%
                    </span>
                </div>
                <div className="progress-bar-container">
                    <div
                        className="progress-bar-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Word Card */}
            <div className="word-card">
                {!browserSupport && (
                    <div className="browser-warning">
                        <AlertCircle size={20} />
                        <span>Speech Recognition requires Chrome or Edge browser</span>
                    </div>
                )}

                <div className="word-display">
                    <h2 className="word-text">{currentWord.word}</h2>
                    {currentWord.phonetic && (
                        <p className="word-phonetic">{currentWord.phonetic}</p>
                    )}
                    {currentWord.hint && (
                        <p className="word-hint">Hint: {currentWord.hint}</p>
                    )}
                </div>

                {/* Listen Button */}
                <button
                    className="listen-btn"
                    onClick={playPronunciation}
                    disabled={!textToSpeech}
                >
                    <Volume2 size={20} />
                    Listen to Pronunciation
                </button>

                {/* Record Button */}
                <div className="record-section">
                    {!showNext ? (
                        <>
                            <button
                                className={`record-btn ${isListening ? 'recording' : ''}`}
                                onClick={isListening ? stopListening : startListening}
                                disabled={!browserSupport}
                            >
                                {isListening ? (
                                    <>
                                        <MicOff size={24} />
                                        Stop Recording
                                    </>
                                ) : (
                                    <>
                                        <Mic size={24} />
                                        Start Recording
                                    </>
                                )}
                            </button>

                            {isListening && (
                                <div className="listening-indicator">
                                    <div className="pulse-ring"></div>
                                    <span>Listening... Speak now!</span>
                                </div>
                            )}

                            <button
                                className="skip-btn"
                                onClick={handleSkipWord}
                            >
                                Skip this word
                            </button>
                        </>
                    ) : null}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="error-message">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                {/* Result Display */}
                {score !== null && (
                    <div className={`pronunciation-result ${getFeedbackClass()}`}>
                        <div className="result-score">
                            <span className="score-value">{score}%</span>
                            <span className="score-label">Match</span>
                        </div>

                        {spokenText && spokenText !== '(skipped)' && (
                            <div className="spoken-text">
                                <span className="spoken-label">You said:</span>
                                <span className="spoken-value">"{spokenText}"</span>
                            </div>
                        )}

                        <p className="feedback-message">{getFeedbackMessage()}</p>

                        {feedback === 'poor' && (
                            <button
                                className="retry-listen-btn"
                                onClick={playPronunciation}
                            >
                                <Volume2 size={18} />
                                Listen Again
                            </button>
                        )}
                    </div>
                )}

                {/* Next Button */}
                {showNext && (
                    <button className="next-btn" onClick={handleNextWord}>
                        {currentWordIndex < words.length - 1 ? 'Next Word' : 'See Results'}
                        <ChevronRight size={18} />
                    </button>
                )}
            </div>
        </div>
    )
}

export default PronunciationTest
