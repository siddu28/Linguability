import { useState, useEffect } from 'react'
import {
    BookOpen,
    Hash,
    MessageSquare,
    ChevronRight,
    Volume2,
    Play,
    Lock,
    CheckCircle2,
    Eye,
    Clock
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import Button from '../components/Button'
import './Lessons.css'

function Lessons() {
    const [selectedLanguage, setSelectedLanguage] = useState(null)
    const [accessibilitySettings, setAccessibilitySettings] = useState({
        challenges: [],
        fontSize: 'medium',
        fontFamily: 'poppins',
        reduceMotion: false,
        focusMode: false,
        readingRuler: false,
        textToSpeech: false
    })

    // Load accessibility settings from localStorage (will come from Supabase later)
    useEffect(() => {
        const challenges = JSON.parse(localStorage.getItem('learningChallenges') || '[]')
        setAccessibilitySettings(prev => ({ ...prev, challenges }))
    }, [])

    // Language options
    const languages = [
        { id: 'english', name: 'English', flag: '🇺🇸', lessons: 15, progress: 0 },
        { id: 'hindi', name: 'Hindi', flag: '🇮🇳', lessons: 15, progress: 0 },
        { id: 'tamil', name: 'Tamil', flag: '🇮🇳', lessons: 15, progress: 0 },
        { id: 'telugu', name: 'Telugu', flag: '🇮🇳', lessons: 15, progress: 0 }
    ]

    // Lesson sections for each language
    const lessonSections = [
        {
            id: 'words',
            title: 'Words',
            description: 'Learn essential vocabulary and common words',
            icon: BookOpen,
            lessons: [
                { id: 1, title: 'Basic Greetings', duration: '5 min', status: 'available' },
                { id: 2, title: 'Common Objects', duration: '7 min', status: 'locked' },
                { id: 3, title: 'Colors & Shapes', duration: '6 min', status: 'locked' },
                { id: 4, title: 'Family Members', duration: '8 min', status: 'locked' },
                { id: 5, title: 'Food & Drinks', duration: '7 min', status: 'locked' }
            ]
        },
        {
            id: 'numbers',
            title: 'Numbers',
            description: 'Master counting and numerical expressions',
            icon: Hash,
            lessons: [
                { id: 1, title: 'Numbers 1-10', duration: '5 min', status: 'available' },
                { id: 2, title: 'Numbers 11-50', duration: '8 min', status: 'locked' },
                { id: 3, title: 'Numbers 51-100', duration: '8 min', status: 'locked' },
                { id: 4, title: 'Ordinal Numbers', duration: '6 min', status: 'locked' },
                { id: 5, title: 'Time & Dates', duration: '10 min', status: 'locked' }
            ]
        },
        {
            id: 'sentences',
            title: 'Sentences',
            description: 'Build complete sentences and conversations',
            icon: MessageSquare,
            lessons: [
                { id: 1, title: 'Simple Statements', duration: '8 min', status: 'available' },
                { id: 2, title: 'Asking Questions', duration: '10 min', status: 'locked' },
                { id: 3, title: 'Daily Conversations', duration: '12 min', status: 'locked' },
                { id: 4, title: 'Expressing Feelings', duration: '10 min', status: 'locked' },
                { id: 5, title: 'Complex Sentences', duration: '15 min', status: 'locked' }
            ]
        }
    ]

    // Get accessibility class names based on user's challenges
    const getAccessibilityClasses = () => {
        const classes = []
        const { challenges } = accessibilitySettings

        if (challenges.includes('dyslexia')) {
            classes.push('dyslexia-friendly')
        }
        if (challenges.includes('adhd')) {
            classes.push('focus-mode')
        }
        if (challenges.includes('visual')) {
            classes.push('high-contrast')
        }
        if (challenges.includes('motor')) {
            classes.push('large-buttons')
        }
        if (challenges.includes('memory')) {
            classes.push('show-hints')
        }

        return classes.join(' ')
    }

    // Get accessibility features description
    const getActiveAdaptations = () => {
        const { challenges } = accessibilitySettings
        const adaptations = []

        if (challenges.includes('dyslexia')) {
            adaptations.push({ label: 'Dyslexia Support', desc: 'OpenDyslexic font, increased spacing' })
        }
        if (challenges.includes('adhd')) {
            adaptations.push({ label: 'Focus Mode', desc: 'Simplified interface, no distractions' })
        }
        if (challenges.includes('auditory')) {
            adaptations.push({ label: 'Audio Support', desc: 'Captions enabled, slower playback' })
        }
        if (challenges.includes('visual')) {
            adaptations.push({ label: 'Visual Support', desc: 'High contrast, auto-play audio' })
        }
        if (challenges.includes('motor')) {
            adaptations.push({ label: 'Motor Support', desc: 'Large buttons, keyboard shortcuts' })
        }
        if (challenges.includes('memory')) {
            adaptations.push({ label: 'Memory Support', desc: 'Hints visible, spaced repetition' })
        }

        return adaptations
    }

    const activeAdaptations = getActiveAdaptations()

    return (
        <div className={`lessons-page ${getAccessibilityClasses()}`}>
            <Navbar />

            <main className="lessons-content">
                {/* Accessibility Banner */}
                {activeAdaptations.length > 0 && (
                    <div className="accessibility-banner">
                        <Eye size={18} />
                        <span>Active adaptations: </span>
                        {activeAdaptations.map((a, i) => (
                            <span key={i} className="adaptation-tag" title={a.desc}>
                                {a.label}
                                {i < activeAdaptations.length - 1 && ', '}
                            </span>
                        ))}
                    </div>
                )}

                {!selectedLanguage ? (
                    <>
                        <div className="lessons-header">
                            <h1 className="lessons-title">Choose a Language</h1>
                            <p className="lessons-subtitle">Select a language to start learning</p>
                        </div>

                        <div className="languages-grid">
                            {languages.map((lang) => (
                                <Card
                                    key={lang.id}
                                    className="language-card"
                                    onClick={() => setSelectedLanguage(lang)}
                                >
                                    <div className="language-flag">{lang.flag}</div>
                                    <h3 className="language-name">{lang.name}</h3>
                                    <p className="language-info">{lang.lessons} lessons</p>
                                    <div className="language-progress">
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${lang.progress}%` }}
                                            />
                                        </div>
                                        <span className="progress-text">{lang.progress}% complete</span>
                                    </div>
                                    <Button variant="primary" className="start-language-btn">
                                        Start Learning
                                        <ChevronRight size={18} />
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="lessons-header">
                            <button
                                className="back-btn"
                                onClick={() => setSelectedLanguage(null)}
                            >
                                ← Back to Languages
                            </button>
                            <div className="header-content">
                                <span className="selected-flag">{selectedLanguage.flag}</span>
                                <div>
                                    <h1 className="lessons-title">{selectedLanguage.name} Lessons</h1>
                                    <p className="lessons-subtitle">Learn words, numbers, and sentences</p>
                                </div>
                            </div>
                        </div>

                        <div className="sections-container">
                            {lessonSections.map((section) => {
                                const Icon = section.icon
                                return (
                                    <div key={section.id} className="lesson-section">
                                        <div className="section-header">
                                            <div className="section-icon">
                                                <Icon size={24} />
                                            </div>
                                            <div>
                                                <h2 className="section-title">{section.title}</h2>
                                                <p className="section-description">{section.description}</p>
                                            </div>
                                        </div>

                                        <div className="lessons-list">
                                            {section.lessons.map((lesson, index) => (
                                                <Card
                                                    key={lesson.id}
                                                    className={`lesson-item ${lesson.status}`}
                                                >
                                                    <div className="lesson-number">{index + 1}</div>
                                                    <div className="lesson-details">
                                                        <h4 className="lesson-title">{lesson.title}</h4>
                                                        <div className="lesson-meta">
                                                            <Clock size={14} />
                                                            <span>{lesson.duration}</span>
                                                        </div>
                                                    </div>
                                                    <div className="lesson-actions">
                                                        {lesson.status === 'completed' && (
                                                            <CheckCircle2 className="status-icon completed" size={24} />
                                                        )}
                                                        {lesson.status === 'locked' && (
                                                            <Lock className="status-icon locked" size={20} />
                                                        )}
                                                        {lesson.status === 'available' && (
                                                            <>
                                                                <button className="audio-btn" aria-label="Listen">
                                                                    <Volume2 size={18} />
                                                                </button>
                                                                <Button
                                                                    variant="primary"
                                                                    icon={Play}
                                                                    className="start-lesson-btn"
                                                                >
                                                                    Start
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                )}
            </main>
        </div>
    )
}

export default Lessons
