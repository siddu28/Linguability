import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Settings,
    Volume2,
    Monitor,
    Users,
    ArrowRight,
    ArrowLeft,
    Check
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import Input from '../components/Input'
import Button from '../components/Button'
import './Login.css'

function Login() {
    const navigate = useNavigate()
    const { user, loading: authLoading } = useAuth()
    const [isSignUp, setIsSignUp] = useState(false)
    const [signupStep, setSignupStep] = useState(1) // 1: form, 2: challenges
    const [submitting, setSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: ''
    })
    const [selectedChallenges, setSelectedChallenges] = useState([])

    const learningChallenges = [
        {
            id: 'dyslexia',
            label: 'Dyslexia',
            description: 'Difficulty with reading, spelling, or writing',
            suggestedFeatures: ['OpenDyslexic font', 'Increased spacing', 'Text-to-speech']
        },
        {
            id: 'adhd',
            label: 'ADHD',
            description: 'Attention and focus challenges',
            suggestedFeatures: ['Focus mode', 'Shorter lessons', 'Reduced animations']
        },
        {
            id: 'auditory',
            label: 'Auditory Processing',
            description: 'Difficulty processing spoken information',
            suggestedFeatures: ['Captions', 'Visual cues', 'Written instructions']
        },
        {
            id: 'visual',
            label: 'Visual Processing',
            description: 'Difficulty processing visual information',
            suggestedFeatures: ['High contrast', 'Larger text', 'Audio descriptions']
        },
        {
            id: 'motor',
            label: 'Motor Difficulties',
            description: 'Challenges with fine motor skills',
            suggestedFeatures: ['Keyboard navigation', 'Larger buttons', 'Voice input']
        },
        {
            id: 'memory',
            label: 'Memory Challenges',
            description: 'Difficulty retaining information',
            suggestedFeatures: ['Frequent reviews', 'Spaced repetition', 'Visual aids']
        }
    ]

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleChallengeToggle = (challengeId) => {
        setSelectedChallenges(prev =>
            prev.includes(challengeId)
                ? prev.filter(id => id !== challengeId)
                : [...prev, challengeId]
        )
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setErrorMessage('')

        if (isSignUp) {
            // Move to challenges selection step
            setSignupStep(2)
        } else {
            // Sign in with Supabase
            async function run() {
                setSubmitting(true)
                try {
                    const { data, error } = await supabase.auth.signInWithPassword({
                        email: formData.email,
                        password: formData.password,
                    })
                    if (error) throw error
                    if (data?.session) navigate('/dashboard')
                } catch (err) {
                    setErrorMessage(err?.message || 'Authentication failed')
                } finally {
                    setSubmitting(false)
                }
            }
            run()
        }
    }

    const handleCompleteSignup = async () => {
        setErrorMessage('')
        setSubmitting(true)
        try {
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        learning_challenges: selectedChallenges,
                    },
                },
            })
            if (error) throw error

            // Save challenges to localStorage as backup
            localStorage.setItem('learningChallenges', JSON.stringify(selectedChallenges))

            // If email confirmation is enabled, session may be null.
            if (data?.session) {
                navigate('/dashboard')
            } else {
                setErrorMessage('Check your email to confirm your account, then sign in.')
                setSignupStep(1)
                setIsSignUp(false)
            }
        } catch (err) {
            setErrorMessage(err?.message || 'Sign up failed')
        } finally {
            setSubmitting(false)
        }
    }

    const handleSkipChallenges = () => {
        handleCompleteSignup()
    }

    const handleGoogleSignIn = async () => {
        setErrorMessage('')
        setSubmitting(true)
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/dashboard`,
                },
            })
            if (error) throw error
        } catch (err) {
            setErrorMessage(err?.message || 'Google sign-in failed')
            setSubmitting(false)
        }
    }

    const features = [
        { icon: Settings, text: 'Accessibility-first design' },
        { icon: Volume2, text: 'Multi-modal learning' },
        { icon: Monitor, text: 'AI-powered coaching' },
        { icon: Users, text: 'Collaborative study rooms' },
    ]

    return (
        <div className="login-page">
            {/* Left Panel - Branding */}
            <div className="login-brand">
                <div className="brand-header">
                    <div className="brand-logo">
                        <span>LA</span>
                    </div>
                    <span className="brand-name">LinguaAccess</span>
                </div>

                <div className="brand-content">
                    <h1 className="brand-title">
                        Language learning<br />
                        designed for everyone
                    </h1>
                    <p className="brand-description">
                        An accessible platform supporting learners with
                        cognitive, linguistic, and sensory learning needs.
                    </p>

                    <div className="brand-features">
                        {features.map(({ icon: Icon, text }, index) => (
                            <div key={index} className="feature-item">
                                <Icon size={18} />
                                <span>{text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="brand-footer">
                    Supporting Hindi, Tamil, and English
                </p>
            </div>

            {/* Right Panel - Form */}
            <div className="login-form-container">
                <div className="login-form-wrapper">
                    {/* Step 1: Login/Signup Form */}
                    {(!isSignUp || signupStep === 1) && (
                        <>
                            <h2 className="form-title">Welcome to LinguaAccess</h2>
                            <p className="form-subtitle">Sign in to continue your learning journey</p>

                            {/* Tab Switcher */}
                            <div className="form-tabs">
                                <button
                                    className={`form-tab ${!isSignUp ? 'active' : ''}`}
                                    onClick={() => { setIsSignUp(false); setSignupStep(1); }}
                                >
                                    Sign In
                                </button>
                                <button
                                    className={`form-tab ${isSignUp ? 'active' : ''}`}
                                    onClick={() => setIsSignUp(true)}
                                >
                                    Sign Up
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="login-form">
                                {isSignUp && (
                                    <Input
                                        label="Full Name"
                                        id="fullName"
                                        name="fullName"
                                        placeholder="Enter your full name"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                    />
                                )}

                                <Input
                                    label="Email"
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />

                                <Input
                                    label="Password"
                                    type="password"
                                    id="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />

                                <Button type="submit" variant="primary" size="large" className="submit-btn" disabled={authLoading || submitting}>
                                    {(authLoading || submitting) ? 'Please wait…' : (isSignUp ? 'Continue' : 'Sign In')}
                                    {isSignUp && !submitting && <ArrowRight size={18} />}
                                </Button>
                            </form>

                            {errorMessage && (
                                <p className="form-error" role="alert">
                                    {errorMessage}
                                </p>
                            )}

                            {/* Divider */}
                            <div className="auth-divider">
                                <span>or</span>
                            </div>

                            {/* Google Sign In */}
                            <button className="google-signin-btn" type="button" onClick={handleGoogleSignIn} disabled={authLoading || submitting}>
                                <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span>Continue with Google</span>
                            </button>

                            <p className="form-footer">
                                By continuing, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                            </p>
                        </>
                    )}

                    {/* Step 2: Learning Challenges Selection */}
                    {isSignUp && signupStep === 2 && (
                        <div className="challenges-step">
                            <button className="back-btn" onClick={() => setSignupStep(1)}>
                                <ArrowLeft size={18} />
                                Back
                            </button>

                            <h2 className="form-title">Personalize Your Experience</h2>
                            <p className="form-subtitle">
                                Select any learning challenges you'd like support with (optional)
                            </p>

                            <div className="challenges-list">
                                {learningChallenges.map((challenge) => (
                                    <label
                                        key={challenge.id}
                                        className={`challenge-item ${selectedChallenges.includes(challenge.id) ? 'selected' : ''}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedChallenges.includes(challenge.id)}
                                            onChange={() => handleChallengeToggle(challenge.id)}
                                            className="challenge-checkbox"
                                        />
                                        <div className="challenge-content">
                                            <div className="challenge-header">
                                                <span className="challenge-label">{challenge.label}</span>
                                                {selectedChallenges.includes(challenge.id) && (
                                                    <Check size={16} className="challenge-check" />
                                                )}
                                            </div>
                                            <p className="challenge-description">{challenge.description}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            {errorMessage && (
                                <p className="form-error" role="alert">
                                    {errorMessage}
                                </p>
                            )}

                            <div className="challenges-actions">
                                <Button
                                    variant="primary"
                                    size="large"
                                    className="submit-btn"
                                    onClick={handleCompleteSignup}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Creating account…' : (selectedChallenges.length > 0 ? 'Continue with Selected' : 'Get Started')}
                                    {!submitting && <ArrowRight size={18} />}
                                </Button>
                                <button className="skip-btn" onClick={handleSkipChallenges} disabled={submitting}>
                                    Skip for now
                                </button>
                            </div>

                            <p className="challenges-note">
                                You can always change these in Settings later
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Login
