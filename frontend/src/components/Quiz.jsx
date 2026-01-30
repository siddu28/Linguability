import { useState, useEffect, useCallback } from 'react'
import { Volume2, ChevronRight, Check, X } from 'lucide-react'
import './Quiz.css'

function Quiz({
    questions,
    quizConfig,
    hideTimer = false,
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

    // Handle option selection - ONE ATTEMPT ONLY
    const handleOptionSelect = (option, index) => {
        if (isAnswered) return // Prevent multiple attempts

        setSelectedOption(index)
        const correct = option === currentQuestion.correctAnswer
        setIsCorrect(correct)
        setIsAnswered(true)

        if (correct) {
            setScore(prev => prev + 1)
        }

        // Record answer
        setAnswers(prev => [...prev, {
            questionId: currentQuestion.id,
            question: currentQuestion.question,
            selectedAnswer: option,
            correctAnswer: currentQuestion.correctAnswer,
            isCorrect: correct,
            category: currentQuestion.category,
            translation: currentQuestion.translation
        }])
    }

    // Move to next question
    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1)
            setSelectedOption(null)
            setIsAnswered(false)
            setIsCorrect(null)
        } else {
            handleQuizComplete()
        }
    }

    // Complete the quiz
    const handleQuizComplete = () => {
        const timeTaken = Math.round((Date.now() - startTime) / 1000)
        const finalScore = answers.filter(a => a.isCorrect).length + (isCorrect ? 1 : 0)
        const scorePercentage = Math.round((finalScore / questions.length) * 100)

        // Include current answer if not yet added
        let finalAnswers = [...answers]
        if (isAnswered && answers.length < questions.length) {
            finalAnswers.push({
                questionId: currentQuestion.id,
                question: currentQuestion.question,
                selectedAnswer: currentQuestion.options[selectedOption],
                correctAnswer: currentQuestion.correctAnswer,
                isCorrect: isCorrect,
                category: currentQuestion.category,
                translation: currentQuestion.translation
            })
        }

        onComplete({
            score: finalScore,
            totalQuestions: questions.length,
            scorePercentage,
            timeTakenSeconds: timeTaken,
            answers: finalAnswers
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
                            // Show the correct answer after selection
                            if (option === currentQuestion.correctAnswer && !isCorrect) {
                                optionClass += ' show-correct'
                            }
                        }

                        return (
                            <button
                                key={index}
                                className={optionClass}
                                onClick={() => handleOptionSelect(option, index)}
                                disabled={isAnswered}
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
                                {isAnswered && option === currentQuestion.correctAnswer && !isCorrect && (
                                    <span className="option-icon correct-icon">
                                        <Check size={20} />
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
                                Incorrect. The correct answer is: <strong>{currentQuestion.correctAnswer}</strong>
                            </p>
                        )}

                        {/* Show phonetic pronunciation */}
                        {currentQuestion.phonetic && (
                            <p className="pronunciation-hint">
                                Pronunciation: {currentQuestion.phonetic}
                            </p>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="quiz-actions">
                    {isAnswered && (
                        <button className="next-btn" onClick={handleNextQuestion}>
                            {currentQuestionIndex < questions.length - 1
                                ? 'Next Question'
                                : 'See Results'
                            }
                            <ChevronRight size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Score Indicator */}
            <div className="score-indicator">
                <span>Score: {score}/{currentQuestionIndex + (isAnswered ? 1 : 0)}</span>
            </div>
        </div>
    )
}

export default Quiz
