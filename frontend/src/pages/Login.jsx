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

                    <p className="form-footer">
                        By continuing, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login
