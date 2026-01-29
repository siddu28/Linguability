import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowLeft, Volume2, VolumeX, Check, Settings, Type, Palette, Clock } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { updateProfile, upsertUserSettings } from '../lib/database'
import Button from '../components/Button'
import './Onboarding.css'

function Onboarding() {
    const navigate = useNavigate()
    const { user, loading: authLoading } = useAuth()
    const [currentStep, setCurrentStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const [showOnboarding, setShowOnboarding] = useState(false)
    
    // Scores for each disability type
    const [scores, setScores] = useState({
        adhd: 0,
        dyslexia: 0,
        auditory: 0
    })
    
    // Store answers for each question
    const [answers, setAnswers] = useState({})
    
    // Detected challenges based on scores
    const [detectedChallenges, setDetectedChallenges] = useState([])
    
    // Demo lesson customization settings
    const [demoSettings, setDemoSettings] = useState({
        fontFamily: 'poppins',
        fontSize: 'medium',
        lineHeight: 'normal',
        letterSpacing: 'normal',
        backgroundColor: 'white',
        textToSpeech: false,
        showSubtitles: true,
        audioSpeed: 1,
        focusMode: false,
        highContrast: false
    })
    
    // Audio ref for demo
    const audioRef = useRef(null)
    const [isPlaying, setIsPlaying] = useState(false)

    // Question groups
    const questionGroups = [
        // Group 1: Focus Check (ADHD)
        {
            id: 'focus',
            title: 'Understanding Your Focus Style',
            subtitle: 'Help us understand how you prefer to learn',
            icon: '🎯',
            questions: [
                {
                    id: 'adhd_q1',
                    question: 'How long do you prefer to study in one sitting?',
                    options: [
                        { id: 'a', text: '3–5 minutes (Quick bursts)', score: { adhd: 1 } },
                        { id: 'b', text: '10–15 minutes (Standard)', score: {} },
                        { id: 'c', text: '30+ minutes (Deep focus)', score: {} }
                    ]
                },
                {
                    id: 'adhd_q2',
                    question: 'What is the hardest part about learning something new?',
                    options: [
                        { id: 'a', text: 'Getting started and staying focused', score: { adhd: 1 } },
                        { id: 'b', text: 'Understanding complex words', score: { dyslexia: 1 } },
                        { id: 'c', text: 'Remembering what I heard', score: { auditory: 1 } }
                    ]
                },
                {
                    id: 'adhd_q3',
                    question: 'How do you feel about timers and deadlines?',
                    options: [
                        { id: 'a', text: 'They make me anxious – I want them off', score: { adhd: 1 } },
                        { id: 'b', text: 'I like them – they keep me on track', score: {} },
                        { id: 'c', text: "I don't mind them", score: {} }
                    ]
                }
            ]
        },
        // Group 2: Visual Check (Dyslexia)
        {
            id: 'visual',
            title: 'Understanding Your Reading Style',
            subtitle: 'Help us make reading comfortable for you',
            icon: '📖',
            questions: [
                {
                    id: 'dyslexia_q1',
                    question: 'Which text style looks more comfortable to you?',
                    type: 'visual',
                    options: [
                        { 
                            id: 'a', 
                            text: 'Style A',
                            preview: { fontFamily: 'times', spacing: 'tight', bg: 'white' },
                            score: {} 
                        },
                        { 
                            id: 'b', 
                            text: 'Style B',
                            preview: { fontFamily: 'opendyslexic', spacing: 'wide', bg: 'cream' },
                            score: { dyslexia: 1 } 
                        }
                    ]
                },
                {
                    id: 'dyslexia_q2',
                    question: 'When you see a large block of text, what is your first reaction?',
                    options: [
                        { id: 'a', text: 'Let me read this carefully', score: {} },
                        { id: 'b', text: 'This looks exhausting/crowded', score: { dyslexia: 1 } },
                        { id: 'c', text: "I'll skim for keywords", score: {} }
                    ]
                },
                {
                    id: 'dyslexia_q3',
                    question: 'To learn a new word, what helps you most?',
                    options: [
                        { id: 'a', text: 'Seeing a picture of it', score: { dyslexia: 1 } },
                        { id: 'b', text: 'Reading the definition', score: {} },
                        { id: 'c', text: 'Hearing it used in a sentence', score: { auditory: 1 } }
                    ]
                }
            ]
        },
        // Group 3: Audio Check (Auditory Processing)
        {
            id: 'audio',
            title: 'Understanding Your Listening Style',
            subtitle: 'Help us optimize audio for you',
            icon: '🎧',
            questions: [
                {
                    id: 'apd_q1',
                    question: 'When you watch movies or YouTube, do you turn subtitles on?',
                    options: [
                        { id: 'a', text: 'Always – I struggle to follow without them', score: { auditory: 1 } },
                        { id: 'b', text: 'Sometimes', score: {} },
                        { id: 'c', text: 'Never – I prefer just listening', score: {} }
                    ]
                },
                {
                    id: 'apd_q2',
                    question: 'How do you handle it when someone speaks very fast?',
                    options: [
                        { id: 'a', text: 'I ask them to slow down or repeat it', score: { auditory: 1 } },
                        { id: 'b', text: 'I usually catch it', score: {} },
                        { id: 'c', text: 'I prefer fast talking', score: {} }
                    ]
                },
                {
                    id: 'apd_q3',
                    question: 'Does background music help you study?',
                    options: [
                        { id: 'a', text: 'No, it mixes with the voice and confuses me', score: { auditory: 1 } },
                        { id: 'b', text: 'Yes, it helps me focus', score: { adhd: 1 } },
                        { id: 'c', text: "It doesn't matter", score: {} }
                    ]
                }
            ]
        }
    ]

    // Demo content for each challenge type
    const demoContent = {
        adhd: {
            title: '🎯 Quick Learning Mode',
            subtitle: 'Short, engaging lessons designed for you',
            text: 'नमस्ते',
            pronunciation: 'Namaste',
            translation: 'Hello! (Respectful greeting)',
            tip: '✨ Tip: Lessons are kept under 3 minutes to help you stay focused!',
            features: ['3-minute micro-lessons', 'No timers or penalties', 'Gamified progress']
        },
        dyslexia: {
            title: '📖 Visual Learning Mode',
            subtitle: 'Image-first approach with comfortable reading',
            text: 'नमस्ते',
            pronunciation: 'Namaste',
            translation: 'Hello! (Respectful greeting)',
            tip: '✨ Tip: We use special fonts and spacing to make reading easier!',
            features: ['OpenDyslexic font option', 'High contrast images', 'Audio support']
        },
        auditory: {
            title: '🎧 Clear Audio Mode',
            subtitle: 'Enhanced audio with visual support',
            text: 'नमस्ते',
            pronunciation: 'Namaste',
            translation: 'Hello! (Respectful greeting)',
            tip: '✨ Tip: All audio comes with subtitles and adjustable speed!',
            features: ['Always-on subtitles', 'Adjustable audio speed', 'Visual cues']
        },
        default: {
            title: '🌟 Personalized Learning',
            subtitle: 'Customized just for you',
            text: 'नमस्ते',
            pronunciation: 'Namaste',
            translation: 'Hello! (Respectful greeting)',
            tip: '✨ Tip: You can customize your experience anytime in Settings!',
            features: ['Flexible lesson lengths', 'Multiple font options', 'Audio controls']
        }
    }

    // Steps: intro, questions (3 groups), demo
    const totalSteps = 1 + questionGroups.length + 1 // intro + 3 question groups + demo

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

    // Calculate detected challenges when scores change
    useEffect(() => {
        const challenges = []
        if (scores.adhd >= 2) challenges.push('adhd')
        if (scores.dyslexia >= 2) challenges.push('dyslexia')
        if (scores.auditory >= 2) challenges.push('auditory')
        setDetectedChallenges(challenges)
        
        // Auto-apply settings based on detected challenges - IMPORTANT
        const newSettings = {
            fontFamily: 'poppins',
            fontSize: 'medium',
            lineHeight: 'normal',
            letterSpacing: 'normal',
            backgroundColor: 'white',
            textToSpeech: false,
            showSubtitles: false,
            audioSpeed: 1,
            focusMode: false,
            highContrast: false
        }
        
        // Apply ADHD-friendly settings
        if (challenges.includes('adhd') || scores.adhd >= 2) {
            newSettings.focusMode = true
            newSettings.fontSize = 'large'
        }
        
        // Apply Dyslexia-friendly settings
        if (challenges.includes('dyslexia') || scores.dyslexia >= 2) {
            newSettings.fontFamily = 'opendyslexic'
            newSettings.lineHeight = 'relaxed'
            newSettings.letterSpacing = 'wide'
            newSettings.backgroundColor = 'cream'
            newSettings.fontSize = 'large'
        }
        
        // Apply Auditory Processing-friendly settings
        if (challenges.includes('auditory') || scores.auditory >= 2) {
            newSettings.showSubtitles = true
            newSettings.audioSpeed = 0.75
            newSettings.textToSpeech = true
        }
        
        setDemoSettings(newSettings)
    }, [scores])

    const handleAnswer = (questionId, option) => {
        // Check if already answered - if so, reverse the previous score
        const previousAnswer = answers[questionId]
        if (previousAnswer) {
            const prevOption = questionGroups
                .flatMap(g => g.questions)
                .find(q => q.id === questionId)
                ?.options.find(o => o.id === previousAnswer)
            
            if (prevOption?.score) {
                setScores(prev => {
                    const newScores = { ...prev }
                    Object.entries(prevOption.score).forEach(([key, value]) => {
                        newScores[key] = Math.max(0, (newScores[key] || 0) - value)
                    })
                    return newScores
                })
            }
        }
        
        // Store the new answer
        setAnswers(prev => ({ ...prev, [questionId]: option.id }))
        
        // Update scores with new answer
        if (option.score) {
            setScores(prev => {
                const newScores = { ...prev }
                Object.entries(option.score).forEach(([key, value]) => {
                    newScores[key] = (newScores[key] || 0) + value
                })
                return newScores
            })
        }
    }

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
                // Save learning challenges to profile
                await updateProfile(user.id, {
                    learning_challenges: detectedChallenges
                })
                
                // Save accessibility settings
                await upsertUserSettings(user.id, {
                    theme: demoSettings.backgroundColor === 'dark' ? 'dark' : 'light',
                    font_size: demoSettings.fontSize,
                    font_family: demoSettings.fontFamily,
                    line_height: demoSettings.lineHeight,
                    letter_spacing: demoSettings.letterSpacing,
                    focus_mode: demoSettings.focusMode,
                    text_to_speech: demoSettings.textToSpeech,
                    speech_rate: demoSettings.audioSpeed
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

    const speakText = (text) => {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel()
            
            const utterance = new SpeechSynthesisUtterance(text)
            utterance.rate = demoSettings.audioSpeed
            utterance.pitch = 1
            utterance.volume = 1
            
            // Try to find a Hindi voice, fallback to default
            const voices = window.speechSynthesis.getVoices()
            const hindiVoice = voices.find(v => v.lang.includes('hi')) || 
                              voices.find(v => v.lang.includes('en'))
            if (hindiVoice) {
                utterance.voice = hindiVoice
            }
            utterance.lang = 'hi-IN'
            
            setIsPlaying(true)
            utterance.onend = () => setIsPlaying(false)
            utterance.onerror = () => setIsPlaying(false)
            
            window.speechSynthesis.speak(utterance)
        } else {
            alert('Text-to-speech is not supported in your browser')
        }
    }

    const getPrimaryChallenge = () => {
        if (detectedChallenges.length === 0) return 'default'
        const maxScore = Math.max(scores.adhd, scores.dyslexia, scores.auditory)
        if (scores.adhd === maxScore && detectedChallenges.includes('adhd')) return 'adhd'
        if (scores.dyslexia === maxScore && detectedChallenges.includes('dyslexia')) return 'dyslexia'
        if (scores.auditory === maxScore && detectedChallenges.includes('auditory')) return 'auditory'
        return detectedChallenges[0] || 'default'
    }

    const getDemoFontStyle = () => {
        const fontFamilies = {
            poppins: '"Poppins", sans-serif',
            opendyslexic: '"OpenDyslexic", "Comic Sans MS", cursive, sans-serif',
            comic: '"Comic Sans MS", "Comic Sans", cursive, sans-serif',
            arial: 'Arial, Helvetica, sans-serif',
            verdana: 'Verdana, Geneva, sans-serif',
            georgia: 'Georgia, "Times New Roman", serif',
            lexend: '"Lexend", "Poppins", sans-serif',
            atkinson: '"Atkinson Hyperlegible", Arial, sans-serif'
        }
        
        const fontSizes = {
            small: '14px',
            medium: '16px',
            large: '20px',
            xlarge: '24px'
        }
        
        const lineHeights = {
            normal: '1.6',
            relaxed: '2',
            loose: '2.5'
        }
        
        const letterSpacings = {
            normal: 'normal',
            wide: '0.05em',
            wider: '0.1em',
            widest: '0.15em'
        }
        
        return {
            fontFamily: fontFamilies[demoSettings.fontFamily] || fontFamilies.poppins,
            fontSize: fontSizes[demoSettings.fontSize] || fontSizes.medium,
            lineHeight: lineHeights[demoSettings.lineHeight] || lineHeights.normal,
            letterSpacing: letterSpacings[demoSettings.letterSpacing] || letterSpacings.normal
        }
    }

    const getDemoBackgroundStyle = () => {
        switch (demoSettings.backgroundColor) {
            case 'cream': return '#FDF6E3'
            case 'light-blue': return '#E8F4FC'
            case 'light-green': return '#E8F5E9'
            case 'light-yellow': return '#FFFDE7'
            case 'dark': return '#1a1a2e'
            default: return '#ffffff'
        }
    }

    if (authLoading || !showOnboarding) {
        return (
            <div className="onboarding-page">
                <div className="onboarding-loading">Loading...</div>
            </div>
        )
    }

    // Check if current question group is complete
    const isCurrentGroupComplete = () => {
        if (currentStep === 0 || currentStep > questionGroups.length) return true
        const group = questionGroups[currentStep - 1]
        return group.questions.every(q => answers[q.id])
    }

    // Render intro step
    const renderIntro = () => (
        <div className="onboarding-intro">
            <div className="intro-icon">🎓</div>
            <h1 className="intro-title">Let's Personalize Your Learning</h1>
            <p className="intro-subtitle">
                Answer a few quick questions so we can customize your experience. 
                This takes about 2 minutes.
            </p>
            <div className="intro-features">
                <div className="intro-feature">
                    <span className="feature-icon">🎯</span>
                    <span>Discover your focus style</span>
                </div>
                <div className="intro-feature">
                    <span className="feature-icon">📖</span>
                    <span>Find your ideal reading format</span>
                </div>
                <div className="intro-feature">
                    <span className="feature-icon">🎧</span>
                    <span>Optimize audio settings</span>
                </div>
            </div>
            <div className="intro-actions">
                <Button variant="primary" size="large" onClick={handleNext}>
                    Get Started <ArrowRight size={18} />
                </Button>
                <button className="skip-btn" onClick={handleSkip}>
                    Skip for now
                </button>
            </div>
        </div>
    )

    // Render question group
    const renderQuestionGroup = (groupIndex) => {
        const group = questionGroups[groupIndex]

        return (
            <div className="question-group">
                <div className="group-header">
                    <span className="group-icon">{group.icon}</span>
                    <div>
                        <h2 className="group-title">{group.title}</h2>
                        <p className="group-subtitle">{group.subtitle}</p>
                    </div>
                </div>

                <div className="questions-container">
                    {group.questions.map((question, qIndex) => (
                        <div key={question.id} className="question-card">
                            <p className="question-number">Question {qIndex + 1} of {group.questions.length}</p>
                            <h3 className="question-text">{question.question}</h3>
                            
                            <div className={`options-list ${question.type === 'visual' ? 'visual-options' : ''}`}>
                                {question.options.map(option => (
                                    <label
                                        key={option.id}
                                        className={`option-item ${answers[question.id] === option.id ? 'selected' : ''} ${question.type === 'visual' ? 'visual-option' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name={question.id}
                                            checked={answers[question.id] === option.id}
                                            onChange={() => handleAnswer(question.id, option)}
                                        />
                                        {question.type === 'visual' ? (
                                            <div 
                                                className="visual-preview"
                                                style={{
                                                    fontFamily: option.preview.fontFamily === 'opendyslexic' 
                                                        ? '"OpenDyslexic", "Comic Sans MS", sans-serif' 
                                                        : 'Times New Roman',
                                                    letterSpacing: option.preview.spacing === 'wide' ? '0.1em' : 'normal',
                                                    lineHeight: option.preview.spacing === 'wide' ? '2' : '1.4',
                                                    backgroundColor: option.preview.bg === 'cream' ? '#FDF6E3' : '#fff'
                                                }}
                                            >
                                                <p>The quick brown fox jumps over the lazy dog.</p>
                                                <span className="preview-label">{option.text}</span>
                                            </div>
                                        ) : (
                                            <span className="option-text">{option.text}</span>
                                        )}
                                        {answers[question.id] === option.id && (
                                            <Check size={18} className="option-check" />
                                        )}
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="group-actions">
                    <button className="back-btn" onClick={handleBack}>
                        <ArrowLeft size={18} /> Back
                    </button>
                    <Button 
                        variant="primary" 
                        size="large" 
                        onClick={handleNext}
                        disabled={!isCurrentGroupComplete()}
                    >
                        Continue <ArrowRight size={18} />
                    </Button>
                </div>
            </div>
        )
    }

    // Render demo page
    const renderDemo = () => {
        const challenge = getPrimaryChallenge()
        const content = demoContent[challenge]
        const fontStyle = getDemoFontStyle()
        const bgColor = getDemoBackgroundStyle()
        const isDark = demoSettings.backgroundColor === 'dark'

        return (
            <div className="demo-page">
                <div className="demo-header">
                    <h1 className="demo-title">🎉 Your Personalized Experience</h1>
                    <p className="demo-subtitle">
                        Based on your answers, we've customized your learning environment. 
                        Try it out below and adjust any settings you'd like!
                    </p>
                    
                    {detectedChallenges.length > 0 && (
                        <div className="detected-badges">
                            {detectedChallenges.includes('adhd') && (
                                <span className="badge adhd">🎯 Focus Support Enabled</span>
                            )}
                            {detectedChallenges.includes('dyslexia') && (
                                <span className="badge dyslexia">📖 Reading Support Enabled</span>
                            )}
                            {detectedChallenges.includes('auditory') && (
                                <span className="badge auditory">🎧 Audio Support Enabled</span>
                            )}
                        </div>
                    )}
                </div>

                <div className="demo-content-wrapper">
                    {/* Demo Lesson Preview */}
                    <div 
                        className={`demo-lesson-card ${isDark ? 'dark-mode' : ''} ${demoSettings.focusMode ? 'focus-mode' : ''}`}
                        style={{ backgroundColor: bgColor }}
                    >
                        <div className="demo-lesson-header">
                            <h2 style={{ ...fontStyle, color: isDark ? '#fff' : '#1a1a2e' }}>{content.title}</h2>
                            <p className="demo-lesson-subtitle" style={{ ...fontStyle, color: isDark ? '#ccc' : '#666' }}>
                                {content.subtitle}
                            </p>
                        </div>

                        <div className="demo-lesson-content">
                            <div className="demo-word-card" style={{ backgroundColor: isDark ? '#2a2a4e' : '#fff' }}>
                                <div className="word-image">🙏</div>
                                <h3 
                                    className="word-text" 
                                    style={{ 
                                        ...fontStyle, 
                                        fontSize: demoSettings.fontSize === 'xlarge' ? '3rem' : '2.5rem',
                                        color: isDark ? '#fff' : '#1a1a2e'
                                    }}
                                >
                                    {content.text}
                                </h3>
                                <p 
                                    className="word-pronunciation" 
                                    style={{ ...fontStyle, color: isDark ? '#e91e63' : '#e91e63' }}
                                >
                                    {content.pronunciation}
                                </p>
                                <p 
                                    className="word-translation" 
                                    style={{ ...fontStyle, color: isDark ? '#aaa' : '#666' }}
                                >
                                    {content.translation}
                                </p>
                                
                                {demoSettings.showSubtitles && (
                                    <div className="demo-subtitle-bar">
                                        <span>🔊 "Nuh-muh-stay"</span>
                                    </div>
                                )}
                            </div>

                            <div className="demo-audio-controls">
                                <button 
                                    className={`audio-btn ${isPlaying ? 'playing' : ''}`} 
                                    onClick={() => speakText('नमस्ते')}
                                    disabled={isPlaying}
                                >
                                    {isPlaying ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                    <span>{isPlaying ? 'Playing...' : 'Listen'}</span>
                                </button>
                                <span className="speed-indicator">Speed: {demoSettings.audioSpeed}x</span>
                            </div>

                            <p className="demo-tip" style={{ ...fontStyle, color: isDark ? '#ccc' : '#666' }}>
                                {content.tip}
                            </p>
                        </div>

                        <div className="demo-features" style={{ color: isDark ? '#ccc' : '#333' }}>
                            <p className="features-title">✅ Enabled for you:</p>
                            <ul>
                                {content.features.map((feature, i) => (
                                    <li key={i} style={fontStyle}>
                                        <Check size={14} /> {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Customization Panel */}
                    <div className="customization-panel">
                        <div className="panel-header">
                            <Settings size={20} />
                            <h3>Customize Your Experience</h3>
                        </div>
                        <p className="panel-subtitle">Changes apply instantly to the demo</p>

                        <div className="settings-list">
                            <div className="setting-group">
                                <label className="setting-label">
                                    <Type size={16} />
                                    Font Style
                                </label>
                                <select 
                                    value={demoSettings.fontFamily}
                                    onChange={(e) => setDemoSettings(prev => ({ ...prev, fontFamily: e.target.value }))}
                                >
                                    <option value="poppins">Poppins (Default)</option>
                                    <option value="opendyslexic">OpenDyslexic (Dyslexia-friendly)</option>
                                    <option value="lexend">Lexend (Easy reading)</option>
                                    <option value="atkinson">Atkinson Hyperlegible</option>
                                    <option value="comic">Comic Sans</option>
                                    <option value="arial">Arial</option>
                                    <option value="verdana">Verdana</option>
                                    <option value="georgia">Georgia</option>
                                </select>
                            </div>

                            <div className="setting-group">
                                <label className="setting-label">Line Height</label>
                                <select 
                                    value={demoSettings.lineHeight}
                                    onChange={(e) => setDemoSettings(prev => ({ ...prev, lineHeight: e.target.value }))}
                                >
                                    <option value="normal">Normal (1.6)</option>
                                    <option value="relaxed">Relaxed (2.0)</option>
                                    <option value="loose">Loose (2.5)</option>
                                </select>
                            </div>

                            <div className="setting-group">
                                <label className="setting-label">
                                    <Palette size={16} />
                                    Background
                                </label>
                                <select 
                                    value={demoSettings.backgroundColor}
                                    onChange={(e) => setDemoSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                                >
                                    <option value="white">White</option>
                                    <option value="cream">Cream (Easy on eyes)</option>
                                    <option value="light-blue">Light Blue (Calming)</option>
                                    <option value="light-green">Light Green (Natural)</option>
                                    <option value="light-yellow">Light Yellow</option>
                                    <option value="dark">Dark Mode</option>
                                </select>
                            </div>

                            <div className="setting-group">
                                <label className="setting-label">
                                    <Type size={16} />
                                    Font Size
                                </label>
                                <select 
                                    value={demoSettings.fontSize}
                                    onChange={(e) => setDemoSettings(prev => ({ ...prev, fontSize: e.target.value }))}
                                >
                                    <option value="small">Small (14px)</option>
                                    <option value="medium">Medium (16px)</option>
                                    <option value="large">Large (20px)</option>
                                    <option value="xlarge">Extra Large (24px)</option>
                                </select>
                            </div>

                            <div className="setting-group">
                                <label className="setting-label">Letter Spacing</label>
                                <select 
                                    value={demoSettings.letterSpacing}
                                    onChange={(e) => setDemoSettings(prev => ({ ...prev, letterSpacing: e.target.value }))}
                                >
                                    <option value="normal">Normal</option>
                                    <option value="wide">Wide</option>
                                    <option value="wider">Wider</option>
                                    <option value="widest">Widest</option>
                                </select>
                            </div>

                            <div className="setting-group">
                                <label className="setting-label">
                                    <Clock size={16} />
                                    Audio Speed
                                </label>
                                <select 
                                    value={demoSettings.audioSpeed}
                                    onChange={(e) => setDemoSettings(prev => ({ ...prev, audioSpeed: parseFloat(e.target.value) }))}
                                >
                                    <option value="0.5">0.5x (Very Slow)</option>
                                    <option value="0.75">0.75x (Slow)</option>
                                    <option value="1">1x (Normal)</option>
                                    <option value="1.25">1.25x (Fast)</option>
                                    <option value="1.5">1.5x (Faster)</option>
                                </select>
                            </div>
                        </div>

                        <div className="toggle-settings">
                            <div className="toggle-setting">
                                <span className="toggle-label">Show Subtitles</span>
                                <button 
                                    className={`toggle-btn ${demoSettings.showSubtitles ? 'active' : ''}`}
                                    onClick={() => setDemoSettings(prev => ({ ...prev, showSubtitles: !prev.showSubtitles }))}
                                >
                                    {demoSettings.showSubtitles ? 'ON' : 'OFF'}
                                </button>
                            </div>

                            <div className="toggle-setting">
                                <span className="toggle-label">Focus Mode</span>
                                <button 
                                    className={`toggle-btn ${demoSettings.focusMode ? 'active' : ''}`}
                                    onClick={() => setDemoSettings(prev => ({ ...prev, focusMode: !prev.focusMode }))}
                                >
                                    {demoSettings.focusMode ? 'ON' : 'OFF'}
                                </button>
                            </div>

                            <div className="toggle-setting">
                                <span className="toggle-label">Text-to-Speech</span>
                                <button 
                                    className={`toggle-btn ${demoSettings.textToSpeech ? 'active' : ''}`}
                                    onClick={() => setDemoSettings(prev => ({ ...prev, textToSpeech: !prev.textToSpeech }))}
                                >
                                    {demoSettings.textToSpeech ? 'ON' : 'OFF'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="demo-actions">
                    <button className="back-btn" onClick={handleBack}>
                        <ArrowLeft size={18} /> Back
                    </button>
                    <Button 
                        variant="primary" 
                        size="large" 
                        onClick={handleComplete}
                        disabled={submitting}
                    >
                        {submitting ? 'Saving...' : 'Start Learning'} 
                        {!submitting && <ArrowRight size={18} />}
                    </Button>
                </div>

                <p className="demo-note">
                    💡 You can always change these settings later in your Profile
                </p>
            </div>
        )
    }

    // Determine what to render based on current step
    const renderCurrentStep = () => {
        if (currentStep === 0) {
            return renderIntro()
        } else if (currentStep <= questionGroups.length) {
            return renderQuestionGroup(currentStep - 1)
        } else {
            return renderDemo()
        }
    }

    return (
        <div className="onboarding-page">
            <div className="onboarding-container">
                {/* Progress bar */}
                <div className="progress-bar-container">
                    <div className="progress-bar">
                        <div 
                            className="progress-fill" 
                            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                        />
                    </div>
                    <span className="progress-text">
                        Step {currentStep + 1} of {totalSteps}
                    </span>
                </div>

                {/* Header */}
                <div className="onboarding-header">
                    <div className="brand-logo">
                        <span>LA</span>
                    </div>
                    <span className="brand-name">LinguaAccess</span>
                </div>

                {/* Content */}
                <div className="onboarding-content">
                    {renderCurrentStep()}
                </div>
            </div>
        </div>
    )
}

export default Onboarding
