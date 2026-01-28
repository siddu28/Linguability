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
    Mic
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import Button from '../components/Button'
import './Dashboard.css'

function Dashboard() {
    const stats = [
        {
            icon: Flame,
            label: 'Current Streak',
            value: '0 days',
            sublabel: 'Best: 0 days',
            iconColor: '#F59E0B'
        },
        {
            icon: Trophy,
            label: 'Lessons Completed',
            value: '0',
            sublabel: 'Keep learning!',
            iconColor: '#E91E8C'
        },
        {
            icon: Clock,
            label: 'Time Spent',
            value: '0 min',
            sublabel: 'Total learning time',
            iconColor: '#3B82F6'
        },
        {
            icon: Target,
            label: 'Weekly Goal',
            value: '60%',
            sublabel: null,
            progress: 60,
            iconColor: '#E91E8C'
        },
    ]

    const currentLesson = {
        title: 'Hindi Basics - Lesson 3',
        subtitle: 'Common Greetings',
        progress: 45
    }

    const recommendations = [
        { icon: BookOpen, title: 'Vocabulary Review', subtitle: '15 words due for review' },
        { icon: Mic, title: 'Pronunciation Practice', subtitle: 'Improve your speaking' },
        { icon: BookOpen, title: 'Tamil Numbers', subtitle: 'New lesson available' },
    ]

    return (
        <div className="dashboard-page">
            <Navbar />

            <main className="dashboard-content">
                <div className="dashboard-header">
                    <div>
                        <h1 className="dashboard-title">Welcome back!</h1>
                        <p className="dashboard-subtitle">Continue your learning journey today</p>
                    </div>
                    <Button variant="secondary" icon={Volume2}>
                        Read Aloud
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    {stats.map(({ icon: Icon, label, value, sublabel, progress, iconColor }, index) => (
                        <Card key={index} className="stat-card">
                            <div className="stat-header">
                                <span className="stat-label">{label}</span>
                                <Icon size={20} style={{ color: iconColor }} />
                            </div>
                            <div className="stat-value">{value}</div>
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
                            <Button variant="primary" icon={Play} className="resume-btn">
                                Resume
                            </Button>
                        </div>

                        <button className="view-all-btn">
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
                            {recommendations.map(({ icon: Icon, title, subtitle }, index) => (
                                <button key={index} className="recommendation-item">
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
