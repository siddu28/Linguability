import { useState, useEffect } from 'react'
import { Camera, Mail, Calendar, Award, BookOpen, Clock, Edit2, Save } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getProfile, updateProfile } from '../lib/database'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import Button from '../components/Button'
import './Profile.css'

function Profile() {
    const { user } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [profile, setProfile] = useState({
        full_name: '',
        avatar_url: '',
        preferred_language: 'en',
        learning_challenges: [],
        created_at: null,
    })

    const challengeLabels = {
        dyslexia: 'Dyslexia',
        adhd: 'ADHD',
        auditory: 'Auditory Processing',
        visual: 'Visual Processing',
        motor: 'Motor Difficulties',
        memory: 'Memory Challenges',
    }

    const stats = [
        { icon: BookOpen, label: 'Lessons Completed', value: '0' },
        { icon: Clock, label: 'Total Learning Time', value: '0 min' },
        { icon: Award, label: 'Achievements', value: '0' },
    ]

    // Load profile from Supabase
    useEffect(() => {
        async function loadProfile() {
            if (!user?.id) return

            setLoading(true)
            const data = await getProfile(user.id)
            if (data) {
                setProfile({
                    full_name: data.full_name || user.user_metadata?.full_name || '',
                    avatar_url: data.avatar_url || '',
                    preferred_language: data.preferred_language || 'en',
                    learning_challenges: data.learning_challenges || [],
                    created_at: data.created_at,
                })
            }
            setLoading(false)
        }
        loadProfile()
    }, [user])

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value })
    }

    const handleSave = async () => {
        if (!user?.id) return
        setSaving(true)
        try {
            await updateProfile(user.id, {
                full_name: profile.full_name,
                preferred_language: profile.preferred_language,
            })
            setIsEditing(false)
        } catch (err) {
            console.error('Failed to save profile:', err)
        } finally {
            setSaving(false)
        }
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return 'January 2026'
        const date = new Date(dateStr)
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    }

    const initials = profile.full_name
        ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
        : user?.email?.[0]?.toUpperCase() || 'U'

    if (loading) {
        return (
            <div className="profile-page">
                <Navbar />
                <main className="profile-content">
                    <div className="loading-message">Loading profile...</div>
                </main>
            </div>
        )
    }

    return (
        <div className="profile-page">
            <Navbar />

            <main className="profile-content">
                {/* Profile Header */}
                <div className="profile-header-card">
                    <div className="profile-avatar">
                        <div className="avatar-placeholder">
                            {initials}
                        </div>
                        <button className="avatar-edit-btn" aria-label="Change photo">
                            <Camera size={16} />
                        </button>
                    </div>

                    <div className="profile-info">
                        {isEditing ? (
                            <input
                                type="text"
                                name="full_name"
                                value={profile.full_name}
                                onChange={handleChange}
                                className="profile-name-input"
                                placeholder="Your name"
                            />
                        ) : (
                            <h1 className="profile-name">{profile.full_name || 'No name set'}</h1>
                        )}

                        <div className="profile-meta">
                            <span className="meta-item">
                                <Mail size={16} />
                                {user?.email}
                            </span>
                            <span className="meta-item">
                                <Calendar size={16} />
                                Member since {formatDate(profile.created_at)}
                            </span>
                        </div>
                    </div>

                    <div className="profile-actions">
                        {isEditing ? (
                            <Button
                                variant="primary"
                                icon={Save}
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        ) : (
                            <Button variant="secondary" icon={Edit2} onClick={() => setIsEditing(true)}>
                                Edit Profile
                            </Button>
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="profile-stats-grid">
                    {stats.map(({ icon: Icon, label, value }, index) => (
                        <Card key={index} className="profile-stat-card">
                            <Icon size={24} className="stat-icon" />
                            <div className="stat-value">{value}</div>
                            <div className="stat-label">{label}</div>
                        </Card>
                    ))}
                </div>

                {/* Learning Challenges & Preferences */}
                <div className="profile-grid">
                    <Card className="profile-card">
                        <h2 className="card-title">Learning Challenges</h2>
                        <p className="card-subtitle">Your selected learning support areas</p>

                        {profile.learning_challenges && profile.learning_challenges.length > 0 ? (
                            <div className="challenges-tags">
                                {profile.learning_challenges.map((id) => (
                                    <span key={id} className="challenge-tag">
                                        {challengeLabels[id] || id}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="no-challenges">
                                No learning challenges selected.{' '}
                                <a href="/settings">Add in Settings</a>
                            </p>
                        )}
                    </Card>

                    <Card className="profile-card">
                        <h2 className="card-title">Language Preferences</h2>
                        <p className="card-subtitle">Your learning languages</p>

                        <div className="language-list">
                            <div className="language-item">
                                <span className="language-flag">🇮🇳</span>
                                <span className="language-name">Hindi</span>
                                <span className="language-level">Beginner</span>
                            </div>
                            <div className="language-item">
                                <span className="language-flag">🇮🇳</span>
                                <span className="language-name">Tamil</span>
                                <span className="language-level">Not Started</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    )
}

export default Profile
