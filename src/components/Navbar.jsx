import { NavLink, useLocation } from 'react-router-dom'
import {
    LayoutDashboard,
    BookOpen,
    Mic,
    ClipboardCheck,
    Users,
    Volume2,
    Moon,
    Bell,
    User
} from 'lucide-react'
import './Navbar.css'

function Navbar() {
    const location = useLocation()

    const navLinks = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/lessons', icon: BookOpen, label: 'Lessons' },
        { to: '/practice', icon: Mic, label: 'Practice' },
        { to: '/assessments', icon: ClipboardCheck, label: 'Assessments' },
        { to: '/study-rooms', icon: Users, label: 'Study Rooms' },
    ]

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
                <button className="navbar-icon-btn" aria-label="Toggle theme">
                    <Moon size={20} />
                </button>
                <NavLink to="/notifications" className="navbar-icon-btn" aria-label="Notifications">
                    <Bell size={20} />
                </NavLink>
                <NavLink to="/settings" className="navbar-icon-btn" aria-label="Profile">
                    <User size={20} />
                </NavLink>
            </div>
        </nav>
    )
}

export default Navbar
