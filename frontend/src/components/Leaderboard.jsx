import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, Medal, Crown, Star, ChevronUp, ChevronDown, Minus, User } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import './Leaderboard.css'

// Calculate XP from achievements (for initial load if not stored in DB)
const BADGE_XP = {
    first_steps: 10,
    getting_started: 25,
    dedicated_learner: 50,
    on_fire: 30,
    unstoppable: 75,
    linguist: 40,
    polyglot: 150,
    century: 100,
    master: 200,
    perfectionist: 300
}

function Leaderboard({ compact = false }) {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [leaderboard, setLeaderboard] = useState([])
    const [loading, setLoading] = useState(true)
    const [userRank, setUserRank] = useState(null)
    const [timeFilter, setTimeFilter] = useState('all') // 'all', 'week', 'month'

    useEffect(() => {
        loadLeaderboard()
    }, [user, timeFilter])

    async function loadLeaderboard() {
        setLoading(true)
        try {
            // First, get basic profile info (without total_xp which may not exist)
            let { data: profiles, error: profileError } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_id')
                .limit(50)

            console.log('Profiles loaded:', profiles?.length, profileError)

            // Get lesson progress to calculate XP
            const { data: progressData, error: progressError } = await supabase
                .from('lesson_progress')
                .select('user_id, status')

            console.log('Progress data:', progressData?.length, progressError)

            // Calculate XP per user from their lesson progress
            const calculatedXP = {}
            progressData?.forEach(p => {
                if (!calculatedXP[p.user_id]) calculatedXP[p.user_id] = 0
                if (p.status === 'completed') calculatedXP[p.user_id] += 25
                else if (p.status === 'in_progress') calculatedXP[p.user_id] += 5
            })

            console.log('Calculated XP:', calculatedXP)

            // If no profiles found, try to build from lesson_progress user_ids
            if (!profiles || profiles.length === 0) {
                // Get unique user IDs from progress data
                const uniqueUserIds = [...new Set(progressData?.map(p => p.user_id) || [])]
                console.log('Building profiles from progress, users:', uniqueUserIds.length)
                
                profiles = uniqueUserIds.map(userId => ({
                    id: userId,
                    full_name: null,
                    avatar_id: 'default',
                    total_xp: calculatedXP[userId] || 0
                }))
            } else {
                // Add calculated XP to profiles
                profiles = profiles.map(p => ({
                    ...p,
                    total_xp: calculatedXP[p.id] || 0
                }))
            }

            // Sort by XP descending
            profiles = profiles.sort((a, b) => b.total_xp - a.total_xp)

            console.log('Final profiles for leaderboard:', profiles)

            if (profiles && profiles.length > 0) {
                // Add rank to each profile
                const rankedProfiles = profiles.map((profile, index) => ({
                    ...profile,
                    rank: index + 1,
                    isCurrentUser: profile.id === user?.id
                }))

                setLeaderboard(rankedProfiles)

                // Find current user's rank
                const currentUserProfile = rankedProfiles.find(p => p.id === user?.id)
                if (currentUserProfile) {
                    setUserRank(currentUserProfile.rank)
                }
            }
        } catch (err) {
            console.error('Error loading leaderboard:', err)
        } finally {
            setLoading(false)
        }
    }

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1:
                return <Crown className="rank-icon gold" size={20} />
            case 2:
                return <Medal className="rank-icon silver" size={20} />
            case 3:
                return <Medal className="rank-icon bronze" size={20} />
            default:
                return <span className="rank-number">{rank}</span>
        }
    }

    const getLevelTitle = (xp) => {
        if (xp >= 1000) return 'Legend'
        if (xp >= 500) return 'Master'
        if (xp >= 300) return 'Expert'
        if (xp >= 150) return 'Advanced'
        if (xp >= 50) return 'Intermediate'
        return 'Beginner'
    }

    const getInitials = (name) => {
        if (!name) return '?'
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    if (loading) {
        return (
            <div className={`leaderboard ${compact ? 'compact' : ''}`}>
                <div className="leaderboard-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading leaderboard...</p>
                </div>
            </div>
        )
    }

    const displayedUsers = compact ? leaderboard.slice(0, 5) : leaderboard

    return (
        <div className={`leaderboard ${compact ? 'compact' : ''}`}>
            <div className="leaderboard-header">
                <div className="leaderboard-title">
                    <Trophy size={20} />
                    <h3>Leaderboard</h3>
                </div>
                {!compact && (
                    <div className="leaderboard-filters">
                        <button 
                            className={`filter-btn ${timeFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setTimeFilter('all')}
                        >
                            All Time
                        </button>
                        <button 
                            className={`filter-btn ${timeFilter === 'month' ? 'active' : ''}`}
                            onClick={() => setTimeFilter('month')}
                        >
                            This Month
                        </button>
                        <button 
                            className={`filter-btn ${timeFilter === 'week' ? 'active' : ''}`}
                            onClick={() => setTimeFilter('week')}
                        >
                            This Week
                        </button>
                    </div>
                )}
            </div>

            {userRank && (
                <div className="your-rank">
                    <Star size={16} />
                    <span>Your Rank: <strong>#{userRank}</strong></span>
                </div>
            )}

            <div className="leaderboard-list">
                {displayedUsers.length === 0 ? (
                    <div className="leaderboard-empty">
                        <Trophy size={32} />
                        <p>No users on the leaderboard yet!</p>
                        <p className="empty-subtitle">Start learning to earn XP and climb the ranks!</p>
                    </div>
                ) : (
                    displayedUsers.map((profile) => (
                        <div 
                            key={profile.id} 
                            className={`leaderboard-item ${profile.isCurrentUser ? 'current-user' : ''} ${profile.rank <= 3 ? 'top-three' : ''}`}
                        >
                            <div className="rank-badge">
                                {getRankIcon(profile.rank)}
                            </div>
                            
                            <div className="user-avatar">
                                {profile.avatar_id ? (
                                    <span className="avatar-emoji">
                                        {/* Use emoji from avatar_id or fallback */}
                                        {getAvatarEmoji(profile.avatar_id)}
                                    </span>
                                ) : (
                                    <span className="avatar-initials">
                                        {getInitials(profile.full_name)}
                                    </span>
                                )}
                            </div>

                            <div className="user-info">
                                <span className="user-name">
                                    {profile.full_name || 'Anonymous Learner'}
                                    {profile.isCurrentUser && <span className="you-badge">You</span>}
                                </span>
                                <span className="user-level">{getLevelTitle(profile.total_xp)}</span>
                            </div>

                            <div className="user-xp">
                                <span className="xp-value">{profile.total_xp || 0}</span>
                                <span className="xp-label">XP</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {compact && (
                <button className="view-all-leaderboard" onClick={() => navigate('/leaderboard')}>
                    View Full Leaderboard
                </button>
            )}
        </div>
    )
}

// Helper to get avatar emoji
function getAvatarEmoji(avatarId) {
    const avatars = {
        default: '👤',
        student: '🎓',
        reader: '📚',
        star: '⭐',
        rocket: '🚀',
        brain: '🧠',
        fire: '🔥',
        trophy: '🏆',
        diamond: '💎',
        crown: '👑',
        ninja: '🥷',
        wizard: '🧙',
        astronaut: '👨‍🚀',
        artist: '🎨',
        music: '🎵',
        globe: '🌍'
    }
    return avatars[avatarId] || '👤'
}

export default Leaderboard
