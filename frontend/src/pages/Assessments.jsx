import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    CheckCircle2,
    Star,
    TrendingUp,
    Volume2,
    ClipboardList,
    Mic,
    Clock,
    Play,
    Lock
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getAssessmentStats, getAssessmentResults } from '../lib/database'
import { getAllQuizzes, isQuizUnlocked, quizzes } from '../data/quizData'
import {
    getAllPronunciationTests,
    isPronunciationTestUnlocked,
    pronunciationTests
} from '../data/pronunciationData'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import Button from '../components/Button'
import FocusModeToggle from '../components/FocusModeToggle'
import { useSettings } from '../context/SettingsContext'
import './Assessments.css'

function Assessments() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { settings } = useSettings()
    const [activeTab, setActiveTab] = useState('available')
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        completed: 0,
        averageScore: 0,
        completedQuizIds: []
    })
    const [completedResults, setCompletedResults] = useState([])

    // Load stats and results from database
    useEffect(() => {
        async function loadData() {
            if (!user?.id) return

            setLoading(false)
            try {
                const [statsData, resultsData] = await Promise.all([
                    getAssessmentStats(user.id),
                    getAssessmentResults(user.id)
                ])
                setStats(statsData)
                setCompletedResults(resultsData)
            } catch (error) {
                console.error('Error loading assessment data:', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [user])

    // Get all quizzes and categorize them
    const allQuizzes = getAllQuizzes()
    const allPronunciationTests = getAllPronunciationTests()

    // Separate quizzes into categories based on completion and unlock status
    const categorizedQuizzes = allQuizzes.map(quiz => {
        const isCompleted = stats.completedQuizIds.includes(quiz.id)
        const isUnlocked = isQuizUnlocked(quiz.id, stats.completedQuizIds)
        const prerequisiteQuiz = quiz.prerequisite ? quizzes[quiz.prerequisite] : null

        return {
            ...quiz,
            isCompleted,
            isUnlocked,
            prerequisiteQuiz,
            // Build assessment format
            assessmentType: 'quiz',
            type: quiz.type,
            level: quiz.level,
            title: quiz.title,
            description: quiz.description,
            questions: quiz.questionsCount,
            duration: `~${Math.round(quiz.duration / 60)} min`,
            accessibilityOptions: ['Extended time', 'Audio questions', 'Multiple response formats']
        }
    })

    // Categorize pronunciation tests
    const categorizedPronunciation = allPronunciationTests.map(test => {
        const isCompleted = stats.completedQuizIds.includes(test.id)
        const isUnlocked = isPronunciationTestUnlocked(test.id, stats.completedQuizIds)
        const prerequisiteTest = test.prerequisite ? pronunciationTests[test.prerequisite] : null

        return {
            ...test,
            isCompleted,
            isUnlocked,
            prerequisiteQuiz: prerequisiteTest,
            // Build assessment format
            assessmentType: 'speaking',
            type: test.type,
            level: test.level,
            title: test.title,
            description: test.description,
            questions: test.wordsCount,
            duration: `~${Math.round(test.duration / 60)} min`,
            accessibilityOptions: ['Audio playback', 'Retry attempts', 'Visual feedback']
        }
    })

    // Combine all assessments
    const allAssessments = [...categorizedQuizzes, ...categorizedPronunciation]

    // Available = Unlocked AND Not Completed
    const availableAssessments = allAssessments.filter(q => q.isUnlocked && !q.isCompleted)

    // Completed = Already done
    const completedAssessments = allAssessments.filter(q => q.isCompleted)

    // Locked = Has prerequisite that's not completed
    const lockedAssessments = allAssessments.filter(q => !q.isUnlocked)

    const currentList = activeTab === 'available' ? availableAssessments : completedAssessments

    // Stats cards data
    const statsCards = [
        {
            label: 'Completed',
            value: stats.completed,
            sublabel: 'assessments',
            icon: CheckCircle2,
            iconColor: '#10B981'
        },
        {
            label: 'Average Score',
            value: `${stats.averageScore}%`,
            sublabel: 'overall performance',
            icon: Star,
            iconColor: '#F59E0B'
        },
        {
            label: 'Available',
            value: availableAssessments.length,
            sublabel: 'to complete',
            icon: TrendingUp,
            iconColor: '#E91E8C'
        }
    ]

    // Handle starting an assessment
    const handleStartAssessment = (assessment) => {
        if (assessment.comingSoon || !assessment.isUnlocked) {
            return // Don't navigate for coming soon or locked items
        }

        // Route based on assessment type
        if (assessment.assessmentType === 'speaking') {
            navigate(`/assessments/pronunciation/${assessment.id}`)
        } else {
            navigate(`/assessments/quiz/${assessment.id}`)
        }
    }

    // Text-to-speech for reading assessment info
    const handleReadAloud = (assessment) => {
        if (!window.speechSynthesis) return

        window.speechSynthesis.cancel()
        const text = `${assessment.title}. ${assessment.description}. ${assessment.questions} questions, ${assessment.duration}`
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.9
        window.speechSynthesis.speak(utterance)
    }


    // Get level badge color
    const getLevelColor = (level) => {
        switch (level) {
            case 'beginner': return 'tag-beginner'
            case 'intermediate': return 'tag-intermediate'
            case 'advanced': return 'tag-advanced'
            default: return ''
        }
    }

    return (
        <div className={`assessments-page ${settings.focusMode ? 'focus-mode-active' : ''}`}>
            <Navbar />
            <FocusModeToggle />

            <main className="assessments-content">
                <div className="assessments-header">
                    <h1 className="assessments-title">Assessments</h1>
                    <p className="assessments-subtitle">Test your skills and track your progress</p>
                </div>

                {/* Stats Cards */}
                <div className="stats-row">
                    {statsCards.map(({ label, value, sublabel, icon: Icon, iconColor }, index) => (
                        <Card key={index} className="stat-card">
                            <div className="stat-header">
                                <span className="stat-label">{label}</span>
                                <Icon size={20} style={{ color: iconColor }} />
                            </div>
                            <div className="stat-value">{loading ? '...' : value}</div>
                            <div className="stat-sublabel">{sublabel}</div>
                        </Card>
                    ))}
                </div>

                {/* Filter Tabs */}
                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${activeTab === 'available' ? 'active' : ''}`}
                        onClick={() => setActiveTab('available')}
                    >
                        Available ({availableAssessments.length})
                    </button>
                    <button
                        className={`filter-tab ${activeTab === 'completed' ? 'active' : ''}`}
                        onClick={() => setActiveTab('completed')}
                    >
                        Completed ({completedAssessments.length})
                    </button>
                </div>

                {/* Assessment Cards */}
                <div className="assessments-grid">
                    {currentList.map((assessment) => (
                        <Card key={assessment.id} className="assessment-card">
                            <div className="assessment-header">
                                <div className="assessment-tags">
                                    <span className={`tag tag-${assessment.type}`}>
                                        {assessment.type === 'quiz' && <ClipboardList size={14} />}
                                        {assessment.type === 'speaking' && <Mic size={14} />}
                                        {assessment.type}
                                    </span>
                                    <span className={`tag ${getLevelColor(assessment.level)}`}>
                                        {assessment.level}
                                    </span>
                                    {assessment.comingSoon && (
                                        <span className="tag tag-coming-soon">Coming Soon</span>
                                    )}
                                </div>
                                <button
                                    className="audio-btn"
                                    aria-label="Read aloud"
                                    onClick={() => handleReadAloud(assessment)}
                                >
                                    <Volume2 size={18} />
                                </button>
                            </div>

                            <h3 className="assessment-title">{assessment.title}</h3>
                            <p className="assessment-description">{assessment.description}</p>

                            <div className="assessment-meta">
                                <span className="meta-item">
                                    <ClipboardList size={16} />
                                    {assessment.questions} questions
                                </span>
                                <span className="meta-item">
                                    <Clock size={16} />
                                    {assessment.duration}
                                </span>
                            </div>

                            <div className="accessibility-box">
                                <span className="accessibility-label">Accessibility Options:</span>
                                <span className="accessibility-options">
                                    {assessment.accessibilityOptions.join(' • ')}
                                </span>
                            </div>

                            <Button
                                variant="primary"
                                icon={Play}
                                className="start-btn"
                                onClick={() => handleStartAssessment(assessment)}
                            >
                                {assessment.isCompleted ? 'Retake Assessment' : 'Start Assessment'}
                            </Button>
                        </Card>
                    ))}

                    {currentList.length === 0 && (
                        <div className="empty-state">
                            <p>No {activeTab} assessments yet.</p>
                        </div>
                    )}
                </div>

                {/* Show Locked Quizzes (Coming Up Next) */}
                {activeTab === 'available' && lockedAssessments.length > 0 && (
                    <div className="locked-section">
                        <h2 className="section-title">🔒 Unlock Next</h2>
                        <p className="section-description">Complete the basic quizzes to unlock these</p>
                        <div className="assessments-grid locked-grid">
                            {lockedAssessments.map((assessment) => (
                                <Card key={assessment.id} className="assessment-card locked">
                                    <div className="locked-overlay">
                                        <Lock size={24} />
                                        <span>
                                            Complete "{assessment.prerequisiteQuiz?.title}" first
                                        </span>
                                    </div>
                                    <div className="assessment-header">
                                        <div className="assessment-tags">
                                            <span className={`tag tag-${assessment.type}`}>
                                                {assessment.type}
                                            </span>
                                            <span className={`tag ${getLevelColor(assessment.level)}`}>
                                                {assessment.level}
                                            </span>
                                        </div>
                                    </div>

                                    <h3 className="assessment-title">{assessment.title}</h3>
                                    <p className="assessment-description">{assessment.description}</p>

                                    <div className="assessment-meta">
                                        <span className="meta-item">
                                            <ClipboardList size={16} />
                                            {assessment.questions} questions
                                        </span>
                                        <span className="meta-item">
                                            <Clock size={16} />
                                            {assessment.duration}
                                        </span>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent Results Section (only show in completed tab) */}
                {activeTab === 'completed' && completedResults.length > 0 && (
                    <div className="recent-results-section">
                        <h2 className="section-title">Recent Results</h2>
                        <div className="results-list">
                            {completedResults.slice(0, 5).map((result) => (
                                <Card key={result.id} className="result-card">
                                    <div className="result-info">
                                        <span className="result-title">{result.quiz_title}</span>
                                        <span className="result-date">
                                            {new Date(result.completed_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="result-score">
                                        <span className={`score-badge ${result.score_percentage >= 70 ? 'good' : 'needs-work'}`}>
                                            {result.score_percentage}%
                                        </span>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

export default Assessments
