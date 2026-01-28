import { useState, useEffect, useCallback } from 'react'
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
import LessonViewer from '../components/LessonViewer'
import { useAuth } from '../context/AuthContext'
import { getLessonProgress, markLessonComplete, updateLessonProgress } from '../lib/database'
import './Lessons.css'

function Lessons() {
    const { user } = useAuth()
    const [selectedLanguage, setSelectedLanguage] = useState(null)
    const [activeLesson, setActiveLesson] = useState(null)
    const [lessonProgress, setLessonProgress] = useState({}) // { lessonId: { status, progress_percent } }
    const [languageProgress, setLanguageProgress] = useState({}) // { languageId: progressPercent }
    const [accessibilitySettings, setAccessibilitySettings] = useState({
        challenges: [],
        fontSize: 'medium',
        fontFamily: 'poppins',
        reduceMotion: false,
        focusMode: false,
        readingRuler: false,
        textToSpeech: false
    })

    // Base lesson sections template
    const baseLessonSections = [
        {
            id: 'words',
            title: 'Words',
            description: 'Learn essential vocabulary and common words',
            icon: BookOpen,
            lessons: [
                { id: 1, title: 'Basic Greetings', duration: '5 min' },
                { id: 2, title: 'Common Objects', duration: '7 min' },
                { id: 3, title: 'Colors & Shapes', duration: '6 min' },
                { id: 4, title: 'Family Members', duration: '8 min' },
                { id: 5, title: 'Food & Drinks', duration: '7 min' }
            ]
        },
        {
            id: 'numbers',
            title: 'Numbers',
            description: 'Master counting and numerical expressions',
            icon: Hash,
            lessons: [
                { id: 1, title: 'Numbers 1-10', duration: '5 min' },
                { id: 2, title: 'Numbers 11-50', duration: '8 min' },
                { id: 3, title: 'Numbers 51-100', duration: '8 min' },
                { id: 4, title: 'Ordinal Numbers', duration: '6 min' },
                { id: 5, title: 'Time & Dates', duration: '10 min' }
            ]
        },
        {
            id: 'sentences',
            title: 'Sentences',
            description: 'Build complete sentences and conversations',
            icon: MessageSquare,
            lessons: [
                { id: 1, title: 'Simple Statements', duration: '8 min' },
                { id: 2, title: 'Asking Questions', duration: '10 min' },
                { id: 3, title: 'Daily Conversations', duration: '12 min' },
                { id: 4, title: 'Expressing Feelings', duration: '10 min' },
                { id: 5, title: 'Complex Sentences', duration: '15 min' }
            ]
        }
    ]

    // Language options
    const languages = [
        { id: 'english', name: 'English', flag: '🇺🇸', totalLessons: 15 },
        { id: 'hindi', name: 'Hindi', flag: '🇮🇳', totalLessons: 15 },
        { id: 'tamil', name: 'Tamil', flag: '🇮🇳', totalLessons: 15 },
        { id: 'telugu', name: 'Telugu', flag: '🇮🇳', totalLessons: 15 }
    ]

    // Generate lesson ID: language_section_lessonNumber
    const generateLessonId = (languageId, sectionId, lessonIndex) => {
        return `${languageId}_${sectionId}_${lessonIndex + 1}`
    }

    // Load progress from Supabase
    const loadProgress = useCallback(async () => {
        if (!user) return

        const progress = await getLessonProgress(user.id)
        const progressMap = {}

        progress.forEach(p => {
            progressMap[p.lesson_id] = {
                status: p.status,
                progress_percent: p.progress_percent
            }
        })

        setLessonProgress(progressMap)

        // Calculate progress per language
        const langProgress = {}
        languages.forEach(lang => {
            let completed = 0
            baseLessonSections.forEach(section => {
                section.lessons.forEach((_, lessonIndex) => {
                    const lessonId = generateLessonId(lang.id, section.id, lessonIndex)
                    if (progressMap[lessonId]?.status === 'completed') {
                        completed++
                    }
                })
            })
            langProgress[lang.id] = Math.round((completed / lang.totalLessons) * 100)
        })
        setLanguageProgress(langProgress)
    }, [user])

    // Load progress on mount
    useEffect(() => {
        loadProgress()
    }, [loadProgress])

    // Load accessibility settings
    useEffect(() => {
        const challenges = JSON.parse(localStorage.getItem('learningChallenges') || '[]')
        setAccessibilitySettings(prev => ({ ...prev, challenges }))
    }, [])

    // Get lesson status based on progress
    const getLessonStatus = (languageId, sectionId, lessonIndex) => {
        const lessonId = generateLessonId(languageId, sectionId, lessonIndex)
        const progress = lessonProgress[lessonId]

        if (progress?.status === 'completed') {
            return 'completed'
        }

        // First lesson in each section is always available
        if (lessonIndex === 0) {
            return progress?.status === 'in_progress' ? 'in_progress' : 'available'
        }

        // Check if previous lesson is completed
        const prevLessonId = generateLessonId(languageId, sectionId, lessonIndex - 1)
        const prevProgress = lessonProgress[prevLessonId]

        if (prevProgress?.status === 'completed') {
            return progress?.status === 'in_progress' ? 'in_progress' : 'available'
        }

        return 'locked'
    }

    // Get progress percent for a lesson
    const getLessonProgressPercent = (languageId, sectionId, lessonIndex) => {
        const lessonId = generateLessonId(languageId, sectionId, lessonIndex)
        return lessonProgress[lessonId]?.progress_percent || 0
    }

    // Handle lesson completion
    const handleLessonComplete = async (section, lesson, lessonIndex) => {
        if (!user || !selectedLanguage) return

        const lessonId = generateLessonId(selectedLanguage.id, section.id.toLowerCase(), lessonIndex)

        try {
            await markLessonComplete(user.id, lessonId)
            await loadProgress() // Reload progress
        } catch (error) {
            console.error('Error marking lesson complete:', error)
        }
    }

    // Handle closing lesson viewer
    const handleCloseLessonViewer = async () => {
        if (activeLesson && user && selectedLanguage) {
            // Find the lesson index
            const section = baseLessonSections.find(s => s.title === activeLesson.section)
            if (section) {
                const lessonIndex = section.lessons.findIndex(l => l.title === activeLesson.lesson.title)
                if (lessonIndex !== -1) {
                    await handleLessonComplete(section, activeLesson.lesson, lessonIndex)
                }
            }
        }
        setActiveLesson(null)
    }

    // Get accessibility class names
    const getAccessibilityClasses = () => {
        const classes = []
        const { challenges } = accessibilitySettings

        if (challenges.includes('dyslexia')) classes.push('dyslexia-friendly')
        if (challenges.includes('adhd')) classes.push('focus-mode')
        if (challenges.includes('visual')) classes.push('high-contrast')
        if (challenges.includes('motor')) classes.push('large-buttons')
        if (challenges.includes('memory')) classes.push('show-hints')

        return classes.join(' ')
    }

    // Get active adaptations
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
                            {languages.map((lang) => {
                                const progress = languageProgress[lang.id] || 0
                                return (
                                    <Card
                                        key={lang.id}
                                        className="language-card"
                                        onClick={() => setSelectedLanguage(lang)}
                                    >
                                        <div className="language-flag">{lang.flag}</div>
                                        <h3 className="language-name">{lang.name}</h3>
                                        <p className="language-info">{lang.totalLessons} lessons</p>
                                        <div className="language-progress">
                                            <div className="progress-bar">
                                                <div
                                                    className="progress-fill"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                            <span className="progress-text">{progress}% complete</span>
                                        </div>
                                        <Button variant="primary" className="start-language-btn">
                                            {progress > 0 ? 'Continue Learning' : 'Start Learning'}
                                            <ChevronRight size={18} />
                                        </Button>
                                    </Card>
                                )
                            })}
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
                            {baseLessonSections.map((section) => {
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
                                            {section.lessons.map((lesson, index) => {
                                                const status = getLessonStatus(selectedLanguage.id, section.id, index)
                                                const progressPercent = getLessonProgressPercent(selectedLanguage.id, section.id, index)

                                                return (
                                                    <Card
                                                        key={lesson.id}
                                                        className={`lesson-item ${status}`}
                                                    >
                                                        <div className="lesson-number">{index + 1}</div>
                                                        <div className="lesson-details">
                                                            <h4 className="lesson-title">{lesson.title}</h4>
                                                            <div className="lesson-meta">
                                                                <Clock size={14} />
                                                                <span>{lesson.duration}</span>
                                                                {progressPercent > 0 && progressPercent < 100 && (
                                                                    <span className="lesson-progress-inline">
                                                                        • {progressPercent}% done
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="lesson-actions">
                                                            {status === 'completed' && (
                                                                <>
                                                                    <CheckCircle2 className="status-icon completed" size={24} />
                                                                    <Button
                                                                        variant="secondary"
                                                                        className="repeat-lesson-btn"
                                                                        onClick={() => setActiveLesson({
                                                                            section: section.title,
                                                                            lesson,
                                                                            lessonIndex: index
                                                                        })}
                                                                    >
                                                                        Repeat
                                                                    </Button>
                                                                </>
                                                            )}
                                                            {status === 'locked' && (
                                                                <Lock className="status-icon locked" size={20} />
                                                            )}
                                                            {(status === 'available' || status === 'in_progress') && (
                                                                <>
                                                                    <button className="audio-btn" aria-label="Listen">
                                                                        <Volume2 size={18} />
                                                                    </button>
                                                                    <Button
                                                                        variant="primary"
                                                                        icon={Play}
                                                                        className="start-lesson-btn"
                                                                        onClick={() => setActiveLesson({
                                                                            section: section.title,
                                                                            lesson,
                                                                            lessonIndex: index
                                                                        })}
                                                                    >
                                                                        {status === 'in_progress' ? 'Resume' : 'Start'}
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </Card>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                )}
            </main>

            {/* Lesson Viewer Modal */}
            {activeLesson && selectedLanguage && (
                <LessonViewer
                    language={selectedLanguage}
                    section={activeLesson.section}
                    lessonTitle={activeLesson.lesson.title}
                    onClose={handleCloseLessonViewer}
                />
            )}
        </div>
    )
}

export default Lessons
