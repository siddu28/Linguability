import { useState } from 'react'
import {
    Flame,
    Trophy,
    BookOpen,
    Bell,
    Check
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import './Notifications.css'

function Notifications() {
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: 'streak',
            icon: Flame,
            iconBg: '#FEF3C7',
            iconColor: '#F59E0B',
            title: 'Streak Reminder',
            message: "Don't break your 5-day streak! Complete a lesson today.",
            time: '30 minutes ago',
            read: false,
        },
        {
            id: 2,
            type: 'achievement',
            icon: Trophy,
            iconBg: '#FCE7F3',
            iconColor: '#E91E8C',
            title: 'Achievement Unlocked',
            message: 'Congratulations! You completed your first Hindi lesson.',
            time: 'about 2 hours ago',
            read: false,
        },
        {
            id: 3,
            type: 'lesson',
            icon: BookOpen,
            iconBg: '#DBEAFE',
            iconColor: '#3B82F6',
            title: 'New Lesson Available',
            message: 'Tamil Numbers 1-20 is now available. Start learning!',
            time: '1 day ago',
            read: true,
        },
        {
            id: 4,
            type: 'reminder',
            icon: Bell,
            iconBg: '#FEE2E2',
            iconColor: '#EF4444',
            title: 'Daily Reminder',
            message: "It's time for your daily practice session!",
            time: '2 days ago',
            read: true,
        },
    ])

    const unreadCount = notifications.filter(n => !n.read).length

    const markAsRead = (id) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        ))
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
                </div>

                <div className="notifications-badges">
                    <span className="badge badge-primary">{unreadCount} unread</span>
                    <span className="badge badge-secondary">{notifications.length} total</span>
                </div>

                <div className="notifications-list">
                    {notifications.map((notification) => (
                        <Card
                            key={notification.id}
                            className={`notification-card ${!notification.read ? 'unread' : ''}`}
                        >
                            <div className="notification-content">
                                <div
                                    className="notification-icon"
                                    style={{ backgroundColor: notification.iconBg }}
                                >
                                    <notification.icon size={20} style={{ color: notification.iconColor }} />
                                </div>

                                <div className="notification-body">
                                    <h3 className="notification-title">{notification.title}</h3>
                                    <p className="notification-message">{notification.message}</p>
                                    <div className="notification-footer">
                                        <span className="notification-time">{notification.time}</span>
                                        {!notification.read && (
                                            <button
                                                className="mark-read-btn"
                                                onClick={() => markAsRead(notification.id)}
                                            >
                                                <Check size={14} />
                                                Mark as read
                                            </button>
                                        )}
                                        {notification.type === 'lesson' && (
                                            <button className="view-link">View</button>
                                        )}
                                    </div>
                                </div>

                                {!notification.read && <div className="unread-dot" />}
                            </div>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    )
}

export default Notifications
