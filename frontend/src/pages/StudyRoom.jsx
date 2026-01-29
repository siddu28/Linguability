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
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import './StudyRoom.css'

function StudyRoom() {
    const { roomId } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const localVideoRef = useRef(null)
    const [localStream, setLocalStream] = useState(null)

    // Room state
    const [roomData, setRoomData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Media controls state
    const [isAudioEnabled, setIsAudioEnabled] = useState(true)
    const [isVideoEnabled, setIsVideoEnabled] = useState(true)
    const [mediaError, setMediaError] = useState(null)

    // Participants state
    const [participants, setParticipants] = useState([])

    // Shared tasks state
    const [tasks, setTasks] = useState([])

    // Fetch room data
    const fetchRoomData = async () => {
        try {
            const { data, error } = await supabase
                .from('study_rooms')
                .select('*')
                .eq('id', roomId)
                .single()

            if (error) throw error
            if (!data) throw new Error('Room not found')

            setRoomData(data)
        } catch (err) {
            console.error('Error fetching room:', err)
            setError('Room not found or no longer available')
        }
    }

    // Fetch participants
    const fetchParticipants = async () => {
        try {
            const { data, error } = await supabase
                .from('room_participants')
                .select('*')
                .eq('room_id', roomId)

            if (error) throw error
            setParticipants(data || [])
        } catch (err) {
            console.error('Error fetching participants:', err)
        }
    }

    // Fetch tasks
    const fetchTasks = async () => {
        try {
            const { data, error } = await supabase
                .from('room_tasks')
                .select('*')
                .eq('room_id', roomId)
                .order('created_at', { ascending: true })

            if (error) throw error
            setTasks(data || [])
        } catch (err) {
            console.error('Error fetching tasks:', err)
        }
    }

    // Join room (add participant)
    const joinRoom = async () => {
        if (!user) return

        try {
            // Get user profile name or use email
            const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous'

            const { error } = await supabase
                .from('room_participants')
                .upsert({
                    room_id: roomId,
                    user_id: user.id,
                    user_name: userName,
                    is_audio_enabled: isAudioEnabled,
                    is_video_enabled: isVideoEnabled
                }, {
                    onConflict: 'room_id,user_id'
                })

            if (error) throw error
        } catch (err) {
            console.error('Error joining room:', err)
        }
    }

    // Leave room (remove participant)
    const leaveRoomFromDb = async () => {
        if (!user) return

        try {
            const { error } = await supabase
                .from('room_participants')
                .delete()
                .eq('room_id', roomId)
                .eq('user_id', user.id)

            if (error) throw error
        } catch (err) {
            console.error('Error leaving room:', err)
        }
    }

    // Initialize room
    useEffect(() => {
        const initRoom = async () => {
            setLoading(true)
            await fetchRoomData()
            await fetchParticipants()
            await fetchTasks()
            await joinRoom()
            setLoading(false)
        }

        initRoom()

        // Subscribe to participants changes
        const participantsSubscription = supabase
            .channel(`room_${roomId}_participants`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'room_participants',
                    filter: `room_id=eq.${roomId}`
                },
                (payload) => {
                    console.log('Participant change:', payload)
                    fetchParticipants()
                }
            )
            .subscribe()

        // Subscribe to tasks changes
        const tasksSubscription = supabase
            .channel(`room_${roomId}_tasks`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'room_tasks',
                    filter: `room_id=eq.${roomId}`
                },
                (payload) => {
                    console.log('Task change:', payload)
                    fetchTasks()
                }
            )
            .subscribe()

        // Cleanup on unmount
        return () => {
            leaveRoomFromDb()
            supabase.removeChannel(participantsSubscription)
            supabase.removeChannel(tasksSubscription)
        }
    }, [roomId, user])

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

    // Toggle audio
    const toggleAudio = async () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0]
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled
                setIsAudioEnabled(audioTrack.enabled)

                // Update in database
                if (user) {
                    await supabase
                        .from('room_participants')
                        .update({ is_audio_enabled: audioTrack.enabled })
                        .eq('room_id', roomId)
                        .eq('user_id', user.id)
                }
            }
        }
    }

    // Toggle video
    const toggleVideo = async () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0]
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled
                setIsVideoEnabled(videoTrack.enabled)

                // Update in database
                if (user) {
                    await supabase
                        .from('room_participants')
                        .update({ is_video_enabled: videoTrack.enabled })
                        .eq('room_id', roomId)
                        .eq('user_id', user.id)
                }
            }
        }
    }

    // Leave room
    const leaveRoom = async () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop())
        }
        await leaveRoomFromDb()
        navigate('/study-rooms')
    }

    // Task handlers
    const handleAddTask = async (text) => {
        if (!user) return

        try {
            const { error } = await supabase
                .from('room_tasks')
                .insert({
                    room_id: roomId,
                    text,
                    created_by: user.id,
                    is_completed: false
                })

            if (error) throw error
            // Real-time subscription will update the tasks
        } catch (err) {
            console.error('Error adding task:', err)
        }
    }

    const handleToggleTask = async (taskId) => {
        const task = tasks.find(t => t.id === taskId)
        if (!task || !user) return

        try {
            const { error } = await supabase
                .from('room_tasks')
                .update({
                    is_completed: !task.is_completed,
                    completed_by: !task.is_completed ? user.id : null,
                    completed_at: !task.is_completed ? new Date().toISOString() : null
                })
                .eq('id', taskId)

            if (error) throw error
            // Real-time subscription will update the tasks
        } catch (err) {
            console.error('Error toggling task:', err)
        }
    }

    // Transform tasks for TaskList component
    const transformedTasks = tasks.map(task => ({
        id: task.id,
        text: task.text,
        completed: task.is_completed
    }))

    // Loading state
    if (loading) {
        return (
            <div className="study-room-page">
                <Navbar />
                <main className="study-room-content">
                    <div className="loading-state">
                        <p>Loading room...</p>
                    </div>
                </main>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="study-room-page">
                <Navbar />
                <main className="study-room-content">
                    <div className="error-state">
                        <p>{error}</p>
                        <button onClick={() => navigate('/study-rooms')}>
                            Back to Study Rooms
                        </button>
                    </div>
                </main>
            </div>
        )
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
                        <h1 className="room-title">{roomData?.name || 'Study Session'}</h1>
                        <span className="room-id">Room ID: {roomId?.slice(0, 8)}...</span>
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
                                    <span>You</span>
                                    {!isAudioEnabled && <MicOff size={14} />}
                                </div>
                            </div>

                            {/* Other participants placeholders */}
                            {participants
                                .filter(p => p.user_id !== user?.id)
                                .map((participant) => (
                                    <div key={participant.id} className="video-container">
                                        <div className="video-placeholder">
                                            <User size={48} />
                                            <span>{participant.user_name}</span>
                                        </div>
                                        <div className="video-label">
                                            <span>{participant.user_name}</span>
                                            {!participant.is_audio_enabled && <MicOff size={14} />}
                                        </div>
                                    </div>
                                ))
                            }

                            {/* Waiting for others message */}
                            {participants.length <= 1 && (
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
                            tasks={transformedTasks}
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
                                    {participant.user_name}
                                    {participant.user_id === user?.id && ' (You)'}
                                </span>
                                {!participant.is_audio_enabled && (
                                    <MicOff size={14} className="participant-muted" />
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </main>
        </div>
    )
}

export default StudyRoom
