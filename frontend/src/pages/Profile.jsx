import { useState, useEffect } from 'react'
import { Camera, Mail, Calendar, Award, BookOpen, Clock, Edit2, Save } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getProfile, updateProfile, getLessonProgress } from '../lib/database'
import { AVATAR_OPTIONS } from '../context/SoundContext'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import Button from '../components/Button'
import AvatarSelector from '../components/AvatarSelector'
import './Profile.css'

function Profile() {
    const { user } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showAvatarSelector, setShowAvatarSelector] = useState(false)
    const [profile, setProfile] = useState({
        full_name: '',
        avatar_id: 'default',
        avatar_url: '',
        preferred_language: 'en',
        learning_challenges: [],
        created_at: null,
    })
    const [stats, setStats] = useState({
        lessonsCompleted: 0,
        timeSpent: 0,
        achievements: 0
    })

    const challengeLabels = {
        dyslexia: 'Dyslexia',
        adhd: 'ADHD',
        auditory: 'Auditory Processing',
        visual: 'Visual Processing',
        motor: 'Motor Difficulties',
        memory: 'Memory Challenges',
    }

    // Load profile and stats from Supabase
    useEffect(() => {
        async function loadProfileAndStats() {
            if (!user?.id) return

            setLoading(true)
            try {
                // Load profile
                const data = await getProfile(user.id)
                if (data) {
                    setProfile({
                        full_name: data.full_name || user.user_metadata?.full_name || '',
                        avatar_id: data.avatar_id || 'default',
                        avatar_url: data.avatar_url || '',
                        preferred_language: data.preferred_language || 'en',
                        learning_challenges: data.learning_challenges || [],
                        created_at: data.created_at,
                    })
                }

                // Load real stats from lesson progress
                const progress = await getLessonProgress(user.id)
                const completedLessons = progress.filter(p => p.status === 'completed')
                const inProgressLessons = progress.filter(p => p.status === 'in_progress')
                
                // Calculate time spent (estimate: 5 min per completed, 2 min per in-progress)
                const timeSpent = (completedLessons.length * 5) + (inProgressLessons.length * 2)
                
                // Calculate achievements (XP-based)
                let achievements = 0
                if (completedLessons.length >= 1) achievements++
                if (completedLessons.length >= 5) achievements++
                if (completedLessons.length >= 10) achievements++
                if (completedLessons.length >= 25) achievements++
                
                setStats({
                    lessonsCompleted: completedLessons.length,
                    timeSpent,
                    achievements
                })
            } catch (err) {
                console.error('Error loading profile:', err)
            } finally {
                setLoading(false)
            }
        }
        loadProfileAndStats()
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
                avatar_id: profile.avatar_id,
                preferred_language: profile.preferred_language,
            })
            setIsEditing(false)
        } catch (err) {
            console.error('Failed to save profile:', err)
        } finally {
            setSaving(false)
        }
    }

    const handleAvatarSelect = async (avatarId) => {
        setProfile({ ...profile, avatar_id: avatarId })
        // Save immediately
        if (user?.id) {
            try {
                await updateProfile(user.id, { avatar_id: avatarId })
            } catch (err) {
                console.error('Failed to save avatar:', err)
            }
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
                        <div className="avatar-placeholder" onClick={() => setShowAvatarSelector(true)}>
                            {profile.avatar_id && profile.avatar_id !== 'default' ? (
                                <span className="avatar-emoji">
                                    {AVATAR_OPTIONS.find(a => a.id === profile.avatar_id)?.emoji || '👤'}
                                </span>
                            ) : (
                                initials
                            )}
                        </div>
                        <button 
                            className="avatar-edit-btn" 
                            aria-label="Change avatar"
                            onClick={() => setShowAvatarSelector(true)}
                        >
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
                    <Card className="profile-stat-card">
                        <BookOpen size={24} className="stat-icon" />
                        <div className="stat-value">{stats.lessonsCompleted}</div>
                        <div className="stat-label">Lessons Completed</div>
                    </Card>
                    <Card className="profile-stat-card">
                        <Clock size={24} className="stat-icon" />
                        <div className="stat-value">{stats.timeSpent >= 60 ? `${Math.floor(stats.timeSpent / 60)} hr` : `${stats.timeSpent} min`}</div>
                        <div className="stat-label">Total Learning Time</div>
                    </Card>
                    <Card className="profile-stat-card">
                        <Award size={24} className="stat-icon" />
                        <div className="stat-value">{stats.achievements}</div>
                        <div className="stat-label">Achievements</div>
                    </Card>
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

            {/* Avatar Selector Modal */}
            {showAvatarSelector && (
                <AvatarSelector
                    currentAvatar={profile.avatar_id}
                    onSelect={handleAvatarSelect}
                    onClose={() => setShowAvatarSelector(false)}
                />
            )}
        </div>
    )
}

export default Profile
