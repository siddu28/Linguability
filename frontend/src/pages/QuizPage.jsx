import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trophy, Target, Clock, RotateCcw, Home, CheckCircle2, XCircle, Check, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getProfile, getUserSettings, saveAssessmentResult } from '../lib/database'
import { getQuizById, generateQuizQuestions } from '../data/quizData'
import Navbar from '../components/Navbar'
import Quiz from '../components/Quiz'
import Button from '../components/Button'
import './QuizPage.css'

function QuizPage() {
    const { quizId } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [loading, setLoading] = useState(true)
    const [quiz, setQuiz] = useState(null)
    const [questions, setQuestions] = useState([])
    const [userProfile, setUserProfile] = useState(null)
    const [userSettings, setUserSettings] = useState(null)
    const [quizStarted, setQuizStarted] = useState(false)
    const [quizCompleted, setQuizCompleted] = useState(false)
    const [results, setResults] = useState(null)
    const [saving, setSaving] = useState(false)
    const [showAnswerReview, setShowAnswerReview] = useState(false)

    // Load quiz and user data
    useEffect(() => {
        async function loadData() {
            if (!quizId || !user?.id) return

            setLoading(true)
            try {
                // Load quiz configuration
                const quizConfig = getQuizById(quizId)
                if (!quizConfig) {
                    console.error('Quiz not found:', quizId)
                    navigate('/assessments')
                    return
                }
                setQuiz(quizConfig)

                // Generate questions
                const generatedQuestions = generateQuizQuestions(quizId)
                setQuestions(generatedQuestions)

                // Load user profile and settings
                const [profile, settings] = await Promise.all([
                    getProfile(user.id),
                    getUserSettings(user.id)
                ])
                setUserProfile(profile)
                setUserSettings(settings)

            } catch (error) {
                console.error('Error loading quiz data:', error)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [quizId, user, navigate])

    // Check if user has ADHD/Anxiety (to hide timer)
    const shouldHideTimer = () => {
        if (!userProfile?.learning_challenges) return false
        const challenges = userProfile.learning_challenges
        return challenges.includes('adhd') || challenges.includes('anxiety')
    }

    // Start the quiz
    const handleStartQuiz = () => {
        // Regenerate questions for fresh quiz
        const freshQuestions = generateQuizQuestions(quizId)
        setQuestions(freshQuestions)
        setQuizStarted(true)
        setQuizCompleted(false)
        setResults(null)
        setShowAnswerReview(false)
    }

    // Handle quiz completion
    const handleQuizComplete = async (quizResults) => {
        setResults(quizResults)
        setQuizCompleted(true)
        setQuizStarted(false)

        // Save to database
        if (user?.id) {
            setSaving(true)
            try {
                await saveAssessmentResult(user.id, {
                    quizId: quiz.id,
                    quizTitle: quiz.title,
                    score: quizResults.score,
                    totalQuestions: quizResults.totalQuestions,
                    scorePercentage: quizResults.scorePercentage,
                    timeTakenSeconds: quizResults.timeTakenSeconds,
                    answers: quizResults.answers
                })
            } catch (error) {
                console.error('Error saving results:', error)
            } finally {
                setSaving(false)
            }
        }
    }

    // Get performance message
    const getPerformanceMessage = (percentage) => {
        if (percentage >= 90) return { emoji: '🌟', message: 'Excellent! You\'re a star!' }
        if (percentage >= 70) return { emoji: '🎉', message: 'Great job! Keep it up!' }
        if (percentage >= 50) return { emoji: '👍', message: 'Good effort! Practice makes perfect.' }
        return { emoji: '💪', message: 'Keep practicing, you\'ll get better!' }
    }

    // Format time
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        if (mins > 0) {
            return `${mins}m ${secs}s`
        }
        return `${secs}s`
    }

    if (loading) {
        return (
            <div className="quiz-page">
                <Navbar />
                <main className="quiz-page-content">
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading quiz...</p>
                    </div>
                </main>
            </div>
        )
    }

    if (!quiz) {
        return (
            <div className="quiz-page">
                <Navbar />
                <main className="quiz-page-content">
                    <div className="error-state">
                        <p>Quiz not found</p>
                        <Button onClick={() => navigate('/assessments')}>
                            Back to Assessments
                        </Button>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="quiz-page">
            <Navbar />

            <main className="quiz-page-content">
                {/* Back Button */}
                {!quizStarted && (
                    <button
                        className="back-btn"
                        onClick={() => navigate('/assessments')}
                    >
                        <ArrowLeft size={18} />
                        Back to Assessments
                    </button>
                )}

                {/* Pre-Quiz Screen */}
                {!quizStarted && !quizCompleted && (
                    <div className="pre-quiz-screen">
                        <div className="quiz-intro-card">
                            <div className="quiz-intro-header">
                                <span className="quiz-level-badge">{quiz.level}</span>
                                <span className="quiz-type-badge">{quiz.type}</span>
                            </div>

                            <h1 className="quiz-intro-title">{quiz.title}</h1>
                            <p className="quiz-intro-description">{quiz.description}</p>

                            <div className="quiz-info-grid">
                                <div className="quiz-info-item">
                                    <Target size={24} />
                                    <span className="info-value">{quiz.questionsCount}</span>
                                    <span className="info-label">Questions</span>
                                </div>
                                <div className="quiz-info-item">
                                    <Clock size={24} />
                                    <span className="info-value">{Math.round(quiz.duration / 60)} min</span>
                                    <span className="info-label">Time Limit</span>
                                </div>
                            </div>

                            <div className="quiz-rules">
                                <h3>📋 Quiz Rules:</h3>
                                <ul>
                                    <li>One attempt per question</li>
                                    <li>Answers cannot be changed once selected</li>
                                    <li>Review all answers at the end</li>
                                </ul>
                            </div>

                            {shouldHideTimer() && (
                                <div className="accessibility-notice">
                                    <CheckCircle2 size={18} />
                                    <span>Timer is hidden based on your accessibility preferences</span>
                                </div>
                            )}

                            <Button
                                variant="primary"
                                className="start-quiz-btn"
                                onClick={handleStartQuiz}
                            >
                                Start Quiz
                            </Button>
                        </div>
                    </div>
                )}

                {/* Active Quiz */}
                {quizStarted && !quizCompleted && (
                    <Quiz
                        questions={questions}
                        quizConfig={quiz}
                        hideTimer={shouldHideTimer()}
                        textToSpeech={userSettings?.text_to_speech ?? true}
                        speechRate={userSettings?.speech_rate ?? 1}
                        onComplete={handleQuizComplete}
                    />
                )}

                {/* Results Screen */}
                {quizCompleted && results && !showAnswerReview && (
                    <div className="results-screen">
                        <div className="results-card">
                            <div className="results-header">
                                <span className="results-emoji">
                                    {getPerformanceMessage(results.scorePercentage).emoji}
                                </span>
                                <h1 className="results-title">Quiz Complete!</h1>
                                <p className="results-message">
                                    {getPerformanceMessage(results.scorePercentage).message}
                                </p>
                            </div>

                            <div className="results-score-circle">
                                <div className="score-circle">
                                    <span className="score-percentage">{results.scorePercentage}%</span>
                                    <span className="score-label">Score</span>
                                </div>
                            </div>

                            <div className="results-stats">
                                <div className="result-stat correct">
                                    <CheckCircle2 size={20} />
                                    <span className="stat-value">{results.score}</span>
                                    <span className="stat-label">Correct</span>
                                </div>
                                <div className="result-stat incorrect">
                                    <XCircle size={20} />
                                    <span className="stat-value">{results.totalQuestions - results.score}</span>
                                    <span className="stat-label">Wrong</span>
                                </div>
                                <div className="result-stat">
                                    <Clock size={20} />
                                    <span className="stat-value">{formatTime(results.timeTakenSeconds)}</span>
                                    <span className="stat-label">Time</span>
                                </div>
                            </div>

                            {saving && (
                                <p className="saving-message">Saving your results...</p>
                            )}

                            <div className="results-actions">
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowAnswerReview(true)}
                                >
                                    📝 Review Answers
                                </Button>
                                <Button
                                    variant="secondary"
                                    icon={RotateCcw}
                                    onClick={handleStartQuiz}
                                >
                                    Try Again
                                </Button>
                                <Button
                                    variant="primary"
                                    icon={Home}
                                    onClick={() => navigate('/assessments')}
                                >
                                    Done
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Answer Review Screen */}
                {quizCompleted && results && showAnswerReview && (
                    <div className="answer-review-screen">
                        <div className="review-header">
                            <button
                                className="back-to-results-btn"
                                onClick={() => setShowAnswerReview(false)}
                            >
                                <ArrowLeft size={18} />
                                Back to Results
                            </button>
                            <h1>Answer Review</h1>
                            <p className="review-summary">
                                You got <strong>{results.score}</strong> out of <strong>{results.totalQuestions}</strong> correct
                            </p>
                        </div>

                        <div className="answers-list">
                            {results.answers.map((answer, index) => (
                                <div
                                    key={index}
                                    className={`answer-card ${answer.isCorrect ? 'correct' : 'incorrect'}`}
                                >
                                    <div className="answer-header">
                                        <span className="question-number">Question {index + 1}</span>
                                        <span className={`status-badge ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                                            {answer.isCorrect ? (
                                                <><Check size={14} /> Correct</>
                                            ) : (
                                                <><X size={14} /> Wrong</>
                                            )}
                                        </span>
                                    </div>

                                    <p className="question-text-review">{answer.question}</p>

                                    <div className="answer-details">
                                        <div className="your-answer">
                                            <span className="answer-label">Your answer:</span>
                                            <span className={`answer-value ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                                                {answer.selectedAnswer}
                                            </span>
                                        </div>

                                        {!answer.isCorrect && (
                                            <div className="correct-answer">
                                                <span className="answer-label">Correct answer:</span>
                                                <span className="answer-value correct">
                                                    {answer.correctAnswer}
                                                </span>
                                            </div>
                                        )}

                                        <div className="translation">
                                            <span className="answer-label">Meaning:</span>
                                            <span className="answer-value">{answer.translation}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="review-actions">
                            <Button
                                variant="secondary"
                                icon={RotateCcw}
                                onClick={handleStartQuiz}
                            >
                                Try Again
                            </Button>
                            <Button
                                variant="primary"
                                icon={Home}
                                onClick={() => navigate('/assessments')}
                            >
                                Back to Assessments
                            </Button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

export default QuizPage
