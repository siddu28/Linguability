import { useState } from 'react'
import { Search, Globe, Clock, Volume2, BookOpen, Lock } from 'lucide-react'
import Navbar from '../components/Navbar'
import './Lessons.css'

function Lessons() {
    const [searchQuery, setSearchQuery] = useState('')
    const [activeFilter, setActiveFilter] = useState('all')

    const filters = [
        { id: 'all', label: 'All Languages' },
        { id: 'english', label: 'English', flag: '🇬🇧' },
        { id: 'hindi', label: 'Hindi', flag: 'IN' },
        { id: 'tamil', label: 'Tamil', flag: 'IN' },
    ]

    const lessons = [
        {
            id: 1,
            title: 'Hindi Basics - Greetings',
            description: 'Learn common Hindi greetings and introductions',
            language: 'Hindi',
            duration: 15,
            level: 'beginner',
            locked: false,
        },
        {
            id: 2,
            title: 'Hindi Numbers 1-10',
            description: 'Master counting in Hindi with audio practice',
            language: 'Hindi',
            duration: 20,
            level: 'beginner',
            locked: false,
        },
        {
            id: 3,
            title: 'Tamil Alphabets - Vowels',
            description: 'Learn Tamil vowels with pronunciation guide',
            language: 'Tamil',
            duration: 25,
            level: 'beginner',
            locked: false,
        },
        {
            id: 4,
            title: 'Daily Conversations - Hindi',
            description: 'Practical phrases for everyday situations',
            language: 'Hindi',
            duration: 30,
            level: 'intermediate',
            locked: true,
            lockReason: 'Complete previous lessons',
        },
        {
            id: 5,
            title: 'Tamil Greetings & Basics',
            description: 'Essential Tamil phrases for beginners',
            language: 'Tamil',
            duration: 15,
            level: 'beginner',
            locked: false,
        },
    ]

    const filteredLessons = lessons.filter(lesson => {
        const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lesson.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesFilter = activeFilter === 'all' || lesson.language.toLowerCase() === activeFilter
        return matchesSearch && matchesFilter
    })

    return (
        <div className="lessons-page">
            <Navbar />

            <main className="lessons-content">
                {/* Search and Filters */}
                <div className="lessons-toolbar">
                    <div className="search-box">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search lessons..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <div className="filter-tabs">
                        {filters.map((filter) => (
                            <button
                                key={filter.id}
                                className={`filter-tab ${activeFilter === filter.id ? 'active' : ''}`}
                                onClick={() => setActiveFilter(filter.id)}
                            >
                                {filter.flag && <span className="filter-flag">{filter.flag}</span>}
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Lessons Grid */}
                <div className="lessons-grid">
                    {filteredLessons.map((lesson) => (
                        <div key={lesson.id} className={`lesson-card ${lesson.locked ? 'locked' : ''}`}>
                            <div className="lesson-card-header">
                                <span className={`level-badge ${lesson.level}`}>
                                    {lesson.level}
                                </span>
                                <button className="audio-btn" aria-label="Listen to pronunciation">
                                    <Volume2 size={18} />
                                </button>
                            </div>

                            <h3 className="lesson-card-title">{lesson.title}</h3>
                            <p className="lesson-card-description">{lesson.description}</p>

                            {lesson.locked && lesson.lockReason && (
                                <div className="lock-reason">
                                    <Lock size={14} />
                                    <span>{lesson.lockReason}</span>
                                </div>
                            )}

                            <div className="lesson-card-meta">
                                <span className="meta-item">
                                    <Globe size={14} />
                                    {lesson.language}
                                </span>
                                <span className="meta-item">
                                    <Clock size={14} />
                                    {lesson.duration} min
                                </span>
                            </div>

                            <button
                                className={`start-lesson-btn ${lesson.locked ? 'locked' : ''}`}
                                disabled={lesson.locked}
                            >
                                {lesson.locked ? (
                                    <>
                                        <Lock size={16} />
                                        <span>Locked</span>
                                    </>
                                ) : (
                                    <>
                                        <BookOpen size={16} />
                                        <span>Start Lesson</span>
                                    </>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}

export default Lessons
