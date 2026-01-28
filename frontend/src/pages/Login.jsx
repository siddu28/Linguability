import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Settings,
    Volume2,
    Monitor,
    Users
} from 'lucide-react'
import Input from '../components/Input'
import Button from '../components/Button'
import './Login.css'

function Login() {
    const navigate = useNavigate()
    const [isSignUp, setIsSignUp] = useState(true)
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: ''
    })

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        // For now, just navigate to dashboard
        navigate('/dashboard')
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
                    <h2 className="form-title">Welcome to LinguaAccess</h2>
                    <p className="form-subtitle">Sign in to continue your learning journey</p>

                    {/* Tab Switcher */}
                    <div className="form-tabs">
                        <button
                            className={`form-tab ${!isSignUp ? 'active' : ''}`}
                            onClick={() => setIsSignUp(false)}
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

                        <Button type="submit" variant="primary" size="large" className="submit-btn">
                            {isSignUp ? 'Create Account' : 'Sign In'}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="auth-divider">
                        <span>or</span>
                    </div>

                    {/* Google Sign In */}
                    <button className="google-signin-btn" type="button" onClick={() => console.log('Google Sign In clicked')}>
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
                </div>
            </div>
        </div>
    )
}

export default Login
