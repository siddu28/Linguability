import { useState } from 'react'
import { Search, Plus, Users, Video } from 'lucide-react'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import Button from '../components/Button'
import './StudyRooms.css'

function StudyRooms() {
    const [searchQuery, setSearchQuery] = useState('')

    // No rooms initially - empty array
    const rooms = []

    const filteredRooms = rooms.filter(room =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.topic.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="study-rooms-page">
            <Navbar />

            <main className="study-rooms-content">
                <div className="study-rooms-header">
                    <div>
                        <h1 className="study-rooms-title">Study Rooms</h1>
                        <p className="study-rooms-subtitle">Learn together with other students in real-time</p>
                    </div>
                    <Button variant="primary" icon={Plus}>
                        Create Room
                    </Button>
                </div>

                {/* Search Bar */}
                <div className="search-container">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search rooms..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                </div>

                {/* Rooms Grid */}
                {filteredRooms.length > 0 ? (
                    <div className="rooms-grid">
                        {filteredRooms.map((room) => (
                            <Card key={room.id} className="room-card">
                                <div className="room-header">
                                    <span className="live-badge">
                                        <span className="live-dot"></span>
                                        Live
                                    </span>
                                    <span className="participants-badge">
                                        <Users size={14} />
                                        {room.participants}/{room.maxParticipants}
                                    </span>
                                </div>

                                <h3 className="room-name">{room.name}</h3>
                                <p className="room-topic">{room.topic}</p>

                                <Button variant="primary" icon={Video} className="join-btn">
                                    Join Room
                                </Button>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <Users size={48} />
                        </div>
                        <h3 className="empty-title">No Study Rooms Available</h3>
                        <p className="empty-description">
                            Be the first to create a study room and invite others to learn together!
                        </p>
                        <Button variant="primary" icon={Plus}>
                            Create Your First Room
                        </Button>
                    </div>
                )}
            </main>
        </div>
    )
}

export default StudyRooms
