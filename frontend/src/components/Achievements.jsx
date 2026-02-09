import { useState, useEffect } from 'react'
import { Trophy, Lock, Star, Flame, Target, BookOpen, Globe, Zap, Award, Crown } from 'lucide-react'
import './Achievements.css'

// Badge definitions with requirements
const BADGES = [
    {
        id: 'first_steps',
        name: 'First Steps',
        description: 'Complete your first lesson',
        icon: Star,
        requirement: (stats) => stats.lessonsCompleted >= 1,
        rarity: 'common',
        xp: 10
    },
    {
        id: 'getting_started',
        name: 'Getting Started',
        description: 'Complete 5 lessons',
        icon: BookOpen,
        requirement: (stats) => stats.lessonsCompleted >= 5,
        rarity: 'common',
        xp: 25
    },
    {
        id: 'dedicated_learner',
        name: 'Dedicated Learner',
        description: 'Complete 10 lessons',
        icon: Target,
        requirement: (stats) => stats.lessonsCompleted >= 10,
        rarity: 'uncommon',
        xp: 50
    },
    {
        id: 'on_fire',
        name: 'On Fire!',
        description: 'Maintain a 3-day streak',
        icon: Flame,
        requirement: (stats) => stats.streak >= 3,
        rarity: 'uncommon',
        xp: 30
    },
    {
        id: 'unstoppable',
        name: 'Unstoppable',
        description: 'Maintain a 7-day streak',
        icon: Zap,
        requirement: (stats) => stats.streak >= 7,
        rarity: 'rare',
        xp: 75
    },
    {
        id: 'linguist',
        name: 'Linguist',
        description: 'Learn words in 2 languages',
        icon: Globe,
        requirement: (stats) => stats.languagesLearned >= 2,
        rarity: 'uncommon',
        xp: 40
    },
    {
        id: 'polyglot',
        name: 'Polyglot',
        description: 'Learn words in all 4 languages',
        icon: Globe,
        requirement: (stats) => stats.languagesLearned >= 4,
        rarity: 'legendary',
        xp: 150
    },
    {
        id: 'century',
        name: 'Century',
        description: 'Complete 25 lessons total',
        icon: Award,
        requirement: (stats) => stats.lessonsCompleted >= 25,
        rarity: 'rare',
        xp: 100
    },
    {
        id: 'master',
        name: 'Language Master',
        description: 'Complete all lessons in one language',
        icon: Crown,
        requirement: (stats) => stats.completedLanguages >= 1,
        rarity: 'epic',
        xp: 200
    },
    {
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Maintain a 30-day streak',
        icon: Trophy,
        requirement: (stats) => stats.streak >= 30,
        rarity: 'legendary',
        xp: 300
    }
]

const RARITY_COLORS = {
    common: { bg: 'rgba(156, 163, 175, 0.15)', border: '#9CA3AF', text: 'Common' },
    uncommon: { bg: 'rgba(34, 197, 94, 0.15)', border: '#22C55E', text: 'Uncommon' },
    rare: { bg: 'rgba(59, 130, 246, 0.15)', border: '#3B82F6', text: 'Rare' },
    epic: { bg: 'rgba(168, 85, 247, 0.15)', border: '#A855F7', text: 'Epic' },
    legendary: { bg: 'rgba(245, 158, 11, 0.15)', border: '#F59E0B', text: 'Legendary' }
}

function Achievements({ stats = {} }) {
    const [selectedBadge, setSelectedBadge] = useState(null)
    const [showUnlockAnimation, setShowUnlockAnimation] = useState(false)
    const [newlyUnlocked, setNewlyUnlocked] = useState([])

    // Default stats if not provided
    const userStats = {
        lessonsCompleted: stats.lessonsCompleted || 0,
        streak: stats.streak || 0,
        languagesLearned: stats.languagesLearned || 0,
        completedLanguages: stats.completedLanguages || 0,
        ...stats
    }

    // Calculate which badges are unlocked
    const badgesWithStatus = BADGES.map(badge => ({
        ...badge,
        unlocked: badge.requirement(userStats)
    }))

    // Calculate total XP
    const totalXP = badgesWithStatus
        .filter(b => b.unlocked)
        .reduce((sum, b) => sum + b.xp, 0)

    const unlockedCount = badgesWithStatus.filter(b => b.unlocked).length

    // Calculate level based on XP
    const getLevel = (xp) => {
        if (xp >= 500) return { level: 5, title: 'Master', next: null }
        if (xp >= 300) return { level: 4, title: 'Expert', next: 500 }
        if (xp >= 150) return { level: 3, title: 'Advanced', next: 300 }
        if (xp >= 50) return { level: 2, title: 'Intermediate', next: 150 }
        return { level: 1, title: 'Beginner', next: 50 }
    }

    const levelInfo = getLevel(totalXP)
    const progressToNext = levelInfo.next
        ? Math.min((totalXP / levelInfo.next) * 100, 100)
        : 100

    const handleBadgeClick = (badge) => {
        setSelectedBadge(badge)
    }

    const closeBadgeDetails = () => {
        setSelectedBadge(null)
    }

    return (
        <div className="achievements">
            {/* Header with XP and Level */}
            <div className="achievements-header">
                <div className="xp-display">
                    <div className="xp-icon-wrapper">
                        <Trophy className="xp-icon" size={24} />
                    </div>
                    <div className="xp-info">
                        <span className="xp-amount">{totalXP} XP</span>
                        <span className="xp-label">Total Earned</span>
                    </div>
                </div>

                <div className="level-display">
                    <div className="level-badge">
                        <span className="level-number">{levelInfo.level}</span>
                    </div>
                    <div className="level-info">
                        <span className="level-title">{levelInfo.title}</span>
                        <div className="level-progress">
                            <div
                                className="level-progress-bar"
                                style={{ width: `${progressToNext}%` }}
                            />
                        </div>
                        {levelInfo.next && (
                            <span className="level-next">{levelInfo.next - totalXP} XP to next level</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Badge count */}
            <div className="badges-count">
                <span className="badges-unlocked">{unlockedCount}</span>
                <span className="badges-total">/ {BADGES.length} badges unlocked</span>
            </div>

            {/* Badges Grid */}
            <div className="badges-grid">
                {badgesWithStatus.map((badge) => {
                    const Icon = badge.icon
                    const rarity = RARITY_COLORS[badge.rarity]

                    return (
                        <button
                            key={badge.id}
                            className={`badge-item ${badge.unlocked ? 'unlocked' : 'locked'} ${badge.rarity}`}
                            onClick={() => handleBadgeClick(badge)}
                            style={{
                                '--badge-color': rarity.border,
                                '--badge-bg': rarity.bg
                            }}
                        >
                            <div className="badge-icon-wrapper">
                                {badge.unlocked ? (
                                    <Icon size={28} className="badge-icon" />
                                ) : (
                                    <Lock size={24} className="badge-icon locked-icon" />
                                )}
                            </div>
                            <span className="badge-name">{badge.name}</span>
                            <span className="badge-xp">+{badge.xp} XP</span>
                        </button>
                    )
                })}
            </div>

            {/* Badge Details Modal */}
            {selectedBadge && (
                <div className="badge-modal-overlay" onClick={closeBadgeDetails}>
                    <div
                        className={`badge-modal ${selectedBadge.unlocked ? 'unlocked' : 'locked'}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            '--badge-color': RARITY_COLORS[selectedBadge.rarity].border,
                            '--badge-bg': RARITY_COLORS[selectedBadge.rarity].bg
                        }}
                    >
                        <button className="modal-close" onClick={closeBadgeDetails}>×</button>

                        <div className={`modal-badge-icon ${selectedBadge.unlocked ? 'unlocked' : ''}`}>
                            {selectedBadge.unlocked ? (
                                <selectedBadge.icon size={48} />
                            ) : (
                                <Lock size={40} />
                            )}
                        </div>

                        <h3 className="modal-badge-name">{selectedBadge.name}</h3>
                        <span className={`modal-rarity ${selectedBadge.rarity}`}>
                            {RARITY_COLORS[selectedBadge.rarity].text}
                        </span>
                        <p className="modal-badge-desc">{selectedBadge.description}</p>

                        <div className="modal-xp">
                            <Trophy size={16} />
                            <span>+{selectedBadge.xp} XP</span>
                        </div>

                        {selectedBadge.unlocked ? (
                            <div className="modal-status unlocked">
                                ✓ Unlocked!
                            </div>
                        ) : (
                            <div className="modal-status locked">
                                🔒 Keep learning to unlock
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Achievements
