import { useRef, useEffect, useState, useCallback } from 'react'
import io from 'socket.io-client'

// ICE servers with STUN and multiple free TURN options
const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        {
            urls: 'turn:relay1.expressturn.com:3478',
            username: 'efM0OFPCLPVUPH26I6',
            credential: 'jtDT4yNWQqXt0bGC'
        },
        { urls: 'stun:numb.viagenie.ca' },
        {
            urls: 'turn:numb.viagenie.ca',
            username: 'webrtc@live.com',
            credential: 'muazkh'
        },
    ],
    iceCandidatePoolSize: 10
}

// Socket URL - assumes backend is running on port 3001 locally
// In production, this should be an environment variable
const SOCKET_URL = 'http://localhost:3001'

export function useWebRTC(roomId, userId, userName) {
    const [remoteStreams, setRemoteStreams] = useState({})
    const [connectionStatus, setConnectionStatus] = useState({})
    const [localStream, setLocalStream] = useState(null)
    const [socket, setSocket] = useState(null)

    const peerConnections = useRef({})
    const localStreamRef = useRef(null)
    const socketRef = useRef(null)

    // Initialize Socket connection
    useEffect(() => {
        if (!userId || !roomId) return

        console.log('Connecting to socket server...')
        const newSocket = io(SOCKET_URL)
        socketRef.current = newSocket
        setSocket(newSocket)

        newSocket.on('connect', () => {
            console.log('Socket connected:', newSocket.id)
            newSocket.emit('join-room', roomId, userId)
        })

        // Cleanup
        return () => {
            newSocket.disconnect()
        }
    }, [roomId, userId])

    // Update local stream ref
    const updateLocalStream = useCallback((stream) => {
        localStreamRef.current = stream
        setLocalStream(stream)

        // Add tracks to existing peer connections
        if (stream) {
            Object.keys(peerConnections.current).forEach(peerId => {
                const pc = peerConnections.current[peerId]
                if (pc.connectionState === 'closed') return

                const senders = pc.getSenders()

                stream.getTracks().forEach(track => {
                    const existingSender = senders.find(s => s.track?.kind === track.kind)
                    if (existingSender) {
                        existingSender.replaceTrack(track)
                    } else {
                        pc.addTrack(track, stream)
                    }
                })
            })
        }
    }, [])

    // Create a peer connection
    const createPeerConnection = useCallback((remoteSocketId, isInitiator = false) => {
        console.log(`Creating PeerConnection for ${remoteSocketId}`)

        const pc = new RTCPeerConnection(ICE_SERVERS)
        peerConnections.current[remoteSocketId] = pc

        setConnectionStatus(prev => ({ ...prev, [remoteSocketId]: 'connecting' }))

        // Add local tracks
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current)
            })
        }

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate && socketRef.current) {
                socketRef.current.emit('ice-candidate', {
                    candidate: event.candidate,
                    roomId,
                    to: remoteSocketId // In this simple mesh, we might broadcast or target specific socket
                })
            }
        }

        // Handle incoming tracks
        pc.ontrack = (event) => {
            console.log(`Received track from ${remoteSocketId}`)
            const [remoteStream] = event.streams
            if (remoteStream) {
                setRemoteStreams(prev => ({
                    ...prev,
                    [remoteSocketId]: {
                        stream: remoteStream,
                        // We might need to map socket ID to user data if we want names
                        // For now we use socket ID as identifier in streams
                        // If we need the actual user ID/Name, we'd need to send that in signaling
                    }
                }))
            }
        }

        // Connection state
        pc.onconnectionstatechange = () => {
            console.log(`Connection state with ${remoteSocketId}: ${pc.connectionState}`)
            setConnectionStatus(prev => ({
                ...prev,
                [remoteSocketId]: pc.connectionState
            }))

            if (pc.connectionState === 'failed') {
                // Retry logic could go here
            }
        }

        return pc
    }, [roomId])

    // Handle Socket Events
    useEffect(() => {
        if (!socket) return

        // 1. User Connected (Another user joined the room)
        socket.on('user-connected', async (newUserId) => {
            console.log(`User connected: ${newUserId}, initiating call`)
            // We initiate the call
            // Ideally we should know the socket ID of the user.
            // The current simple server setup broadcasts to room.
            // The 'call-user' event in server expects 'user' (userId) but primarily targets 'roomId'

            // To make this work properly with mesh topology + sockets:
            // When A joins:
            // Server notifies B.
            // B calls A.

            // Wait, usually the new joiner initiates? Or existing?
            // Let's say existing users call the new user.
            // But we need the new user's Socket ID to target them specifically or generic broadcast?
            // In the server implementation: socket.to(roomId).emit('user-connected', userId)

            // Actually, a better pattern for mesh is:
            // 1. New user joins.
            // 2. Existing users receive 'user-connected'.
            // 3. Existing users create Offer -> Send 'call-user' to Room (or specific socket if known).

            // NOTE: The server logic `socket.on('call-user')` broadcasts `call-made` to the ROOM.
            // This means EVERYONE receives the offer. We need to filter by target?
            // The current server logic doesn't have a 'to' field in 'call-user', it just broadcasts to room.
            // This works for 2 people. For >2, we need target socket IDs.
            // For now, assuming 2 people per room (from Requirement or limited scope), broadcast is okay.
            // But we must be careful not to process our own offer.

            const pc = createPeerConnection(newUserId, true) // treating userId as identifier
            const offer = await pc.createOffer()
            await pc.setLocalDescription(offer)

            socket.emit('call-user', {
                offer,
                roomId,
                user: userId // My user ID
            })
        })

        // 2. Transmit Offer (Called 'call-made' from server)
        socket.on('call-made', async (data) => {
            // data: { offer, socket, user }
            // If we are the one who sent it, ignore (server uses socket.to so sender shouldn't receive, but good to check)

            console.log('Received call-made (Offer)')
            const pc = createPeerConnection(data.socket, false) // Use socket ID or user ID?
            // The server sends 'socket' (the caller's socket ID). 
            // We should use that to reply with answer.

            await pc.setRemoteDescription(new RTCSessionDescription(data.offer))
            const answer = await pc.createAnswer()
            await pc.setLocalDescription(answer)

            socket.emit('make-answer', {
                answer,
                to: data.socket // Send back to caller's socket ID (server handles this)
            })

            // Store mapping if needed?
        })

        // 3. Receive Answer
        socket.on('answer-made', async (data) => {
            // data: { socket, answer }
            console.log('Received answer-made')
            const pc = peerConnections.current[data.socket]
            if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(data.answer))
            }
        })

        // 4. ICE Candidates
        socket.on('ice-candidate-received', async (data) => {
            // data: { candidate, socket }
            const pc = peerConnections.current[data.socket]
            if (pc) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(data.candidate))
                } catch (e) {
                    console.error('Error adding ice candidate', e)
                }
            }
        })

        return () => {
            socket.off('user-connected')
            socket.off('call-made')
            socket.off('answer-made')
            socket.off('ice-candidate-received')
        }
    }, [socket, roomId, userId, createPeerConnection])

    // Cleanup function
    const cleanup = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.disconnect()
        }
        Object.values(peerConnections.current).forEach(pc => pc.close())
        peerConnections.current = {}
        setRemoteStreams({})
    }, [])

    // Call participant wrapper (mostly auto-handled by join-room now, but kept for compatibility)
    const callParticipant = useCallback((remoteUserId) => {
        // With sockets, we usually auto-call on join. 
        // We can leave this empty or use it to force a call if needed.
        console.log('Manual call requested - handled by socket auto-join usually')
    }, [])

    const closeConnection = useCallback((id) => {
        // Cleanup specific connection
        if (peerConnections.current[id]) {
            peerConnections.current[id].close()
            delete peerConnections.current[id]
        }
    }, [])

    return {
        remoteStreams,
        connectionStatus,
        localStream,
        updateLocalStream,
        callParticipant, // kept for interface compatibility
        closeConnection,
        cleanup,
        socket // Expose socket for Chat component to use!
    }
}

export default useWebRTC
