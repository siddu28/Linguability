import { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard,
    BookOpen,
    Mic,
    ClipboardCheck,
    Users,
    Volume2,
    Moon,
    Sun,
    Bell,
    User,
    Settings,
    LogOut
} from 'lucide-react'
import './Navbar.css'

function Navbar() {
    const navigate = useNavigate()
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('theme')
        return saved === 'dark'
    })
    const profileMenuRef = useRef(null)

    // Mock user data - replace with actual user data later
    const user = {
        email: 'siddukasam28@gmail.com'
    }

    const navLinks = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/lessons', icon: BookOpen, label: 'Lessons' },
        { to: '/practice', icon: Mic, label: 'Practice' },
        { to: '/assessments', icon: ClipboardCheck, label: 'Assessments' },
        { to: '/study-rooms', icon: Users, label: 'Study Rooms' },
    ]

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setShowProfileMenu(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Apply theme to document
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.setAttribute('data-theme', 'dark')
            localStorage.setItem('theme', 'dark')
        } else {
            document.documentElement.removeAttribute('data-theme')
            localStorage.setItem('theme', 'light')
        }
    }, [isDarkMode])

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode)
    }

    const handleSignOut = () => {
        setShowProfileMenu(false)
        // Add sign out logic here later
        navigate('/login')
    }

    const handleProfileClick = () => {
        setShowProfileMenu(false)
        navigate('/profile')
    }

    const handleSettingsClick = () => {
        setShowProfileMenu(false)
        navigate('/settings')
    }

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <div className="navbar-logo">
                    <span className="logo-text">LA</span>
                </div>
                <span className="navbar-title">LinguaAccess</span>
            </div>

            <div className="navbar-links">
                {navLinks.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        <Icon size={18} />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </div>

            <div className="navbar-actions">
                <button className="navbar-icon-btn" aria-label="Toggle sound">
                    <Volume2 size={20} />
                </button>
                <button
                    className="navbar-icon-btn"
                    aria-label="Toggle theme"
                    onClick={toggleTheme}
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <NavLink to="/notifications" className="navbar-icon-btn" aria-label="Notifications">
                    <Bell size={20} />
                </NavLink>

                {/* Profile Dropdown */}
                <div className="profile-dropdown" ref={profileMenuRef}>
                    <button
                        className="navbar-icon-btn"
                        aria-label="Profile"
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                    >
                        <User size={20} />
                    </button>

                    {showProfileMenu && (
                        <div className="profile-menu">
                            <div className="profile-menu-header">
                                {user.email}
                            </div>
                            <div className="profile-menu-divider" />
                            <button className="profile-menu-item" onClick={handleProfileClick}>
                                <User size={18} />
                                <span>Profile</span>
                            </button>
                            <button className="profile-menu-item" onClick={handleSettingsClick}>
                                <Settings size={18} />
                                <span>Settings</span>
                            </button>
                            <div className="profile-menu-divider" />
                            <button className="profile-menu-item signout" onClick={handleSignOut}>
                                <LogOut size={18} />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Navbar
