import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Flame,
    Trophy,
    Clock,
    Target,
    BookOpen,
    Play,
    ChevronRight,
    TrendingUp,
    Volume2,
    Mic,
    Hash,
    MessageSquare
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import Button from '../components/Button'
import { useAuth } from '../context/AuthContext'
import { getLessonProgress, getProfile } from '../lib/database'
import './Dashboard.css'

function Dashboard() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        streak: 0,
        bestStreak: 0,
        lessonsCompleted: 0,
        timeSpent: 0,
        weeklyGoal: 0
    })
    const [currentLesson, setCurrentLesson] = useState(null)
    const [recommendations, setRecommendations] = useState([])
    const [userName, setUserName] = useState('')

    // Lesson sections for mapping
    const lessonSections = {
        words: { icon: BookOpen, title: 'Words' },
        numbers: { icon: Hash, title: 'Numbers' },
        sentences: { icon: MessageSquare, title: 'Sentences' }
    }

    const lessonTitles = {
        1: 'Basic Greetings',
        2: 'Common Objects',
        3: 'Colors & Shapes',
        4: 'Family Members',
        5: 'Food & Drinks'
    }

    const languageNames = {
        english: 'English',
        hindi: 'Hindi',
        tamil: 'Tamil',
        telugu: 'Telugu'
    }

    // Load dashboard data
    useEffect(() => {
        async function loadDashboardData() {
            if (!user) return

            try {
                // Load user profile
                const profile = await getProfile(user.id)
                if (profile?.full_name) {
                    setUserName(profile.full_name.split(' ')[0])
                }

                // Load lesson progress
                const progress = await getLessonProgress(user.id)

                // Calculate stats
                const completedLessons = progress.filter(p => p.status === 'completed')
                const inProgressLessons = progress.filter(p => p.status === 'in_progress')

                // Calculate streak (consecutive days with activity)
                let streak = 0
                let bestStreak = 0
                if (progress.length > 0) {
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)

                    // Get unique dates with activity
                    const activityDates = [...new Set(progress.map(p => {
                        const date = new Date(p.last_accessed_at)
                        date.setHours(0, 0, 0, 0)
                        return date.getTime()
                    }))].sort((a, b) => b - a)

                    // Calculate current streak
                    const todayTime = today.getTime()
                    const yesterdayTime = todayTime - 86400000

                    if (activityDates.includes(todayTime) || activityDates.includes(yesterdayTime)) {
                        streak = 1
                        let lastDate = activityDates[0]

                        for (let i = 1; i < activityDates.length; i++) {
                            if (lastDate - activityDates[i] === 86400000) {
                                streak++
                                lastDate = activityDates[i]
                            } else {
                                break
                            }
                        }
                    }
                    bestStreak = streak // For now, best streak = current streak
                }

                // Calculate weekly goal progress (target: 7 lessons per week)
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                const thisWeekCompleted = completedLessons.filter(l =>
                    new Date(l.completed_at) > weekAgo
                ).length
                const weeklyGoal = Math.min(Math.round((thisWeekCompleted / 7) * 100), 100)

                // Estimate time spent (5 min per completed lesson, 2 min per in-progress)
                const timeSpent = (completedLessons.length * 5) + (inProgressLessons.length * 2)

                setStats({
                    streak,
                    bestStreak,
                    lessonsCompleted: completedLessons.length,
                    timeSpent,
                    weeklyGoal
                })

                // Find most recent in-progress or completed lesson for "Continue Learning"
                const sortedProgress = [...progress].sort((a, b) =>
                    new Date(b.last_accessed_at) - new Date(a.last_accessed_at)
                )

                // Find in-progress lesson first
                let continueLesson = sortedProgress.find(p => p.status === 'in_progress')

                // If no in-progress, find the next available lesson after last completed
                if (!continueLesson && completedLessons.length > 0) {
                    const lastCompleted = sortedProgress.find(p => p.status === 'completed')
                    if (lastCompleted) {
                        // Parse lesson ID: language_section_number
                        const [lang, section, num] = lastCompleted.lesson_id.split('_')
                        const nextNum = parseInt(num) + 1
                        if (nextNum <= 5) {
                            continueLesson = {
                                lesson_id: `${lang}_${section}_${nextNum}`,
                                status: 'available',
                                progress_percent: 0
                            }
                        }
                    }
                }

                if (continueLesson) {
                    const [lang, section, num] = continueLesson.lesson_id.split('_')
                    setCurrentLesson({
                        lesson_id: continueLesson.lesson_id,
                        title: `${languageNames[lang]} ${lessonSections[section]?.title || section}`,
                        subtitle: lessonTitles[parseInt(num)] || `Lesson ${num}`,
                        progress: continueLesson.progress_percent || 0,
                        language: lang,
                        section: section
                    })
                }

                // Generate recommendations based on progress
                const recs = []

                // If user has completed lessons, suggest vocabulary review
                if (completedLessons.length > 0) {
                    recs.push({
                        icon: BookOpen,
                        title: 'Vocabulary Review',
                        subtitle: `${completedLessons.length * 5} words due for review`,
                        action: '/lessons'
                    })
                }

                // Suggest pronunciation practice if user has done any lessons
                if (progress.length > 0) {
                    recs.push({
                        icon: Mic,
                        title: 'Pronunciation Practice',
                        subtitle: 'Improve your speaking',
                        action: '/practice'
                    })
                }

                // Find languages the user hasn't started yet
                const startedLanguages = new Set(progress.map(p => p.lesson_id.split('_')[0]))
                const allLanguages = ['english', 'hindi', 'tamil', 'telugu']
                const unstarted = allLanguages.filter(l => !startedLanguages.has(l))

                if (unstarted.length > 0) {
                    const randomUnstarted = unstarted[Math.floor(Math.random() * unstarted.length)]
                    recs.push({
                        icon: BookOpen,
                        title: `${languageNames[randomUnstarted]} Basics`,
                        subtitle: 'New language available',
                        action: '/lessons'
                    })
                }

                // If no started lessons, show beginner recommendations
                if (progress.length === 0) {
                    recs.push(
                        { icon: BookOpen, title: 'Start with English', subtitle: 'Begin your journey', action: '/lessons' },
                        { icon: Mic, title: 'Pronunciation Practice', subtitle: 'Learn proper pronunciation', action: '/practice' },
                        { icon: BookOpen, title: 'Hindi Basics', subtitle: 'New language available', action: '/lessons' }
                    )
                }

                setRecommendations(recs.slice(0, 3))
            } catch (error) {
                console.error('Error loading dashboard data:', error)
            } finally {
                setLoading(false)
            }
        }

        loadDashboardData()
    }, [user])

    const handleResumeLesson = () => {
        navigate('/lessons')
    }

    const handleRecommendationClick = (action) => {
        navigate(action)
    }

    const statsDisplay = [
        {
            icon: Flame,
            label: 'Current Streak',
            value: `${stats.streak} day${stats.streak !== 1 ? 's' : ''}`,
            sublabel: `Best: ${stats.bestStreak} days`,
            iconColor: '#F59E0B'
        },
        {
            icon: Trophy,
            label: 'Lessons Completed',
            value: stats.lessonsCompleted.toString(),
            sublabel: stats.lessonsCompleted > 0 ? 'Great progress!' : 'Keep learning!',
            iconColor: '#E91E8C'
        },
        {
            icon: Clock,
            label: 'Time Spent',
            value: stats.timeSpent >= 60 ? `${Math.round(stats.timeSpent / 60)} hr` : `${stats.timeSpent} min`,
            sublabel: 'Total learning time',
            iconColor: '#3B82F6'
        },
        {
            icon: Target,
            label: 'Weekly Goal',
            value: `${stats.weeklyGoal}%`,
            sublabel: null,
            progress: stats.weeklyGoal,
            iconColor: '#E91E8C'
        },
    ]

    return (
        <div className="dashboard-page">
            <Navbar />

            <main className="dashboard-content">
                <div className="dashboard-header">
                    <div>
                        <h1 className="dashboard-title">
                            Welcome back{userName ? `, ${userName}` : ''}!
                        </h1>
                        <p className="dashboard-subtitle">Continue your learning journey today</p>
                    </div>
                    <Button variant="secondary" icon={Volume2}>
                        Read Aloud
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    {statsDisplay.map(({ icon: Icon, label, value, sublabel, progress, iconColor }, index) => (
                        <Card key={index} className="stat-card">
                            <div className="stat-header">
                                <span className="stat-label">{label}</span>
                                <Icon size={20} style={{ color: iconColor }} />
                            </div>
                            <div className="stat-value">{loading ? '...' : value}</div>
                            {sublabel && <div className="stat-sublabel">{sublabel}</div>}
                            {progress !== undefined && (
                                <div className="stat-progress">
                                    <div
                                        className="stat-progress-bar"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            )}
                        </Card>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="dashboard-grid">
                    {/* Continue Learning */}
                    <Card className="continue-card">
                        <div className="section-header">
                            <BookOpen size={20} />
                            <h2 className="section-title">Continue Learning</h2>
                        </div>
                        <p className="section-subtitle">Pick up where you left off</p>

                        {currentLesson ? (
                            <div className="lesson-card">
                                <div className="lesson-info">
                                    <h3 className="lesson-title">{currentLesson.title}</h3>
                                    <p className="lesson-subtitle">{currentLesson.subtitle}</p>
                                    <div className="lesson-progress">
                                        <div
                                            className="lesson-progress-bar"
                                            style={{ width: `${currentLesson.progress}%` }}
                                        />
                                    </div>
                                </div>
                                <Button
                                    variant="primary"
                                    icon={Play}
                                    className="resume-btn"
                                    onClick={handleResumeLesson}
                                >
                                    Resume
                                </Button>
                            </div>
                        ) : (
                            <div className="lesson-card empty">
                                <div className="lesson-info">
                                    <h3 className="lesson-title">No lessons in progress</h3>
                                    <p className="lesson-subtitle">Start a new lesson to begin learning</p>
                                </div>
                                <Button
                                    variant="primary"
                                    icon={Play}
                                    className="resume-btn"
                                    onClick={handleResumeLesson}
                                >
                                    Start
                                </Button>
                            </div>
                        )}

                        <button className="view-all-btn" onClick={() => navigate('/lessons')}>
                            View All Lessons
                            <ChevronRight size={18} />
                        </button>
                    </Card>

                    {/* Recommended For You */}
                    <Card className="recommended-card">
                        <div className="section-header">
                            <TrendingUp size={20} />
                            <h2 className="section-title">Recommended For You</h2>
                        </div>
                        <p className="section-subtitle">Based on your learning style</p>

                        <div className="recommendation-list">
                            {recommendations.map(({ icon: Icon, title, subtitle, action }, index) => (
                                <button
                                    key={index}
                                    className="recommendation-item"
                                    onClick={() => handleRecommendationClick(action)}
                                >
                                    <div className="recommendation-info">
                                        <h3 className="recommendation-title">{title}</h3>
                                        <p className="recommendation-subtitle">{subtitle}</p>
                                    </div>
                                    <ChevronRight size={20} className="recommendation-arrow" />
                                </button>
                            ))}
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    )
}

export default Dashboard
