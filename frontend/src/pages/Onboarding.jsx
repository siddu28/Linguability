import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { updateProfile } from '../lib/database'
import Button from '../components/Button'
import './Onboarding.css'

function Onboarding() {
    const navigate = useNavigate()
    const { user, loading: authLoading } = useAuth()
    const [submitting, setSubmitting] = useState(false)
    const [selectedChallenges, setSelectedChallenges] = useState([])
    const [showOnboarding, setShowOnboarding] = useState(false)

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
        }
    ]

    useEffect(() => {
        // If not authenticated, redirect to login
        if (!authLoading && !user) {
            navigate('/login')
            return
        }

        // Check if user already completed onboarding
        if (user) {
            // Check ONLY user metadata for onboarding_completed flag
            // This is set when user completes onboarding and is stored in Supabase
            const onboardingCompleted = user.user_metadata?.onboarding_completed

            if (onboardingCompleted === true) {
                // User already completed onboarding, go to dashboard
                navigate('/dashboard')
            } else {
                // User needs to complete onboarding - show the form
                setShowOnboarding(true)
            }
        }
    }, [user, authLoading, navigate])

    const handleChallengeToggle = (challengeId) => {
        setSelectedChallenges(prev =>
            prev.includes(challengeId)
                ? prev.filter(id => id !== challengeId)
                : [...prev, challengeId]
        )
    }

    const handleCompleteOnboarding = async () => {
        setSubmitting(true)
        try {
            // Update user metadata with onboarding_completed flag
            const { error } = await supabase.auth.updateUser({
                data: {
                    onboarding_completed: true
                }
            })

            if (error) throw error

            // Save learning challenges to the profiles table in database
            if (user?.id) {
                await updateProfile(user.id, {
                    learning_challenges: selectedChallenges
                })
            }

            navigate('/dashboard')
        } catch (err) {
            console.error('Failed to save preferences:', err)
            // Still navigate to dashboard even if save fails
            navigate('/dashboard')
        } finally {
            setSubmitting(false)
        }
    }

    const handleSkip = async () => {
        setSubmitting(true)
        try {
            // Mark onboarding as completed even if skipped
            await supabase.auth.updateUser({
                data: {
                    onboarding_completed: true
                }
            })
        } catch (err) {
            console.error('Failed to mark onboarding complete:', err)
        }
        navigate('/dashboard')
    }

    if (authLoading || !showOnboarding) {
        return (
            <div className="onboarding-page">
                <div className="onboarding-loading">Loading...</div>
            </div>
        )
    }

    return (
        <div className="onboarding-page">
            <div className="onboarding-container">
                <div className="onboarding-header">
                    <div className="brand-logo">
                        <span>LA</span>
                    </div>
                    <span className="brand-name">LinguaAccess</span>
                </div>

                <div className="onboarding-content">
                    <h1 className="onboarding-title">Personalize Your Experience</h1>
                    <p className="onboarding-subtitle">
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

                    <div className="onboarding-actions">
                        <Button
                            variant="primary"
                            size="large"
                            className="submit-btn"
                            onClick={handleCompleteOnboarding}
                            disabled={submitting}
                        >
                            {submitting ? 'Saving...' : 'Get Started'}
                            {!submitting && <ArrowRight size={18} />}
                        </Button>
                        <button className="skip-btn" onClick={handleSkip} disabled={submitting}>
                            Skip for now
                        </button>
                    </div>

                    <p className="onboarding-note">
                        You can always change these in Settings later
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Onboarding
