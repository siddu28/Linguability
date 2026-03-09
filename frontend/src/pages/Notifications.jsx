import { useState, useEffect } from 'react'
import {
    Flame,
    Trophy,
    BookOpen,
    Bell,
    Check,
    Mail,
    Settings,
    Loader2,
    AlertCircle
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import './Notifications.css'

// Map notification types to icons
const NOTIFICATION_ICONS = {
    streak: { icon: Flame, bg: '#FEF3C7', color: '#F59E0B' },
    achievement: { icon: Trophy, bg: '#FCE7F3', color: '#E91E8C' },
    lesson: { icon: BookOpen, bg: '#DBEAFE', color: '#3B82F6' },
    reminder: { icon: Bell, bg: '#FEE2E2', color: '#EF4444' },
    quiz: { icon: AlertCircle, bg: '#D1FAE5', color: '#059669' },
    default: { icon: Bell, bg: '#F3F4F6', color: '#6B7280' }
}

// Format relative time
function formatRelativeTime(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `about ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
}

function Notifications() {
    const { user } = useAuth()
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showEmailSettings, setShowEmailSettings] = useState(false)
    const [emailPrefs, setEmailPrefs] = useState({
        streak_reminders: true,
        achievements: true,
        low_score_help: true,
        weekly_summary: true,
        new_lessons: false
    })
    const [savingPrefs, setSavingPrefs] = useState(false)

    // Fetch notifications from Supabase
    useEffect(() => {
        async function fetchNotifications() {
            if (!user?.id) {
                setLoading(false)
                return
            }

            try {
                // Fetch notifications from Supabase
                const { data, error: fetchError } = await supabase
                    .from('notifications')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(20)

                if (fetchError) {
                    console.error('Error fetching notifications:', fetchError)
                    // If table doesn't exist, show empty state
                    if (fetchError.code === '42P01') {
                        setNotifications([])
                        setError(null)
                    } else {
                        setError('Failed to load notifications')
                    }
                } else {
                    setNotifications(data || [])
                }
            } catch (err) {
                console.error('Error:', err)
                setError('Failed to load notifications')
            } finally {
                setLoading(false)
            }
        }

        // Also fetch email preferences
        async function fetchEmailPrefs() {
            if (!user?.id) return

            try {
                const { data } = await supabase
                    .from('user_settings')
                    .select('email_notifications')
                    .eq('user_id', user.id)
                    .single()

                if (data?.email_notifications) {
                    setEmailPrefs(prev => ({ ...prev, ...data.email_notifications }))
                }
            } catch (err) {
                // Settings may not exist yet, use defaults
                console.log('Using default email preferences')
            }
        }

        fetchNotifications()
        fetchEmailPrefs()
    }, [user?.id])

    // Check if notification is unread (read_at is null)
    const isUnread = (n) => !n.read_at
    const unreadCount = notifications.filter(isUnread).length

    const markAsRead = async (id) => {
        const now = new Date().toISOString()
        // Optimistic update
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read_at: now } : n
        ))

        // Update in database
        if (user?.id) {
            try {
                await supabase
                    .from('notifications')
                    .update({ read_at: now })
                    .eq('id', id)
            } catch (err) {
                console.error('Error marking as read:', err)
            }
        }
    }

    const markAllAsRead = async () => {
        const now = new Date().toISOString()
        // Optimistic update
        setNotifications(notifications.map(n => ({ ...n, read_at: now })))

        // Update in database
        if (user?.id) {
            try {
                await supabase
                    .from('notifications')
                    .update({ read_at: now })
                    .eq('user_id', user.id)
                    .is('read_at', null)
            } catch (err) {
                console.error('Error marking all as read:', err)
            }
        }
    }

    const saveEmailPrefs = async () => {
        if (!user?.id) return

        setSavingPrefs(true)
        try {
            const { error } = await supabase
                .from('user_settings')
                .upsert({
                    user_id: user.id,
                    email_notifications: emailPrefs,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' })

            if (error) throw error
            setShowEmailSettings(false)
        } catch (err) {
            console.error('Error saving preferences:', err)
        } finally {
            setSavingPrefs(false)
        }
    }

    // Get icon config for notification type
    const getIconConfig = (type) => {
        return NOTIFICATION_ICONS[type] || NOTIFICATION_ICONS.default
    }

    return (
        <div className="notifications-page">
            <Navbar />

            <main className="notifications-content">
                <div className="notifications-header">
                    <div>
                        <h1 className="notifications-title">Notifications</h1>
                        <p className="notifications-subtitle">Stay updated on your learning progress</p>
                    </div>
                    <div className="notifications-actions">
                        <button 
                            className="email-settings-btn"
                            onClick={() => setShowEmailSettings(!showEmailSettings)}
                        >
                            <Mail size={16} />
                            Email Settings
                        </button>
                        {unreadCount > 0 && (
                            <button 
                                className="mark-all-read-btn"
                                onClick={markAllAsRead}
                            >
                                <Check size={16} />
                                Mark all read
                            </button>
                        )}
                    </div>
                </div>

                <div className="notifications-badges">
                    <span className="badge badge-primary">{unreadCount} unread</span>
                    <span className="badge badge-secondary">{notifications.length} total</span>
                </div>

                {/* Email Settings Panel */}
                {showEmailSettings && (
                    <Card className="email-settings-panel">
                        <div className="email-settings-header">
                            <Settings size={20} />
                            <h3>Email Notification Preferences</h3>
                        </div>
                        <div className="email-prefs-list">
                            <label className="email-pref-item">
                                <input 
                                    type="checkbox" 
                                    checked={emailPrefs.streak_reminders}
                                    onChange={(e) => setEmailPrefs(p => ({ ...p, streak_reminders: e.target.checked }))}
                                />
                                <Flame size={16} className="pref-icon" style={{ color: '#F59E0B' }} />
                                <span>Streak reminders</span>
                            </label>
                            <label className="email-pref-item">
                                <input 
                                    type="checkbox" 
                                    checked={emailPrefs.achievements}
                                    onChange={(e) => setEmailPrefs(p => ({ ...p, achievements: e.target.checked }))}
                                />
                                <Trophy size={16} className="pref-icon" style={{ color: '#E91E8C' }} />
                                <span>Achievement notifications</span>
                            </label>
                            <label className="email-pref-item">
                                <input 
                                    type="checkbox" 
                                    checked={emailPrefs.low_score_help}
                                    onChange={(e) => setEmailPrefs(p => ({ ...p, low_score_help: e.target.checked }))}
                                />
                                <AlertCircle size={16} className="pref-icon" style={{ color: '#3B82F6' }} />
                                <span>Low score assistance emails</span>
                            </label>
                            <label className="email-pref-item">
                                <input 
                                    type="checkbox" 
                                    checked={emailPrefs.weekly_summary}
                                    onChange={(e) => setEmailPrefs(p => ({ ...p, weekly_summary: e.target.checked }))}
                                />
                                <Mail size={16} className="pref-icon" style={{ color: '#8B5CF6' }} />
                                <span>Weekly progress summary</span>
                            </label>
                            <label className="email-pref-item">
                                <input 
                                    type="checkbox" 
                                    checked={emailPrefs.new_lessons}
                                    onChange={(e) => setEmailPrefs(p => ({ ...p, new_lessons: e.target.checked }))}
                                />
                                <BookOpen size={16} className="pref-icon" style={{ color: '#059669' }} />
                                <span>New lesson announcements</span>
                            </label>
                        </div>
                        <div className="email-settings-actions">
                            <button 
                                className="save-prefs-btn"
                                onClick={saveEmailPrefs}
                                disabled={savingPrefs}
                            >
                                {savingPrefs ? <Loader2 size={16} className="spin" /> : <Check size={16} />}
                                {savingPrefs ? 'Saving...' : 'Save Preferences'}
                            </button>
                        </div>
                    </Card>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="notifications-loading">
                        <Loader2 size={32} className="spin" />
                        <p>Loading notifications...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <Card className="notifications-error">
                        <AlertCircle size={24} />
                        <p>{error}</p>
                    </Card>
                )}

                {/* Empty State */}
                {!loading && !error && notifications.length === 0 && (
                    <Card className="notifications-empty">
                        <Bell size={48} className="empty-icon" />
                        <h3>No notifications yet</h3>
                        <p>Complete lessons and quizzes to receive updates here!</p>
                    </Card>
                )}

                {/* Notifications List */}
                {!loading && notifications.length > 0 && (
                    <div className="notifications-list">
                        {notifications.map((notification) => {
                            const iconConfig = getIconConfig(notification.type)
                            const IconComponent = iconConfig.icon

                            return (
                                <Card
                                    key={notification.id}
                                    className={`notification-card ${!notification.read_at ? 'unread' : ''}`}
                                >
                                    <div className="notification-content">
                                        <div
                                            className="notification-icon"
                                            style={{ backgroundColor: iconConfig.bg }}
                                        >
                                            <IconComponent size={20} style={{ color: iconConfig.color }} />
                                        </div>

                                        <div className="notification-body">
                                            <h3 className="notification-title">{notification.title}</h3>
                                            <p className="notification-message">{notification.message}</p>
                                            <div className="notification-footer">
                                                <span className="notification-time">
                                                    {formatRelativeTime(notification.created_at)}
                                                </span>
                                                {!notification.read_at && (
                                                    <button
                                                        className="mark-read-btn"
                                                        onClick={() => markAsRead(notification.id)}
                                                    >
                                                        <Check size={14} />
                                                        Mark as read
                                                    </button>
                                                )}
                                                {notification.link && (
                                                    <a 
                                                        href={notification.link} 
                                                        className="view-link"
                                                    >
                                                        View
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        {!notification.read_at && <div className="unread-dot" />}
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </main>
        </div>
    )
}

export default Notifications
