import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Users, Video, X } from 'lucide-react'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import Button from '../components/Button'
import './StudyRooms.css'

function StudyRooms() {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [newRoomName, setNewRoomName] = useState('')
    const [newRoomDescription, setNewRoomDescription] = useState('')

    // Load rooms from localStorage
    const [rooms, setRooms] = useState(() => {
        const stored = localStorage.getItem('studyRooms')
        return stored ? JSON.parse(stored) : []
    })

    // Save rooms to localStorage when changed
    useEffect(() => {
        localStorage.setItem('studyRooms', JSON.stringify(rooms))
    }, [rooms])

    const filteredRooms = rooms.filter(room =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleCreateRoom = (e) => {
        e.preventDefault()
        if (!newRoomName.trim()) return

        const newRoom = {
            id: `room-${Date.now()}`,
            name: newRoomName.trim(),
            description: newRoomDescription.trim() || 'A study session',
            participants: 0,
            maxParticipants: 10,
            createdAt: new Date().toISOString()
        }

        setRooms([...rooms, newRoom])
        setNewRoomName('')
        setNewRoomDescription('')
        setShowCreateModal(false)

        // Navigate to the new room
        navigate(`/study-rooms/${newRoom.id}`)
    }

    const handleJoinRoom = (roomId) => {
        navigate(`/study-rooms/${roomId}`)
    }

    const handleOpenCreateModal = () => {
        setShowCreateModal(true)
    }

    const handleCloseModal = () => {
        setShowCreateModal(false)
        setNewRoomName('')
        setNewRoomDescription('')
    }

    return (
        <div className="study-rooms-page">
            <Navbar />

            <main className="study-rooms-content">
                <div className="study-rooms-header">
                    <div>
                        <h1 className="study-rooms-title">Study Rooms</h1>
                        <p className="study-rooms-subtitle">Learn together with other students in real-time</p>
                    </div>
                    <Button variant="primary" icon={Plus} onClick={handleOpenCreateModal}>
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
                        aria-label="Search study rooms"
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
                                <p className="room-topic">{room.description}</p>

                                <Button
                                    variant="primary"
                                    className="join-btn"
                                    onClick={() => handleJoinRoom(room.id)}
                                >
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
                        <Button variant="primary" icon={Plus} onClick={handleOpenCreateModal}>
                            Create Your First Room
                        </Button>
                    </div>
                )}
            </main>

            {/* Create Room Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Create Study Room</h2>
                            <button
                                className="modal-close-btn"
                                onClick={handleCloseModal}
                                aria-label="Close modal"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateRoom} className="modal-form">
                            <div className="form-group">
                                <label htmlFor="room-name" className="form-label">
                                    Room Name
                                </label>
                                <input
                                    type="text"
                                    id="room-name"
                                    value={newRoomName}
                                    onChange={(e) => setNewRoomName(e.target.value)}
                                    placeholder="e.g., Spanish Vocabulary Study"
                                    className="form-input"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="room-description" className="form-label">
                                    Description (optional)
                                </label>
                                <input
                                    type="text"
                                    id="room-description"
                                    value={newRoomDescription}
                                    onChange={(e) => setNewRoomDescription(e.target.value)}
                                    placeholder="e.g., Practicing Chapter 5 vocabulary"
                                    className="form-input"
                                />
                            </div>

                            <div className="modal-actions">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleCloseModal}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    icon={Video}
                                    disabled={!newRoomName.trim()}
                                >
                                    Create and Join
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default StudyRooms
