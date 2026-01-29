import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    ArrowLeft,
    Mic,
    MicOff,
    Video,
    VideoOff,
    LogOut,
    Users,
    User
} from 'lucide-react'
import Navbar from '../components/Navbar'
import TaskList from '../components/TaskList'
import './StudyRoom.css'

function StudyRoom() {
    const { roomId } = useParams()
    const navigate = useNavigate()
    const localVideoRef = useRef(null)
    const [localStream, setLocalStream] = useState(null)

    // Room state
    const [roomData, setRoomData] = useState({
        id: roomId,
        name: 'Study Session',
        participants: []
    })

    // Media controls state
    const [isAudioEnabled, setIsAudioEnabled] = useState(true)
    const [isVideoEnabled, setIsVideoEnabled] = useState(true)
    const [mediaError, setMediaError] = useState(null)

    // Current user (mock)
    const currentUser = {
        id: 'user-1',
        name: 'You'
    }

    // Mock participants for demo
    const [participants, setParticipants] = useState([
        { id: 'user-1', name: 'You', isLocal: true }
    ])

    // Shared tasks state
    const [tasks, setTasks] = useState([
        { id: '1', text: 'Review vocabulary list', completed: false },
        { id: '2', text: 'Practice pronunciation', completed: false },
        { id: '3', text: 'Complete reading exercise', completed: true }
    ])

    // Initialize media stream
    useEffect(() => {
        async function initializeMedia() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                })
                setLocalStream(stream)
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream
                }
            } catch (error) {
                console.error('Error accessing media devices:', error)
                setMediaError('Could not access camera or microphone. Please check permissions.')
            }
        }

        initializeMedia()

        // Cleanup on unmount
        return () => {
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop())
            }
        }
    }, [])

    // Update video element when stream changes
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream
        }
    }, [localStream])

    // Load room data from localStorage (set by StudyRooms page)
    useEffect(() => {
        const storedRooms = localStorage.getItem('studyRooms')
        if (storedRooms) {
            const rooms = JSON.parse(storedRooms)
            const room = rooms.find(r => r.id === roomId)
            if (room) {
                setRoomData(room)
            }
        }
    }, [roomId])

    // Toggle audio
    const toggleAudio = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0]
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled
                setIsAudioEnabled(audioTrack.enabled)
            }
        }
    }

    // Toggle video
    const toggleVideo = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0]
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled
                setIsVideoEnabled(videoTrack.enabled)
            }
        }
    }

    // Leave room
    const leaveRoom = () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop())
        }
        navigate('/study-rooms')
    }

    // Task handlers
    const handleAddTask = (text) => {
        const newTask = {
            id: Date.now().toString(),
            text,
            completed: false
        }
        setTasks([...tasks, newTask])
    }

    const handleToggleTask = (taskId) => {
        setTasks(tasks.map(task =>
            task.id === taskId
                ? { ...task, completed: !task.completed }
                : task
        ))
    }

    return (
        <div className="study-room-page">
            <Navbar />

            <main className="study-room-content">
                {/* Header */}
                <div className="study-room-header">
                    <button
                        className="back-button"
                        onClick={() => navigate('/study-rooms')}
                        aria-label="Back to study rooms"
                    >
                        <ArrowLeft size={20} />
                        <span>Back to Rooms</span>
                    </button>
                    <div className="room-info">
                        <h1 className="room-title">{roomData.name}</h1>
                        <span className="room-id">Room ID: {roomId}</span>
                    </div>
                    <div className="participants-count">
                        <Users size={18} />
                        <span>{participants.length} Participant{participants.length !== 1 ? 's' : ''}</span>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="study-room-main">
                    {/* Video Section */}
                    <div className="video-section">
                        {/* Video Grid */}
                        <div className="video-grid">
                            {/* Local Video */}
                            <div className="video-container local">
                                {mediaError ? (
                                    <div className="video-placeholder error">
                                        <p>{mediaError}</p>
                                    </div>
                                ) : !isVideoEnabled ? (
                                    <div className="video-placeholder">
                                        <User size={48} />
                                        <span>Camera Off</span>
                                    </div>
                                ) : (
                                    <video
                                        ref={localVideoRef}
                                        autoPlay
                                        muted
                                        playsInline
                                        className="video-element"
                                    />
                                )}
                                <div className="video-label">
                                    <span>{currentUser.name}</span>
                                    {!isAudioEnabled && <MicOff size={14} />}
                                </div>
                            </div>

                            {/* Placeholder for other participants */}
                            {participants.length === 1 && (
                                <div className="video-container waiting">
                                    <div className="video-placeholder">
                                        <Users size={48} />
                                        <span>Waiting for others to join...</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Control Bar */}
                        <div className="control-bar">
                            <button
                                className={`control-btn ${!isAudioEnabled ? 'off' : ''}`}
                                onClick={toggleAudio}
                                aria-label={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
                            >
                                {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                                <span>{isAudioEnabled ? 'Mute' : 'Unmute'}</span>
                            </button>

                            <button
                                className={`control-btn ${!isVideoEnabled ? 'off' : ''}`}
                                onClick={toggleVideo}
                                aria-label={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
                            >
                                {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                                <span>{isVideoEnabled ? 'Camera Off' : 'Camera On'}</span>
                            </button>

                            <button
                                className="control-btn leave"
                                onClick={leaveRoom}
                                aria-label="Leave room"
                            >
                                <LogOut size={20} />
                                <span>Leave Room</span>
                            </button>
                        </div>
                    </div>

                    {/* Task List Section */}
                    <div className="task-section">
                        <TaskList
                            tasks={tasks}
                            onAddTask={handleAddTask}
                            onToggleTask={handleToggleTask}
                        />
                    </div>
                </div>

                {/* Participants Panel */}
                <div className="participants-panel">
                    <h3 className="participants-title">
                        <Users size={18} />
                        <span>Participants</span>
                    </h3>
                    <ul className="participants-list">
                        {participants.map((participant) => (
                            <li key={participant.id} className="participant-item">
                                <div className="participant-avatar">
                                    <User size={16} />
                                </div>
                                <span className="participant-name">
                                    {participant.name}
                                    {participant.isLocal && ' (You)'}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </main>
        </div>
    )
}

export default StudyRoom
