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
    Trash2,
    Wifi,
    WifiOff
} from 'lucide-react'
import Navbar from '../components/Navbar'
import TaskList from '../components/TaskList'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import useWebRTC from '../hooks/useWebRTC'
import './StudyRoom.css'

function StudyRoom() {
    const { roomId } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const localVideoRef = useRef(null)
    const remoteVideoRefs = useRef({})

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

    // WebRTC
    const {
        remoteStreams,
        connectionStatus,
        localStream,
        updateLocalStream,
        callParticipant,
        closeConnection,
        cleanup: cleanupWebRTC
    } = useWebRTC(
        roomId,
        user?.id,
        user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Anonymous'
    )

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
            return data || []
        } catch (err) {
            console.error('Error fetching participants:', err)
            return []
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
            cleanupWebRTC()

            if (localStream) {
                localStream.getTracks().forEach(track => track.stop())
            }

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

        // Subscribe to room deletion
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
                    event: 'INSERT',
                    schema: 'public',
                    table: 'room_participants',
                    filter: `room_id=eq.${roomId}`
                },
                (payload) => {
                    const newParticipant = payload.new
                    console.log('New participant joined:', newParticipant.user_name)
                    // Call new participant if we have a stream
                    if (newParticipant.user_id !== user?.id && localStream) {
                        console.log('Calling new participant')
                        callParticipant(newParticipant.user_id, newParticipant.user_name)
                    }
                    fetchParticipants()
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'room_participants',
                    filter: `room_id=eq.${roomId}`
                },
                (payload) => {
                    const leftParticipant = payload.old
                    console.log('Participant left:', leftParticipant.user_id)
                    if (leftParticipant.user_id !== user?.id) {
                        closeConnection(leftParticipant.user_id)
                    }
                    fetchParticipants()
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
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

        return () => {
            leaveRoomFromDb()
            cleanupWebRTC()
            supabase.removeChannel(roomSubscription)
            supabase.removeChannel(participantsSubscription)
            supabase.removeChannel(tasksSubscription)
        }
    }, [roomId, user])

    // Initialize media stream
    useEffect(() => {
        let mounted = true

        async function initializeMedia() {
            try {
                console.log('Requesting media access...')
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                })

                if (!mounted) {
                    stream.getTracks().forEach(track => track.stop())
                    return
                }

                console.log('Media stream obtained, updating WebRTC hook')

                // Update the WebRTC hook with the stream
                updateLocalStream(stream)
                setStreamReady(true)

                // Set local video
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
        }
    }, [updateLocalStream])

    // Call existing participants when stream is ready
    useEffect(() => {
        if (!localStream || !user) return

        const callExistingParticipants = async () => {
            const currentParticipants = await fetchParticipants()
            const otherParticipants = currentParticipants.filter(p => p.user_id !== user.id)

            console.log(`Calling ${otherParticipants.length} existing participants`)
            for (const participant of otherParticipants) {
                callParticipant(participant.user_id, participant.user_name)
            }
        }

        // Small delay to ensure signaling is set up
        const timer = setTimeout(callExistingParticipants, 1000)
        return () => clearTimeout(timer)
    }, [localStream, user, fetchParticipants, callParticipant])

    // Update local video when stream changes
    useEffect(() => {
        if (localVideoRef.current && localStream && isVideoEnabled) {
            localVideoRef.current.srcObject = localStream
            localVideoRef.current.play().catch(console.error)
        }
    }, [localStream, isVideoEnabled])

    // Attach remote streams to video elements
    useEffect(() => {
        Object.entries(remoteStreams).forEach(([oderId, { stream }]) => {
            const videoElement = remoteVideoRefs.current[oderId]
            if (videoElement && stream && videoElement.srcObject !== stream) {
                console.log('Attaching remote stream for', oderId)
                videoElement.srcObject = stream
                videoElement.play().catch(console.error)
            }
        })
    }, [remoteStreams])

    // Toggle audio
    const toggleAudio = async () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0]
            if (audioTrack) {
                const newState = !audioTrack.enabled
                audioTrack.enabled = newState
                setIsAudioEnabled(newState)

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

    // Toggle video
    const toggleVideo = async () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0]
            if (videoTrack) {
                const newState = !isVideoEnabled
                videoTrack.enabled = newState
                setIsVideoEnabled(newState)

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
        cleanupWebRTC()
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

    // Get other participants
    const otherParticipants = participants.filter(p => p.user_id !== user?.id)

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
                            {/* Local Video */}
                            <div className="video-container local">
                                {mediaError ? (
                                    <div className="video-placeholder error">
                                        <p>{mediaError}</p>
                                    </div>
                                ) : (
                                    <>
                                        <video
                                            ref={localVideoRef}
                                            autoPlay
                                            muted
                                            playsInline
                                            className={`video-element ${!isVideoEnabled ? 'hidden' : ''}`}
                                        />
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

                            {/* Remote participants */}
                            {otherParticipants.map((participant) => {
                                const remoteData = remoteStreams[participant.user_id]
                                const status = connectionStatus[participant.user_id]
                                const isConnected = status === 'connected'
                                const hasStream = remoteData?.stream

                                return (
                                    <div key={participant.id} className="video-container remote">
                                        {hasStream ? (
                                            <>
                                                <video
                                                    ref={el => remoteVideoRefs.current[participant.user_id] = el}
                                                    autoPlay
                                                    playsInline
                                                    className={`video-element ${!participant.is_video_enabled ? 'hidden' : ''}`}
                                                />
                                                {!participant.is_video_enabled && (
                                                    <div className="video-placeholder camera-off remote-user">
                                                        <User size={48} />
                                                        <span className="remote-user-name">{participant.user_name}</span>
                                                        <span className="remote-user-status">Camera Off</span>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className={`video-placeholder remote-user ${status === 'connecting' || status === 'new' ? 'connecting' : ''}`}>
                                                <User size={48} />
                                                <span className="remote-user-name">{participant.user_name}</span>
                                                <span className="remote-user-status">
                                                    {status === 'connecting' || status === 'new' ? (
                                                        <>
                                                            <Wifi size={14} className="pulse" />
                                                            Connecting...
                                                        </>
                                                    ) : status === 'failed' ? (
                                                        <>
                                                            <WifiOff size={14} />
                                                            Connection failed
                                                            <button
                                                                className="retry-btn"
                                                                onClick={() => {
                                                                    closeConnection(participant.user_id)
                                                                    setTimeout(() => callParticipant(participant.user_id, participant.user_name), 500)
                                                                }}
                                                            >
                                                                Retry
                                                            </button>
                                                        </>
                                                    ) : status === 'disconnected' ? (
                                                        <>
                                                            <WifiOff size={14} />
                                                            Disconnected — reconnecting...
                                                        </>
                                                    ) : (
                                                        <>Waiting to connect...</>
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                        <div className="video-label">
                                            <span>{participant.user_name}</span>
                                            {!participant.is_audio_enabled && <MicOff size={14} />}
                                            {!participant.is_video_enabled && <VideoOff size={14} />}
                                            {isConnected && <Wifi size={14} className="connected" />}
                                        </div>
                                    </div>
                                )
                            })}

                            {/* Waiting for others */}
                            {otherParticipants.length === 0 && (
                                <div className="video-container waiting">
                                    <div className="video-placeholder">
                                        <Users size={48} />
                                        <span>Waiting for others to join...</span>
                                        <span className="share-hint">Share this room from the Study Rooms page</span>
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
                        {participants.map((participant) => {
                            const status = connectionStatus[participant.user_id]
                            const isConnected = status === 'connected'
                            const isMe = participant.user_id === user?.id

                            return (
                                <li key={participant.id} className="participant-item">
                                    <div className="participant-avatar">
                                        <User size={16} />
                                    </div>
                                    <span className="participant-name">
                                        {participant.user_name}
                                        {isMe && ' (You)'}
                                        {participant.user_id === roomData?.created_by && ' · Host'}
                                    </span>
                                    <div className="participant-status">
                                        {!participant.is_audio_enabled && (
                                            <MicOff size={14} className="status-icon muted" />
                                        )}
                                        {!participant.is_video_enabled && (
                                            <VideoOff size={14} className="status-icon" />
                                        )}
                                        {!isMe && isConnected && (
                                            <Wifi size={14} className="status-icon connected" />
                                        )}
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </main>
        </div>
    )
}

export default StudyRoom
