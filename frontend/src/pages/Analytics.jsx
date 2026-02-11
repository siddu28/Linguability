import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    BookOpen,
    Trophy,
    Clock,
    TrendingUp,
    BarChart3,
    Flame,
    Target,
    ChevronRight,
    Award,
    CheckCircle
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import { useAuth } from '../context/AuthContext'
import { getLessonProgress, getAssessmentResults } from '../lib/database'
import './Analytics.css'

function Analytics() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [lessonData, setLessonData] = useState([])
    const [assessmentData, setAssessmentData] = useState([])

    // Derived stats
    const [stats, setStats] = useState({
        totalLessons: 0,
        completedLessons: 0,
        totalAssessments: 0,
        averageScore: 0,
        streak: 0,
        totalTimeMin: 0
    })
    const [activityDays, setActivityDays] = useState([])
    const [scoreTrend, setScoreTrend] = useState([])
    const [languageBreakdown, setLanguageBreakdown] = useState([])
    const [recentActivity, setRecentActivity] = useState([])

    const languageNames = {
        english: 'English',
        hindi: 'Hindi',
        tamil: 'Tamil',
        telugu: 'Telugu'
    }

    const languageColors = {
        english: '#3B82F6',
        hindi: '#E91E8C',
        tamil: '#10B981',
        telugu: '#F59E0B'
    }

    useEffect(() => {
        async function loadData() {
            if (!user) return

            try {
                const [lessons, assessments] = await Promise.all([
                    getLessonProgress(user.id),
                    getAssessmentResults(user.id)
                ])

                setLessonData(lessons)
                setAssessmentData(assessments)

                // --- Summary Stats ---
                const completedLessons = lessons.filter(l => l.status === 'completed')
                const inProgressLessons = lessons.filter(l => l.status === 'in_progress')
                const avgScore = assessments.length > 0
                    ? Math.round(assessments.reduce((sum, a) => sum + parseFloat(a.score_percentage || 0), 0) / assessments.length)
                    : 0

                // Estimate time: 5 min/completed, 2 min/in-progress, + actual quiz times
                const lessonTimeMin = (completedLessons.length * 5) + (inProgressLessons.length * 2)
                const quizTimeSec = assessments.reduce((sum, a) => sum + (a.time_taken_seconds || 0), 0)
                const totalTimeMin = lessonTimeMin + Math.round(quizTimeSec / 60)

                // Streak calculation
                let streak = 0
                if (lessons.length > 0) {
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    const allDates = [
                        ...lessons.map(l => l.last_accessed_at),
                        ...assessments.map(a => a.completed_at)
                    ].filter(Boolean)

                    const uniqueDays = [...new Set(allDates.map(d => {
                        const date = new Date(d)
                        date.setHours(0, 0, 0, 0)
                        return date.getTime()
                    }))].sort((a, b) => b - a)

                    const todayTime = today.getTime()
                    const yesterdayTime = todayTime - 86400000

                    if (uniqueDays.includes(todayTime) || uniqueDays.includes(yesterdayTime)) {
                        streak = 1
                        let lastDate = uniqueDays[0]
                        for (let i = 1; i < uniqueDays.length; i++) {
                            if (lastDate - uniqueDays[i] === 86400000) {
                                streak++
                                lastDate = uniqueDays[i]
                            } else {
                                break
                            }
                        }
                    }
                }

                setStats({
                    totalLessons: lessons.length,
                    completedLessons: completedLessons.length,
                    totalAssessments: assessments.length,
                    averageScore: avgScore,
                    streak,
                    totalTimeMin
                })

                // --- Activity Chart (last 14 days) ---
                const days = []
                const now = new Date()
                for (let i = 13; i >= 0; i--) {
                    const day = new Date(now)
                    day.setDate(day.getDate() - i)
                    day.setHours(0, 0, 0, 0)
                    const dayEnd = new Date(day)
                    dayEnd.setHours(23, 59, 59, 999)

                    const lessonCount = lessons.filter(l => {
                        const d = new Date(l.last_accessed_at)
                        return d >= day && d <= dayEnd
                    }).length

                    const assessCount = assessments.filter(a => {
                        const d = new Date(a.completed_at)
                        return d >= day && d <= dayEnd
                    }).length

                    days.push({
                        label: day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                        shortLabel: day.toLocaleDateString('en-US', { day: 'numeric' }),
                        lessons: lessonCount,
                        assessments: assessCount,
                        total: lessonCount + assessCount
                    })
                }
                setActivityDays(days)

                // --- Score Trend (last 10 assessments) ---
                const recentAssessments = [...assessments]
                    .sort((a, b) => new Date(a.completed_at) - new Date(b.completed_at))
                    .slice(-10)
                    .map(a => ({
                        label: a.quiz_title?.substring(0, 15) || 'Quiz',
                        score: parseFloat(a.score_percentage || 0),
                        date: new Date(a.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    }))
                setScoreTrend(recentAssessments)

                // --- Language Breakdown ---
                const langMap = {}
                lessons.forEach(l => {
                    const lang = l.lesson_id.split('_')[0]
                    if (!langMap[lang]) {
                        langMap[lang] = { total: 0, completed: 0 }
                    }
                    langMap[lang].total++
                    if (l.status === 'completed') langMap[lang].completed++
                })
                const breakdown = Object.entries(langMap).map(([lang, data]) => ({
                    language: lang,
                    name: languageNames[lang] || lang,
                    color: languageColors[lang] || '#6B7280',
                    total: data.total,
                    completed: data.completed,
                    percent: Math.round((data.completed / data.total) * 100)
                }))
                setLanguageBreakdown(breakdown)

                // --- Recent Activity (last 8 items) ---
                const allActivity = [
                    ...lessons.map(l => ({
                        type: 'lesson',
                        title: l.lesson_id.replace(/_/g, ' '),
                        status: l.status,
                        date: l.last_accessed_at,
                        progress: l.progress_percent
                    })),
                    ...assessments.map(a => ({
                        type: 'assessment',
                        title: a.quiz_title || 'Assessment',
                        status: 'completed',
                        date: a.completed_at,
                        score: a.score_percentage
                    }))
                ]
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 8)
                setRecentActivity(allActivity)

            } catch (error) {
                console.error('Error loading analytics:', error)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [user])

    const maxActivity = Math.max(...activityDays.map(d => d.total), 1)

    const formatDate = (dateStr) => {
        if (!dateStr) return ''
        const d = new Date(dateStr)
        const now = new Date()
        const diffMs = now - d
        const diffMin = Math.floor(diffMs / 60000)
        const diffHr = Math.floor(diffMin / 60)
        const diffDay = Math.floor(diffHr / 24)

        if (diffMin < 1) return 'Just now'
        if (diffMin < 60) return `${diffMin}m ago`
        if (diffHr < 24) return `${diffHr}h ago`
        if (diffDay < 7) return `${diffDay}d ago`
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    if (loading) {
        return (
            <div className="analytics-page">
                <Navbar />
                <main className="analytics-content">
                    <div className="analytics-loading">Loading analytics...</div>
                </main>
            </div>
        )
    }

    return (
        <div className="analytics-page">
            <Navbar />

            <main className="analytics-content">
                <div className="analytics-header">
                    <div>
                        <h1 className="analytics-title">
                            <BarChart3 size={28} />
                            Reading Progress Analytics
                        </h1>
                        <p className="analytics-subtitle">Track your learning journey and see your improvement</p>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="analytics-stats-grid">
                    <Card className="analytics-stat-card">
                        <div className="stat-icon-wrap" style={{ background: 'rgba(233, 30, 140, 0.1)' }}>
                            <BookOpen size={22} style={{ color: '#E91E8C' }} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-number">{stats.completedLessons}</span>
                            <span className="stat-label">Lessons Completed</span>
                        </div>
                    </Card>

                    <Card className="analytics-stat-card">
                        <div className="stat-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                            <Trophy size={22} style={{ color: '#3B82F6' }} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-number">{stats.totalAssessments}</span>
                            <span className="stat-label">Assessments Taken</span>
                        </div>
                    </Card>

                    <Card className="analytics-stat-card">
                        <div className="stat-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                            <Target size={22} style={{ color: '#10B981' }} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-number">{stats.averageScore}%</span>
                            <span className="stat-label">Average Score</span>
                        </div>
                    </Card>

                    <Card className="analytics-stat-card">
                        <div className="stat-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                            <Flame size={22} style={{ color: '#F59E0B' }} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-number">{stats.streak}</span>
                            <span className="stat-label">Day Streak</span>
                        </div>
                    </Card>

                    <Card className="analytics-stat-card">
                        <div className="stat-icon-wrap" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                            <Clock size={22} style={{ color: '#8B5CF6' }} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-number">{stats.totalTimeMin >= 60 ? `${Math.round(stats.totalTimeMin / 60)}h` : `${stats.totalTimeMin}m`}</span>
                            <span className="stat-label">Time Spent</span>
                        </div>
                    </Card>
                </div>

                {/* Charts Row */}
                <div className="analytics-charts-row">
                    {/* Activity Timeline */}
                    <Card className="analytics-chart-card activity-chart-card">
                        <div className="chart-header">
                            <h2 className="chart-title">
                                <TrendingUp size={20} />
                                Daily Activity
                            </h2>
                            <span className="chart-period">Last 14 days</span>
                        </div>
                        <div className="activity-chart">
                            {activityDays.map((day, i) => (
                                <div key={i} className="activity-bar-group" title={`${day.label}: ${day.total} activities`}>
                                    <div className="activity-bar-track">
                                        {day.lessons > 0 && (
                                            <div
                                                className="activity-bar-fill lessons"
                                                style={{ height: `${(day.lessons / maxActivity) * 100}%` }}
                                            />
                                        )}
                                        {day.assessments > 0 && (
                                            <div
                                                className="activity-bar-fill assessments"
                                                style={{ height: `${(day.assessments / maxActivity) * 100}%` }}
                                            />
                                        )}
                                    </div>
                                    <span className="activity-bar-label">{day.shortLabel}</span>
                                </div>
                            ))}
                        </div>
                        <div className="chart-legend">
                            <span className="legend-item"><span className="legend-dot lessons" /> Lessons</span>
                            <span className="legend-item"><span className="legend-dot assessments" /> Assessments</span>
                        </div>
                    </Card>

                    {/* Score Trend */}
                    <Card className="analytics-chart-card score-chart-card">
                        <div className="chart-header">
                            <h2 className="chart-title">
                                <Award size={20} />
                                Score Trends
                            </h2>
                            <span className="chart-period">Last {scoreTrend.length} attempts</span>
                        </div>
                        {scoreTrend.length > 0 ? (
                            <div className="score-chart">
                                {scoreTrend.map((item, i) => (
                                    <div key={i} className="score-bar-group" title={`${item.label}: ${item.score}%`}>
                                        <div className="score-bar-track">
                                            <div
                                                className="score-bar-fill"
                                                style={{
                                                    height: `${item.score}%`,
                                                    background: item.score >= 80 ? '#10B981'
                                                        : item.score >= 60 ? '#F59E0B'
                                                            : '#EF4444'
                                                }}
                                            />
                                        </div>
                                        <span className="score-value">{item.score}%</span>
                                        <span className="score-label">{item.date}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-data-message">
                                <Trophy size={32} />
                                <p>No assessment results yet</p>
                                <button className="start-btn" onClick={() => navigate('/assessments')}>
                                    Take an Assessment
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Bottom Row */}
                <div className="analytics-bottom-row">
                    {/* Language Breakdown */}
                    <Card className="analytics-card language-card">
                        <h2 className="card-title">
                            <BookOpen size={20} />
                            Language Progress
                        </h2>
                        {languageBreakdown.length > 0 ? (
                            <div className="language-list">
                                {languageBreakdown.map((lang, i) => (
                                    <div key={i} className="language-item">
                                        <div className="language-info">
                                            <span className="language-name" style={{ color: lang.color }}>
                                                {lang.name}
                                            </span>
                                            <span className="language-stat">
                                                {lang.completed}/{lang.total} lessons
                                            </span>
                                        </div>
                                        <div className="language-progress-track">
                                            <div
                                                className="language-progress-fill"
                                                style={{ width: `${lang.percent}%`, background: lang.color }}
                                            />
                                        </div>
                                        <span className="language-percent">{lang.percent}%</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-data-message">
                                <BookOpen size={32} />
                                <p>Start lessons to see language progress</p>
                                <button className="start-btn" onClick={() => navigate('/lessons')}>
                                    Start Learning
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </Card>

                    {/* Recent Activity */}
                    <Card className="analytics-card recent-card">
                        <h2 className="card-title">
                            <Clock size={20} />
                            Recent Activity
                        </h2>
                        {recentActivity.length > 0 ? (
                            <div className="activity-timeline">
                                {recentActivity.map((item, i) => (
                                    <div key={i} className="timeline-item">
                                        <div className={`timeline-icon ${item.type}`}>
                                            {item.type === 'lesson' ? (
                                                <BookOpen size={14} />
                                            ) : (
                                                <CheckCircle size={14} />
                                            )}
                                        </div>
                                        <div className="timeline-content">
                                            <span className="timeline-title">{item.title}</span>
                                            <span className="timeline-meta">
                                                {item.type === 'assessment' && item.score !== undefined
                                                    ? `Score: ${item.score}%`
                                                    : item.status === 'completed'
                                                        ? 'Completed'
                                                        : `${item.progress || 0}% done`
                                                }
                                            </span>
                                        </div>
                                        <span className="timeline-date">{formatDate(item.date)}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-data-message">
                                <Clock size={32} />
                                <p>No activity yet. Start learning!</p>
                            </div>
                        )}
                    </Card>
                </div>
            </main>
        </div>
    )
}

export default Analytics
