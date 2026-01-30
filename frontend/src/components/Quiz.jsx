import { useState, useEffect, useCallback } from 'react'
import { Volume2, ChevronRight, RotateCcw, Check, X } from 'lucide-react'
import './Quiz.css'

function Quiz({
    questions,
    quizConfig,
    hideTimer = false,
    learningMode = true,
    textToSpeech = true,
    speechRate = 1,
    onComplete
}) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [selectedOption, setSelectedOption] = useState(null)
    const [isAnswered, setIsAnswered] = useState(false)
    const [isCorrect, setIsCorrect] = useState(null)
    const [score, setScore] = useState(0)
    const [answers, setAnswers] = useState([])
    const [timeRemaining, setTimeRemaining] = useState(quizConfig?.duration || 600)
    const [canRetry, setCanRetry] = useState(false)
    const [startTime] = useState(Date.now())

    const currentQuestion = questions[currentQuestionIndex]
    const progress = ((currentQuestionIndex) / questions.length) * 100

    // Timer countdown
    useEffect(() => {
        if (hideTimer) return
        if (timeRemaining <= 0) {
            handleQuizComplete()
            return
        }

        const timer = setInterval(() => {
            setTimeRemaining(prev => prev - 1)
        }, 1000)

        return () => clearInterval(timer)
    }, [timeRemaining, hideTimer])

    // Format time as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    // Text-to-Speech function
    const speakText = useCallback((text) => {
        if (!textToSpeech || !window.speechSynthesis) return

        // Cancel any ongoing speech
        window.speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = speechRate
        utterance.lang = 'en-US'
        window.speechSynthesis.speak(utterance)
    }, [textToSpeech, speechRate])

    // Handle option selection
    const handleOptionSelect = (option, index) => {
        if (isAnswered && !canRetry) return

        setSelectedOption(index)
        const correct = option === currentQuestion.correctAnswer
        setIsCorrect(correct)
        setIsAnswered(true)

        if (correct) {
            setScore(prev => prev + 1)
            setCanRetry(false)

            // Record answer
            setAnswers(prev => [...prev, {
                questionId: currentQuestion.id,
                question: currentQuestion.question,
                selectedAnswer: option,
                correctAnswer: currentQuestion.correctAnswer,
                isCorrect: true
            }])
        } else {
            if (learningMode) {
                setCanRetry(true)
            } else {
                // Record wrong answer in standard mode
                setAnswers(prev => [...prev, {
                    questionId: currentQuestion.id,
                    question: currentQuestion.question,
                    selectedAnswer: option,
                    correctAnswer: currentQuestion.correctAnswer,
                    isCorrect: false
                }])
            }
        }
    }

    // Handle retry in learning mode
    const handleRetry = () => {
        setSelectedOption(null)
        setIsAnswered(false)
        setIsCorrect(null)
        setCanRetry(false)
    }

    // Move to next question
    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1)
            setSelectedOption(null)
            setIsAnswered(false)
            setIsCorrect(null)
            setCanRetry(false)
        } else {
            handleQuizComplete()
        }
    }

    // Complete the quiz
    const handleQuizComplete = () => {
        const timeTaken = Math.round((Date.now() - startTime) / 1000)
        const scorePercentage = Math.round((score / questions.length) * 100)

        onComplete({
            score,
            totalQuestions: questions.length,
            scorePercentage,
            timeTakenSeconds: timeTaken,
            answers
        })
    }

    // Read question aloud
    const handleReadQuestion = () => {
        const textToRead = currentQuestion.questionAudio || currentQuestion.question
        speakText(textToRead)
    }

    if (!currentQuestion) {
        return <div className="quiz-loading">Loading quiz...</div>
    }

    return (
        <div className="quiz-container">
            {/* Header with progress and timer */}
            <div className="quiz-header">
                <div className="quiz-progress-info">
                    <span className="question-counter">
                        Question {currentQuestionIndex + 1} of {questions.length}
                    </span>
                    {!hideTimer && (
                        <span className={`quiz-timer ${timeRemaining < 60 ? 'warning' : ''}`}>
                            ⏱️ {formatTime(timeRemaining)}
                        </span>
                    )}
                </div>
                <div className="progress-bar-container">
                    <div
                        className="progress-bar-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Question Card */}
            <div className="question-card">
                <div className="question-header">
                    <span className="question-category">{currentQuestion.category}</span>
                    {textToSpeech && (
                        <button
                            className="read-aloud-btn"
                            onClick={handleReadQuestion}
                            aria-label="Read question aloud"
                        >
                            <Volume2 size={18} />
                            Read Question
                        </button>
                    )}
                </div>

                <h2 className="question-text">{currentQuestion.question}</h2>

                {/* Options Grid */}
                <div className="options-grid">
                    {currentQuestion.options.map((option, index) => {
                        let optionClass = 'option-btn'

                        if (isAnswered) {
                            if (index === selectedOption) {
                                optionClass += isCorrect ? ' correct' : ' incorrect'
                            }
                            if (!isCorrect && option === currentQuestion.correctAnswer && !canRetry) {
                                optionClass += ' show-correct'
                            }
                        }

                        return (
                            <button
                                key={index}
                                className={optionClass}
                                onClick={() => handleOptionSelect(option, index)}
                                disabled={isAnswered && !canRetry}
                            >
                                <span className="option-letter">
                                    {String.fromCharCode(65 + index)}
                                </span>
                                <span className="option-text">{option}</span>
                                {isAnswered && index === selectedOption && (
                                    <span className="option-icon">
                                        {isCorrect ? <Check size={20} /> : <X size={20} />}
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </div>

                {/* Feedback Section */}
                {isAnswered && (
                    <div className={`feedback-section ${isCorrect ? 'correct' : 'incorrect'}`}>
                        {isCorrect ? (
                            <p className="feedback-text">
                                <Check size={20} /> Correct! Well done!
                            </p>
                        ) : (
                            <p className="feedback-text">
                                <X size={20} />
                                {canRetry
                                    ? "Not quite right. Try again!"
                                    : `The correct answer is: ${currentQuestion.correctAnswer}`
                                }
                            </p>
                        )}

                        {/* Show phonetic pronunciation for correct answers */}
                        {isCorrect && currentQuestion.phonetic && (
                            <p className="pronunciation-hint">
                                Pronunciation: {currentQuestion.phonetic}
                            </p>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="quiz-actions">
                    {canRetry ? (
                        <button className="retry-btn" onClick={handleRetry}>
                            <RotateCcw size={18} />
                            Try Again
                        </button>
                    ) : isAnswered ? (
                        <button className="next-btn" onClick={handleNextQuestion}>
                            {currentQuestionIndex < questions.length - 1
                                ? 'Next Question'
                                : 'Finish Quiz'
                            }
                            <ChevronRight size={18} />
                        </button>
                    ) : null}
                </div>
            </div>

            {/* Score Indicator */}
            <div className="score-indicator">
                <span>Current Score: {score}/{currentQuestionIndex + (isAnswered && !canRetry ? 1 : 0)}</span>
            </div>
        </div>
    )
}

export default Quiz
