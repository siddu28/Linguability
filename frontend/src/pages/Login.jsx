import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import './Login.css'

// Custom SVG Icons - Unique designs
const icons = {
    // Feature icons
    languages: (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="24" cy="24" r="18" />
            <ellipse cx="24" cy="24" rx="8" ry="18" />
            <path d="M6 18h36" />
            <path d="M6 30h36" />
        </svg>
    ),
    adaptive: (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M24 6l4 8 9 1-6 6 2 9-9-4-9 4 2-9-6-6 9-1z" />
            <circle cx="24" cy="24" r="6" />
            <path d="M24 18v-2M24 32v-2M18 24h-2M32 24h-2" />
        </svg>
    ),
    accessibility: (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="8" y="6" width="32" height="36" rx="4" />
            <path d="M16 16h16" />
            <path d="M16 24h12" />
            <path d="M16 32h8" />
            <circle cx="36" cy="36" r="6" fill="currentColor" opacity="0.3" />
            <path d="M33 36h6M36 33v6" stroke="currentColor" strokeWidth="2" />
        </svg>
    ),
    community: (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="24" cy="14" r="8" />
            <circle cx="10" cy="28" r="6" />
            <circle cx="38" cy="28" r="6" />
            <path d="M16 42c0-6 4-10 8-10s8 4 8 10" />
            <path d="M4 42c0-4 2-6 6-6" />
            <path d="M44 42c0-4-2-6-6-6" />
        </svg>
    ),
    // Form icons
    mail: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M22 6l-10 7L2 6" />
        </svg>
    ),
    lock: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
    ),
    eye: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    ),
    eyeOff: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    ),
    arrowRight: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
    ),
    google: (
        <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
    )
}

const features = [
    {
        icon: icons.languages,
        title: 'Multiple Languages',
        description: 'Learn 50+ languages with native speakers'
    },
    {
        icon: icons.adaptive,
        title: 'Adaptive Learning',
        description: 'Personalized lessons that fit your style'
    },
    {
        icon: icons.accessibility,
        title: 'Accessibility First',
        description: 'Designed for all learning needs'
    },
    {
        icon: icons.community,
        title: 'Community Support',
        description: 'Connect with learners worldwide'
    }
]

function Login() {
    const navigate = useNavigate()
    const { loading: authLoading } = useAuth()
    const [isSignUp, setIsSignUp] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
        setErrorMessage('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrorMessage('')
        setSubmitting(true)

        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            onboarding_completed: false
                        }
                    }
                })
                if (error) throw error

                if (data?.session) {
                    navigate('/onboarding')
                } else {
                    setErrorMessage('Check your email to confirm your account, then sign in.')
                    setIsSignUp(false)
                }
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password
                })
                if (error) throw error
                if (data?.session) navigate('/dashboard')
            }
        } catch (err) {
            setErrorMessage(err?.message || 'Authentication failed')
        } finally {
            setSubmitting(false)
        }
    }

    const handleGoogleSignIn = async () => {
        setErrorMessage('')
        setSubmitting(true)
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/onboarding`
                }
            })
            if (error) throw error
        } catch (err) {
            setErrorMessage(err?.message || 'Google sign-in failed')
            setSubmitting(false)
        }
    }

    return (
        <div className="login-page">
            {/* Left Panel - Branding & Features */}
            <div className="login-brand">
                {/* Logo */}
                <div className="brand-header">
                    <div className="brand-logo">
                        <svg viewBox="0 0 40 40" fill="none">
                            <circle cx="20" cy="20" r="18" fill="white" />
                            <path d="M14 14c0-3 2-5 6-5s6 2 6 5c0 4-6 4-6 8v2" stroke="#c2185b" strokeWidth="2.5" strokeLinecap="round" />
                            <circle cx="20" cy="30" r="1.5" fill="#c2185b" />
                        </svg>
                    </div>
                    <div className="brand-text">
                        <span className="brand-name">LinguaAccess</span>
                        <span className="brand-tagline">Learn without limits</span>
                    </div>
                </div>

                {/* Hero Content */}
                <div className="brand-content">
                    <h1 className="brand-title">
                        Language learning,<br />
                        reimagined for everyone
                    </h1>
                    <p className="brand-description">
                        Join thousands of learners who've discovered a better way to master new languages.
                    </p>

                    {/* Feature Cards */}
                    <div className="feature-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card">
                                <span className="feature-icon">{feature.icon}</span>
                                <div className="feature-text">
                                    <span className="feature-title">{feature.title}</span>
                                    <span className="feature-desc">{feature.description}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <p className="brand-footer">
                    © 2024 LinguaAccess. All rights reserved.
                </p>
            </div>

            {/* Right Panel - Login Form */}
            <div className="login-form-panel">
                <div className="login-form-wrapper">
                    <h2 className="form-title">
                        {isSignUp ? 'Create account' : 'Welcome back'}
                    </h2>
                    <p className="form-subtitle">
                        {isSignUp
                            ? 'Start your language learning journey'
                            : 'Sign in to continue your learning journey'}
                    </p>

                    <form onSubmit={handleSubmit} className="login-form">
                        {/* Email Field */}
                        <div className="form-field">
                            <label htmlFor="email" className="field-label">Email address</label>
                            <div className="input-wrapper">
                                <span className="input-icon">{icons.mail}</span>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="form-field">
                            <div className="field-header">
                                <label htmlFor="password" className="field-label">Password</label>
                                {!isSignUp && (
                                    <Link to="/forgot-password" className="forgot-link">
                                        Forgot password?
                                    </Link>
                                )}
                            </div>
                            <div className="input-wrapper">
                                <span className="input-icon">{icons.lock}</span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? icons.eyeOff : icons.eye}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {errorMessage && (
                            <p className="form-error" role="alert">
                                {errorMessage}
                            </p>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={authLoading || submitting}
                        >
                            {submitting ? 'Please wait...' : (isSignUp ? 'Sign up' : 'Sign in')}
                            {!submitting && <span className="btn-icon">{icons.arrowRight}</span>}
                        </button>
                    </form>

                    {/* Toggle Sign In / Sign Up */}
                    <p className="toggle-mode">
                        {isSignUp ? (
                            <>Already have an account? <button onClick={() => setIsSignUp(false)}>Sign in</button></>
                        ) : (
                            <>Don't have an account? <button onClick={() => setIsSignUp(true)}>Get started free</button></>
                        )}
                    </p>

                    {/* Divider */}
                    <div className="auth-divider">
                        <span>Or continue with</span>
                    </div>

                    {/* Google Sign In */}
                    <button
                        type="button"
                        className="google-btn"
                        onClick={handleGoogleSignIn}
                        disabled={authLoading || submitting}
                    >
                        {icons.google}
                        <span>Google Sign In</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Login
