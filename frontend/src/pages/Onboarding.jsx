import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { updateProfile, upsertUserSettings } from '../lib/database'
import './Onboarding.css'

// Custom SVG Icons - Unique designs, not generic
const icons = {
    // Goal icons
    travel: (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="24" cy="24" r="18" />
            <ellipse cx="24" cy="24" rx="8" ry="18" />
            <path d="M6 24h36" />
            <path d="M24 6c5 4 8 10 8 18s-3 14-8 18" />
            <path d="M24 6c-5 4-8 10-8 18s3 14 8 18" />
        </svg>
    ),
    career: (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M24 6v28" />
            <path d="M16 14l8-8 8 8" />
            <path d="M12 42h24" />
            <path d="M8 34l16-8 16 8" />
            <circle cx="24" cy="18" r="4" />
        </svg>
    ),
    academic: (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 12h24c2 0 4 2 4 4v20c0 2-2 4-4 4H8" />
            <path d="M8 8v32" />
            <path d="M14 20h16" />
            <path d="M14 28h12" />
            <path d="M14 36h8" />
        </svg>
    ),
    personal: (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M24 42s-14-8-14-18c0-6 4-10 10-10 4 0 7 3 8 5 1-2 4-5 8-5 6 0 10 4 10 10 0 10-14 18-14 18z" />
            <path d="M30 8l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1z" />
        </svg>
    ),
    // Level icons
    beginner: (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M24 6l4 8 9 1-6 6 2 9-9-4-9 4 2-9-6-6 9-1z" strokeDasharray="4 2" />
            <circle cx="24" cy="24" r="4" fill="currentColor" opacity="0.3" />
        </svg>
    ),
    basics: (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="24" cy="20" r="12" />
            <path d="M18 38c0-4 2-6 6-8" />
            <path d="M30 38c0-4-2-6-6-8" />
            <path d="M20 18c0-2 2-4 4-4s4 2 4 4c0 2-2 3-4 4v3" />
            <circle cx="24" cy="28" r="1" fill="currentColor" />
        </svg>
    ),
    intermediate: (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="20" r="10" />
            <circle cx="30" cy="28" r="10" />
            <path d="M14 16h8M14 22h6" />
            <path d="M26 24h8M26 30h6" />
        </svg>
    ),
    advanced: (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="24" cy="16" r="10" />
            <path d="M16 26l-4 16h24l-4-16" />
            <path d="M20 34h8" />
            <path d="M22 38h4" />
            <path d="M24 10v6M20 13h8" />
        </svg>
    ),
    // Time icons
    time5: (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="24" cy="24" r="18" />
            <path d="M24 12v12l4 4" />
        </svg>
    ),
    time15: (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="24" cy="24" r="18" />
            <path d="M24 12v12l8 4" />
            <circle cx="24" cy="8" r="1.5" fill="currentColor" />
            <circle cx="40" cy="24" r="1.5" fill="currentColor" />
        </svg>
    ),
    time30: (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="24" cy="24" r="18" />
            <path d="M24 12v12h10" />
            <circle cx="24" cy="8" r="1.5" fill="currentColor" />
            <circle cx="40" cy="24" r="1.5" fill="currentColor" />
            <circle cx="24" cy="40" r="1.5" fill="currentColor" />
            <circle cx="8" cy="24" r="1.5" fill="currentColor" />
        </svg>
    ),
    time60: (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="24" cy="24" r="18" />
            <path d="M24 12v12" />
            <path d="M24 24l8 8" />
            <circle cx="24" cy="8" r="2" fill="currentColor" />
            <circle cx="40" cy="24" r="2" fill="currentColor" />
            <circle cx="24" cy="40" r="2" fill="currentColor" />
            <circle cx="8" cy="24" r="2" fill="currentColor" />
            <circle cx="34" cy="10" r="1.5" fill="currentColor" />
            <circle cx="38" cy="14" r="1.5" fill="currentColor" />
            <circle cx="38" cy="34" r="1.5" fill="currentColor" />
            <circle cx="34" cy="38" r="1.5" fill="currentColor" />
        </svg>
    ),
    // Preference icons
    audio: (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 18v12c0 2 2 4 4 4h2l10 6V8l-10 6h-2c-2 0-4 2-4 4z" />
            <path d="M32 16c2 2 3 5 3 8s-1 6-3 8" />
            <path d="M36 12c4 4 6 8 6 12s-2 8-6 12" />
        </svg>
    ),
    visual: (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 24s8-14 20-14 20 14 20 14-8 14-20 14S4 24 4 24z" />
            <circle cx="24" cy="24" r="6" />
            <circle cx="24" cy="24" r="2" fill="currentColor" />
            <path d="M30 14l2-4M34 16l4-2" />
        </svg>
    ),
    dyslexia: (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="8" y="6" width="32" height="36" rx="2" />
            <path d="M14 14h20" />
            <path d="M14 22h16" />
            <path d="M14 30h12" />
            <path d="M14 38h8" />
            <path d="M36 22c2 0 4 2 4 4v8c0 2-2 4-4 4" />
        </svg>
    ),
    tts: (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="6" y="8" width="24" height="32" rx="2" />
            <path d="M12 16h12M12 24h10M12 32h8" />
            <path d="M34 20v8l8 4V16z" />
            <path d="M34 24c4 0 8-2 8-4M34 24c4 0 8 2 8 4" />
        </svg>
    ),
    // UI icons
    check: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
        </svg>
    ),
    arrowLeft: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
    ),
    arrowRight: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
    ),
    speaker: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
    )
}

// Step configurations
const STEPS = {
    WELCOME: 0,
    GOAL: 1,
    LEVEL: 2,
    TIME: 3,
    PREFERENCES: 4,
    PERSONALIZE: 5
}

const goalOptions = [
    { id: 'travel', title: 'Travel & Explore', subtitle: 'Communicate while abroad', icon: icons.travel },
    { id: 'career', title: 'Career Growth', subtitle: 'Professional development', icon: icons.career },
    { id: 'academic', title: 'Academic Study', subtitle: 'School or university', icon: icons.academic },
    { id: 'personal', title: 'Personal Interest', subtitle: 'Just for fun', icon: icons.personal }
]

const levelOptions = [
    { id: 'beginner', title: 'Complete Beginner', subtitle: 'Starting from scratch', icon: icons.beginner },
    { id: 'basics', title: 'Know the Basics', subtitle: 'Can say simple phrases', icon: icons.basics },
    { id: 'intermediate', title: 'Intermediate', subtitle: 'Can hold conversations', icon: icons.intermediate },
    { id: 'advanced', title: 'Advanced', subtitle: 'Looking to master it', icon: icons.advanced }
]

const timeOptions = [
    { id: 5, title: '5 minutes/day', subtitle: 'Quick daily practice', icon: icons.time5 },
    { id: 15, title: '15 minutes/day', subtitle: 'Steady progress', icon: icons.time15 },
    { id: 30, title: '30 minutes/day', subtitle: 'Committed learner', icon: icons.time30 },
    { id: 60, title: '60+ minutes/day', subtitle: 'Intensive learning', icon: icons.time60 }
]

const preferenceOptions = [
    { id: 'audio', title: 'Listen & Learn', subtitle: 'I absorb more through audio', icon: icons.audio },
    { id: 'visual', title: 'See It to Learn It', subtitle: 'Images & visuals help me focus', icon: icons.visual },
    { id: 'dyslexia', title: 'Reading Comfort', subtitle: 'Easier-to-read fonts & spacing', icon: icons.dyslexia },
    { id: 'tts', title: 'Read Aloud', subtitle: 'Hear the content spoken to me', icon: icons.tts }
]

function Onboarding() {
    const navigate = useNavigate()
    const { user, loading: authLoading } = useAuth()
    const [currentStep, setCurrentStep] = useState(STEPS.WELCOME)
    const [submitting, setSubmitting] = useState(false)
    const [showOnboarding, setShowOnboarding] = useState(false)

    // User selections
    const [selections, setSelections] = useState({
        goal: null,
        level: null,
        dailyTime: null,
        preferences: []
    })

    // Settings for personalized experience (Step 6)
    const [settings, setSettings] = useState({
        focusMode: false,
        textSize: 'medium', // small, medium, large, extra-large
        lineSpacing: 'normal', // compact, normal, relaxed, spacious
        highContrast: false
    })

    const totalSteps = 6
    const progress = ((currentStep + 1) / totalSteps) * 100

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login')
            return
        }

        if (user) {
            const onboardingCompleted = user.user_metadata?.onboarding_completed
            if (onboardingCompleted === true) {
                navigate('/dashboard')
            } else {
                setShowOnboarding(true)
            }
        }
    }, [user, authLoading, navigate])

    // Auto-enable settings based on preferences
    useEffect(() => {
        const prefs = selections.preferences
        setSettings(prev => ({
            ...prev,
            focusMode: prefs.includes('dyslexia') || prefs.includes('audio'),
            textSize: prefs.includes('dyslexia') || prefs.includes('visual') ? 'large' : 'medium',
            lineSpacing: prefs.includes('dyslexia') ? 'spacious' : 'normal'
        }))
    }, [selections.preferences])

    const handleNext = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(prev => prev + 1)
        }
    }

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1)
        }
    }

    const handleSkip = async () => {
        setSubmitting(true)
        try {
            await supabase.auth.updateUser({
                data: { onboarding_completed: true }
            })
        } catch (err) {
            console.error('Failed to mark onboarding complete:', err)
        }
        navigate('/dashboard')
    }

    const handleComplete = async () => {
        setSubmitting(true)
        try {
            await supabase.auth.updateUser({
                data: { onboarding_completed: true }
            })

            if (user?.id) {
                // Determine learning challenges based on preferences
                const learningChallenges = []
                if (selections.preferences.includes('dyslexia')) learningChallenges.push('dyslexia')
                if (selections.preferences.includes('audio')) learningChallenges.push('auditory')

                await updateProfile(user.id, {
                    learning_challenges: learningChallenges,
                    learning_goal: selections.goal,
                    experience_level: selections.level,
                    daily_goal_minutes: selections.dailyTime
                })

                await upsertUserSettings(user.id, {
                    focus_mode: settings.focusMode,
                    font_size: settings.textSize,
                    line_spacing: settings.lineSpacing,
                    font_family: selections.preferences.includes('dyslexia') ? 'opendyslexic' : 'poppins',
                    text_to_speech: selections.preferences.includes('tts'),
                    high_contrast: settings.highContrast
                })
            }

            navigate('/dashboard')
        } catch (err) {
            console.error('Failed to save preferences:', err)
            navigate('/dashboard')
        } finally {
            setSubmitting(false)
        }
    }

    const handleSelectGoal = (id) => {
        setSelections(prev => ({ ...prev, goal: id }))
    }

    const handleSelectLevel = (id) => {
        setSelections(prev => ({ ...prev, level: id }))
    }

    const handleSelectTime = (id) => {
        setSelections(prev => ({ ...prev, dailyTime: id }))
    }

    const handleTogglePreference = (id) => {
        setSelections(prev => ({
            ...prev,
            preferences: prev.preferences.includes(id)
                ? prev.preferences.filter(p => p !== id)
                : [...prev.preferences, id]
        }))
    }

    const toggleSetting = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }))
    }

    // Use Hindi TTS which has universal browser support
    const speakText = (text) => {
        if (!('speechSynthesis' in window)) {
            console.log('Speech synthesis not supported')
            return
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.85
        utterance.pitch = 1

        // Get voices and find English voice
        const voices = window.speechSynthesis.getVoices()
        const englishVoice = voices.find(v => v.lang.startsWith('en'))

        if (englishVoice) {
            utterance.voice = englishVoice
        }
        utterance.lang = 'en-US'

        window.speechSynthesis.speak(utterance)
    }

    // Ensure voices are loaded (Chrome loads them async)
    useEffect(() => {
        if ('speechSynthesis' in window) {
            // Force load voices
            window.speechSynthesis.getVoices()
            window.speechSynthesis.addEventListener('voiceschanged', () => {
                window.speechSynthesis.getVoices()
            })
        }
    }, [])

    const canContinue = () => {
        switch (currentStep) {
            case STEPS.WELCOME: return true
            case STEPS.GOAL: return selections.goal !== null
            case STEPS.LEVEL: return selections.level !== null
            case STEPS.TIME: return selections.dailyTime !== null
            case STEPS.PREFERENCES: return true // Multi-select, can skip
            case STEPS.PERSONALIZE: return true
            default: return false
        }
    }

    if (authLoading || !showOnboarding) {
        return (
            <div className="onboarding-page">
                <div className="onboarding-loading">Loading...</div>
            </div>
        )
    }

    // Render Welcome Step
    const renderWelcome = () => (
        <div className="ob-welcome">
            <div className="ob-welcome-icon">🎓</div>
            <h1 className="ob-welcome-title">Let's Personalize Your Learning</h1>
            <p className="ob-welcome-subtitle">
                Answer a few quick questions so we can customize your experience.
                This takes about 2 minutes.
            </p>
            <div className="ob-welcome-features">
                <div className="ob-feature">
                    <span className="ob-feature-emoji">🎯</span>
                    <span>Discover your learning style</span>
                </div>
                <div className="ob-feature">
                    <span className="ob-feature-emoji">📖</span>
                    <span>Find your ideal pace</span>
                </div>
                <div className="ob-feature">
                    <span className="ob-feature-emoji">✨</span>
                    <span>Get personalized settings</span>
                </div>
            </div>
            <button className="ob-primary-btn" onClick={handleNext}>
                Get Started <span className="ob-btn-icon">{icons.arrowRight}</span>
            </button>
        </div>
    )

    // Render Card Selection Step
    const renderCardStep = (title, subtitle, options, selectedValue, onSelect, isMulti = false) => (
        <div className="ob-step">
            <div className="ob-step-header">
                <h1 className="ob-step-title">{title}</h1>
                <p className="ob-step-subtitle">{subtitle}</p>
            </div>
            <div className="ob-cards-grid">
                {options.map(option => {
                    const isSelected = isMulti
                        ? selections.preferences.includes(option.id)
                        : selectedValue === option.id

                    return (
                        <button
                            key={option.id}
                            className={`ob-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => onSelect(option.id)}
                        >
                            {isSelected && (
                                <span className="ob-card-check">{icons.check}</span>
                            )}
                            <span className="ob-card-icon">{option.icon}</span>
                            <span className="ob-card-title">{option.title}</span>
                            <span className="ob-card-subtitle">{option.subtitle}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    )

    // Render Personalized Experience Step
    const renderPersonalize = () => {
        const textSizeMap = { 'small': '0.875rem', 'medium': '1rem', 'large': '1.25rem', 'extra-large': '1.5rem' }
        const lineSpacingMap = { 'compact': '1.4', 'normal': '1.6', 'relaxed': '1.8', 'spacious': '2.2' }

        const getLessonStyle = () => ({
            fontSize: textSizeMap[settings.textSize] || '1rem',
            letterSpacing: selections.preferences.includes('dyslexia') ? '0.05em' : 'normal',
            lineHeight: lineSpacingMap[settings.lineSpacing] || '1.6',
            fontFamily: selections.preferences.includes('dyslexia')
                ? '"OpenDyslexic", "Comic Sans MS", sans-serif'
                : '"Poppins", sans-serif'
        })

        const getPreviewClass = () => {
            let classes = 'ob-lesson-preview'
            if (settings.focusMode) classes += ' focus-mode'
            if (settings.highContrast) classes += ' high-contrast'
            return classes
        }

        return (
            <div className="ob-personalize">
                <div className="ob-step-header">
                    <h1 className="ob-step-title">Your Personalized Experience</h1>
                    <p className="ob-step-subtitle">Here's a preview of your customized learning path</p>
                </div>

                <div className="ob-personalize-content">
                    {/* Lesson Preview */}
                    <div className={getPreviewClass()}>
                        {settings.focusMode && (
                            <span className="ob-preview-badge">✨ Focus Support Enabled</span>
                        )}
                        <h3 className="ob-preview-title">Lesson Preview</h3>
                        <p className="ob-preview-desc">Here's what your lessons will look like:</p>

                        <div className="ob-preview-lesson" style={getLessonStyle()}>
                            <div className="ob-lesson-header-card">
                                <span className="ob-lesson-icon">{icons.basics}</span>
                                <div>
                                    <span className="ob-lesson-name">Greetings</span>
                                    <span className="ob-lesson-meta">Learn basic phrases</span>
                                </div>
                            </div>
                            <div className="ob-lesson-word">
                                <span className="ob-word-target" style={getLessonStyle()}>Hello, how are you?</span>
                                <span className="ob-word-translation">A common greeting</span>
                            </div>
                            <button
                                className="ob-listen-btn"
                                onClick={() => speakText('Hello, how are you?')}
                            >
                                <span className="ob-listen-icon">{icons.speaker}</span>
                                Listen to pronunciation
                            </button>
                        </div>
                    </div>

                    {/* Settings Panel */}
                    <div className="ob-settings-panel">
                        <h3 className="ob-settings-title">Your Settings</h3>
                        <p className="ob-settings-desc">Customize your experience anytime</p>

                        <div className="ob-settings-list">
                            {/* Focus Mode Toggle */}
                            <div className="ob-setting-row">
                                <div className="ob-setting-info">
                                    <span className="ob-setting-name">Focus Mode</span>
                                    <span className="ob-setting-desc">Reduce distractions</span>
                                </div>
                                <button
                                    className={`ob-toggle ${settings.focusMode ? 'active' : ''}`}
                                    onClick={() => toggleSetting('focusMode')}
                                >
                                    <span className="ob-toggle-knob"></span>
                                </button>
                            </div>

                            {/* Text Size Selector */}
                            <div className="ob-setting-row ob-setting-column">
                                <div className="ob-setting-info">
                                    <span className="ob-setting-name">Text Size</span>
                                    <span className="ob-setting-desc">Choose your preferred reading size</span>
                                </div>
                                <div className="ob-option-buttons">
                                    {['small', 'medium', 'large', 'extra-large'].map(size => (
                                        <button
                                            key={size}
                                            className={`ob-option-btn ${settings.textSize === size ? 'active' : ''}`}
                                            onClick={() => setSettings(prev => ({ ...prev, textSize: size }))}
                                        >
                                            {size === 'extra-large' ? 'XL' : size.charAt(0).toUpperCase() + size.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Line Spacing Selector */}
                            <div className="ob-setting-row ob-setting-column">
                                <div className="ob-setting-info">
                                    <span className="ob-setting-name">Line Spacing</span>
                                    <span className="ob-setting-desc">Adjust space between lines</span>
                                </div>
                                <div className="ob-option-buttons">
                                    {['compact', 'normal', 'relaxed', 'spacious'].map(spacing => (
                                        <button
                                            key={spacing}
                                            className={`ob-option-btn ${settings.lineSpacing === spacing ? 'active' : ''}`}
                                            onClick={() => setSettings(prev => ({ ...prev, lineSpacing: spacing }))}
                                        >
                                            {spacing.charAt(0).toUpperCase() + spacing.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* High Contrast Toggle */}
                            <div className="ob-setting-row">
                                <div className="ob-setting-info">
                                    <span className="ob-setting-name">High Contrast</span>
                                    <span className="ob-setting-desc">Better visibility</span>
                                </div>
                                <button
                                    className={`ob-toggle ${settings.highContrast ? 'active' : ''}`}
                                    onClick={() => toggleSetting('highContrast')}
                                >
                                    <span className="ob-toggle-knob"></span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Render current step content
    const renderStep = () => {
        switch (currentStep) {
            case STEPS.WELCOME:
                return renderWelcome()
            case STEPS.GOAL:
                return renderCardStep(
                    "What's your main goal?",
                    "This helps us tailor your learning path",
                    goalOptions,
                    selections.goal,
                    handleSelectGoal
                )
            case STEPS.LEVEL:
                return renderCardStep(
                    "What's your experience level?",
                    "We'll start you at the right level",
                    levelOptions,
                    selections.level,
                    handleSelectLevel
                )
            case STEPS.TIME:
                return renderCardStep(
                    "How much time can you dedicate?",
                    "We'll create a schedule that works for you",
                    timeOptions,
                    selections.dailyTime,
                    handleSelectTime
                )
            case STEPS.PREFERENCES:
                return renderCardStep(
                    "Any learning preferences?",
                    "Select all that apply to customize your experience",
                    preferenceOptions,
                    null,
                    handleTogglePreference,
                    true
                )
            case STEPS.PERSONALIZE:
                return renderPersonalize()
            default:
                return null
        }
    }

    return (
        <div className="onboarding-page">
            <div className="ob-container">
                {/* Header with progress */}
                <header className="ob-header">
                    <div className="ob-brand">
                        <div className="ob-logo">
                            <span>L</span>
                        </div>
                    </div>

                    <div className="ob-progress">
                        <span className="ob-progress-text">Step {currentStep + 1} of {totalSteps}</span>
                        <div className="ob-progress-bar">
                            <div
                                className="ob-progress-fill"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="ob-progress-percent">{Math.round(progress)}%</span>
                    </div>

                    <button className="ob-skip-btn" onClick={handleSkip} disabled={submitting}>
                        Skip
                    </button>
                </header>

                {/* Main content */}
                <main className="ob-main">
                    {renderStep()}
                </main>

                {/* Footer navigation */}
                {currentStep > STEPS.WELCOME && (
                    <footer className="ob-footer">
                        <button className="ob-back-btn" onClick={handleBack}>
                            <span className="ob-btn-icon">{icons.arrowLeft}</span>
                            Back
                        </button>

                        {currentStep === STEPS.PERSONALIZE ? (
                            <button
                                className="ob-primary-btn"
                                onClick={handleComplete}
                                disabled={submitting}
                            >
                                {submitting ? 'Saving...' : 'Get Started'}
                                {!submitting && <span className="ob-btn-icon">{icons.arrowRight}</span>}
                            </button>
                        ) : (
                            <button
                                className="ob-primary-btn"
                                onClick={handleNext}
                                disabled={!canContinue()}
                            >
                                Continue
                                <span className="ob-btn-icon">{icons.arrowRight}</span>
                            </button>
                        )}
                    </footer>
                )}
            </div>
        </div>
    )
}

export default Onboarding
