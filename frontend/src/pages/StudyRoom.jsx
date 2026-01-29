import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    ArrowLeft,
    Mic,
    MicOff,
    Video,
    VideoOff,
    LogOut,
    Users,
    User,
    Trash2
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
    const streamRef = useRef(null)

    // Room state
    const [roomData, setRoomData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isCreator, setIsCreator] = useState(false)

    // Media controls state
    const [isAudioEnabled, setIsAudioEnabled] = useState(true)
    const [isVideoEnabled, setIsVideoEnabled] = useState(true)
    const [mediaError, setMediaError] = useState(null)
    const [streamReady, setStreamReady] = useState(false)

    // Participants state
    const [participants, setParticipants] = useState([])

    // Shared tasks state
    const [tasks, setTasks] = useState([])

    // Fetch room data
    const fetchRoomData = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('study_rooms')
                .select('*')
                .eq('id', roomId)
                .single()

            if (error) throw error
            if (!data) throw new Error('Room not found')

            setRoomData(data)
            setIsCreator(data.created_by === user?.id)
        } catch (err) {
            console.error('Error fetching room:', err)
            setError('Room not found or no longer available')
        }
    }, [roomId, user?.id])

    // Fetch participants
    const fetchParticipants = useCallback(async () => {
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
    }, [roomId])

    // Fetch tasks
    const fetchTasks = useCallback(async () => {
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
    }, [roomId])

    // Join room (add participant)
    const joinRoom = useCallback(async () => {
        if (!user) return

        try {
            const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous'

            const { error } = await supabase
                .from('room_participants')
                .upsert({
                    room_id: roomId,
                    user_id: user.id,
                    user_name: userName,
                    is_audio_enabled: true,
                    is_video_enabled: true
                }, {
                    onConflict: 'room_id,user_id'
                })

            if (error) throw error
        } catch (err) {
            console.error('Error joining room:', err)
        }
    }, [roomId, user])

    // Leave room (remove participant)
    const leaveRoomFromDb = useCallback(async () => {
        if (!user) return

        try {
            await supabase
                .from('room_participants')
                .delete()
                .eq('room_id', roomId)
                .eq('user_id', user.id)
        } catch (err) {
            console.error('Error leaving room:', err)
        }
    }, [roomId, user])

    // Delete room (only for creator)
    const deleteRoom = async () => {
        if (!user || !isCreator) return

        const confirmDelete = window.confirm('Are you sure you want to delete this room? All participants will be removed.')
        if (!confirmDelete) return

        try {
            // Stop local media
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop())
            }

            // Delete the room (cascades to participants and tasks)
            const { error } = await supabase
                .from('study_rooms')
                .delete()
                .eq('id', roomId)

            if (error) throw error

            navigate('/study-rooms')
        } catch (err) {
            console.error('Error deleting room:', err)
            alert('Failed to delete room')
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

        if (user) {
            initRoom()
        }

        // Subscribe to room changes (for deletion detection)
        const roomSubscription = supabase
            .channel(`room_${roomId}_data`)
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'study_rooms',
                    filter: `id=eq.${roomId}`
                },
                () => {
                    alert('This room has been deleted by the host.')
                    navigate('/study-rooms')
                }
            )
            .subscribe()

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
                () => {
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
                () => {
                    fetchTasks()
                }
            )
            .subscribe()

        // Cleanup on unmount
        return () => {
            leaveRoomFromDb()
            supabase.removeChannel(roomSubscription)
            supabase.removeChannel(participantsSubscription)
            supabase.removeChannel(tasksSubscription)
        }
    }, [roomId, user, fetchRoomData, fetchParticipants, fetchTasks, joinRoom, leaveRoomFromDb, navigate])

    // Initialize media stream
    useEffect(() => {
        let mounted = true

        async function initializeMedia() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                })

                if (!mounted) {
                    stream.getTracks().forEach(track => track.stop())
                    return
                }

                streamRef.current = stream
                setStreamReady(true)

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream
                    localVideoRef.current.play().catch(console.error)
                }
            } catch (error) {
                console.error('Error accessing media devices:', error)
                if (mounted) {
                    setMediaError('Could not access camera or microphone. Please check permissions.')
                }
            }
        }

        initializeMedia()

        return () => {
            mounted = false
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop())
                streamRef.current = null
            }
        }
    }, [])

    // Re-attach stream when video ref is available
    useEffect(() => {
        if (localVideoRef.current && streamRef.current && isVideoEnabled) {
            localVideoRef.current.srcObject = streamRef.current
            localVideoRef.current.play().catch(console.error)
        }
    }, [isVideoEnabled, streamReady])

    // Toggle audio
    const toggleAudio = async () => {
        if (streamRef.current) {
            const audioTrack = streamRef.current.getAudioTracks()[0]
            if (audioTrack) {
                const newState = !audioTrack.enabled
                audioTrack.enabled = newState
                setIsAudioEnabled(newState)

                // Update in database
                if (user) {
                    await supabase
                        .from('room_participants')
                        .update({ is_audio_enabled: newState })
                        .eq('room_id', roomId)
                        .eq('user_id', user.id)
                }
            }
        }
    }

    // Toggle video - keeping track enabled but hiding video element
    const toggleVideo = async () => {
        if (streamRef.current) {
            const videoTrack = streamRef.current.getVideoTracks()[0]
            if (videoTrack) {
                const newState = !isVideoEnabled
                videoTrack.enabled = newState
                setIsVideoEnabled(newState)

                // Update in database
                if (user) {
                    await supabase
                        .from('room_participants')
                        .update({ is_video_enabled: newState })
                        .eq('room_id', roomId)
                        .eq('user_id', user.id)
                }
            }
        }
    }

    // Leave room
    const leaveRoom = async () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
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
                    <div className="header-actions">
                        <div className="participants-count">
                            <Users size={18} />
                            <span>{participants.length} Participant{participants.length !== 1 ? 's' : ''}</span>
                        </div>
                        {isCreator && (
                            <button
                                className="delete-room-btn"
                                onClick={deleteRoom}
                                aria-label="Delete room"
                            >
                                <Trash2 size={18} />
                                <span>Delete Room</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="study-room-main">
                    {/* Video Section */}
                    <div className="video-section">
                        {/* Video Grid */}
                        <div className="video-grid">
                            {/* Local Video - Always mount video element */}
                            <div className="video-container local">
                                {mediaError ? (
                                    <div className="video-placeholder error">
                                        <p>{mediaError}</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Video element - hidden when camera off */}
                                        <video
                                            ref={localVideoRef}
                                            autoPlay
                                            muted
                                            playsInline
                                            className={`video-element ${!isVideoEnabled ? 'hidden' : ''}`}
                                        />
                                        {/* Placeholder shown when camera off */}
                                        {!isVideoEnabled && (
                                            <div className="video-placeholder camera-off">
                                                <User size={48} />
                                                <span>Camera Off</span>
                                            </div>
                                        )}
                                    </>
                                )}
                                <div className="video-label">
                                    <span>You</span>
                                    {!isAudioEnabled && <MicOff size={14} />}
                                </div>
                            </div>

                            {/* Other participants */}
                            {participants
                                .filter(p => p.user_id !== user?.id)
                                .map((participant) => (
                                    <div key={participant.id} className="video-container remote">
                                        <div className="video-placeholder remote-user">
                                            <User size={48} />
                                            <span className="remote-user-name">{participant.user_name}</span>
                                            <span className="remote-user-status">
                                                {participant.is_video_enabled ? 'Video On' : 'Camera Off'}
                                            </span>
                                        </div>
                                        <div className="video-label">
                                            <span>{participant.user_name}</span>
                                            {!participant.is_audio_enabled && <MicOff size={14} />}
                                            {!participant.is_video_enabled && <VideoOff size={14} />}
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
                                        <span className="share-hint">Share this room from the Study Rooms page</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* WebRTC Notice */}
                        {participants.length > 1 && (
                            <div className="webrtc-notice">
                                <p>
                                    <strong>Note:</strong> Real-time video streaming between participants requires a WebRTC signaling server.
                                    Currently showing participant presence and status. Full video calls require additional infrastructure.
                                </p>
                            </div>
                        )}

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
                                    {participant.user_id === roomData?.created_by && ' · Host'}
                                </span>
                                <div className="participant-status">
                                    {!participant.is_audio_enabled && (
                                        <MicOff size={14} className="status-icon muted" />
                                    )}
                                    {!participant.is_video_enabled && (
                                        <VideoOff size={14} className="status-icon" />
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </main>
        </div>
    )
}

export default StudyRoom
