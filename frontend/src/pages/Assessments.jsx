import { useState } from 'react'
import {
    CheckCircle2,
    Star,
    TrendingUp,
    Volume2,
    ClipboardList,
    Mic,
    Clock,
    Play
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import Button from '../components/Button'
import './Assessments.css'

function Assessments() {
    const [activeTab, setActiveTab] = useState('available')

    // Stats - all zeros initially
    const stats = [
        {
            label: 'Completed',
            value: 0,
            sublabel: 'assessments',
            icon: CheckCircle2,
            iconColor: '#10B981'
        },
        {
            label: 'Average Score',
            value: '0%',
            sublabel: 'overall performance',
            icon: Star,
            iconColor: '#F59E0B'
        },
        {
            label: 'Available',
            value: 0,
            sublabel: 'to complete',
            icon: TrendingUp,
            iconColor: '#E91E8C'
        }
    ]

    // Sample assessments - empty for now but showing structure
    const assessments = [
        {
            id: 1,
            type: 'quiz',
            level: 'beginner',
            title: 'Hindi Basics Quiz',
            description: 'Test your knowledge of basic Hindi vocabulary and phrases',
            questions: 10,
            duration: '~10 min',
            accessibilityOptions: ['Extended time', 'Audio questions', 'Multiple response formats'],
            completed: false
        },
        {
            id: 2,
            type: 'speaking',
            level: 'beginner',
            title: 'Pronunciation Check',
            description: 'Record yourself speaking Hindi phrases for AI evaluation',
            questions: 5,
            duration: '~15 min',
            accessibilityOptions: ['Extended time', 'Audio questions', 'Multiple response formats'],
            completed: false
        }
    ]

    const availableAssessments = assessments.filter(a => !a.completed)
    const completedAssessments = assessments.filter(a => a.completed)

    const currentList = activeTab === 'available' ? availableAssessments : completedAssessments

    return (
        <div className="assessments-page">
            <Navbar />

            <main className="assessments-content">
                <div className="assessments-header">
                    <h1 className="assessments-title">Assessments</h1>
                    <p className="assessments-subtitle">Test your skills and track your progress</p>
                </div>

                {/* Stats Cards */}
                <div className="stats-row">
                    {stats.map(({ label, value, sublabel, icon: Icon, iconColor }, index) => (
                        <Card key={index} className="stat-card">
                            <div className="stat-header">
                                <span className="stat-label">{label}</span>
                                <Icon size={20} style={{ color: iconColor }} />
                            </div>
                            <div className="stat-value">{value}</div>
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
                                    <span className="tag tag-level">{assessment.level}</span>
                                </div>
                                <button className="audio-btn" aria-label="Read aloud">
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

                            <Button variant="primary" icon={Play} className="start-btn">
                                Start Assessment
                            </Button>
                        </Card>
                    ))}

                    {currentList.length === 0 && (
                        <div className="empty-state">
                            <p>No {activeTab} assessments yet.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default Assessments
