import { useRef, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

// ICE servers with STUN and TURN for NAT traversal
// TURN servers relay media when direct connection fails (symmetric NAT)
const ICE_SERVERS = {
    iceServers: [
        // Google STUN servers
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        // Open Relay TURN servers (free, community-provided)
        {
            urls: 'turn:openrelay.metered.ca:80',
            username: 'openrelayproject',
            credential: 'openrelayproject'
        },
        {
            urls: 'turn:openrelay.metered.ca:443',
            username: 'openrelayproject',
            credential: 'openrelayproject'
        },
        {
            urls: 'turn:openrelay.metered.ca:443?transport=tcp',
            username: 'openrelayproject',
            credential: 'openrelayproject'
        },
        // Twilio TURN (free tier)
        {
            urls: 'turn:global.turn.twilio.com:3478?transport=udp',
            username: '5c21d6b37b1b3c2d9b93c2b9c2d3e4f5',
            credential: 'ZC7P4mJk3L8tH2vN5qR8sW1xY4cB7kM0'
        }
    ],
    iceCandidatePoolSize: 10
}

export function useWebRTC(roomId, userId, userName) {
    const [remoteStreams, setRemoteStreams] = useState({})
    const [connectionStatus, setConnectionStatus] = useState({})
    const [localStream, setLocalStream] = useState(null)

    const peerConnections = useRef({})
    const pendingCandidates = useRef({})
    const channelRef = useRef(null)
    const localStreamRef = useRef(null)

    // Update local stream ref
    const updateLocalStream = useCallback((stream) => {
        localStreamRef.current = stream
        setLocalStream(stream)

        // Add tracks to existing peer connections
        if (stream) {
            Object.keys(peerConnections.current).forEach(peerId => {
                const pc = peerConnections.current[peerId]
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

    // Send signaling data via Supabase
    const sendSignal = useCallback(async (data) => {
        try {
            console.log(`Sending ${data.type} signal from ${userId} to ${data.to}`)
            const { error } = await supabase.from('webrtc_signals').insert({
                room_id: roomId,
                from_user: userId,
                to_user: data.to,
                signal_type: data.type,
                signal_data: JSON.stringify(data.payload),
                created_at: new Date().toISOString()
            })
            if (error) {
                console.error('Error sending signal:', error)
            }
        } catch (error) {
            console.error('Error sending signal:', error)
        }
    }, [roomId, userId])

    // Create a peer connection for a specific user
    const createPeerConnection = useCallback((remoteUserId, remoteUserName) => {
        // Return existing connection if available and not closed
        const existingPc = peerConnections.current[remoteUserId]
        if (existingPc && existingPc.connectionState !== 'closed' && existingPc.connectionState !== 'failed') {
            return existingPc
        }

        console.log(`Creating new peer connection for ${remoteUserName} (${remoteUserId})`)

        const pc = new RTCPeerConnection(ICE_SERVERS)
        peerConnections.current[remoteUserId] = pc

        // Set initial status
        setConnectionStatus(prev => ({
            ...prev,
            [remoteUserId]: 'new'
        }))

        // Add local tracks to the connection if stream exists
        if (localStreamRef.current) {
            console.log('Adding local tracks to peer connection')
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current)
            })
        }

        // Handle incoming remote tracks
        pc.ontrack = (event) => {
            console.log(`Received remote track from ${remoteUserName}:`, event.track.kind)
            const [remoteStream] = event.streams
            if (remoteStream) {
                setRemoteStreams(prev => ({
                    ...prev,
                    [remoteUserId]: {
                        stream: remoteStream,
                        userName: remoteUserName
                    }
                }))
            }
        }

        // Handle ICE candidates
        pc.onicecandidate = async (event) => {
            if (event.candidate) {
                console.log('Sending ICE candidate to', remoteUserId)
                await sendSignal({
                    type: 'ice-candidate',
                    payload: event.candidate.toJSON(),
                    to: remoteUserId
                })
            }
        }

        // Handle connection state changes
        pc.onconnectionstatechange = () => {
            console.log(`Connection state with ${remoteUserName}: ${pc.connectionState}`)
            setConnectionStatus(prev => ({
                ...prev,
                [remoteUserId]: pc.connectionState
            }))

            if (pc.connectionState === 'failed') {
                console.log('Connection failed, closing peer connection')
                pc.close()
            }
        }

        // Handle ICE connection state
        pc.oniceconnectionstatechange = () => {
            console.log(`ICE state with ${remoteUserName}: ${pc.iceConnectionState}`)
        }

        // Handle ICE gathering state
        pc.onicegatheringstatechange = () => {
            console.log(`ICE gathering state: ${pc.iceGatheringState}`)
        }

        // Handle negotiation needed
        pc.onnegotiationneeded = async () => {
            console.log('Negotiation needed for', remoteUserId)
        }

        return pc
    }, [sendSignal])

    // Handle incoming offer
    const handleOffer = useCallback(async (fromUserId, fromUserName, offer) => {
        console.log(`Handling offer from ${fromUserName}`)

        const pc = createPeerConnection(fromUserId, fromUserName)

        try {
            // Check if we already have a remote description
            if (pc.signalingState !== 'stable' && pc.signalingState !== 'have-local-offer') {
                console.log('Ignoring offer, signaling state:', pc.signalingState)
                return
            }

            await pc.setRemoteDescription(new RTCSessionDescription(offer))
            console.log('Remote description set successfully')

            // Apply any pending ICE candidates
            if (pendingCandidates.current[fromUserId]) {
                console.log(`Applying ${pendingCandidates.current[fromUserId].length} pending ICE candidates`)
                for (const candidate of pendingCandidates.current[fromUserId]) {
                    try {
                        await pc.addIceCandidate(new RTCIceCandidate(candidate))
                    } catch (e) {
                        console.error('Error adding pending ICE candidate:', e)
                    }
                }
                delete pendingCandidates.current[fromUserId]
            }

            const answer = await pc.createAnswer()
            await pc.setLocalDescription(answer)
            console.log('Answer created and set locally')

            await sendSignal({
                type: 'answer',
                payload: answer,
                to: fromUserId
            })
            console.log('Answer sent to', fromUserId)
        } catch (error) {
            console.error('Error handling offer:', error)
        }
    }, [createPeerConnection, sendSignal])

    // Handle incoming answer
    const handleAnswer = useCallback(async (fromUserId, answer) => {
        console.log(`Handling answer from ${fromUserId}`)

        const pc = peerConnections.current[fromUserId]
        if (!pc) {
            console.log('No peer connection for answer from', fromUserId)
            return
        }

        try {
            if (pc.signalingState !== 'have-local-offer') {
                console.log('Ignoring answer, signaling state:', pc.signalingState)
                return
            }

            await pc.setRemoteDescription(new RTCSessionDescription(answer))
            console.log('Remote description (answer) set successfully')

            // Apply any pending ICE candidates
            if (pendingCandidates.current[fromUserId]) {
                console.log(`Applying ${pendingCandidates.current[fromUserId].length} pending ICE candidates`)
                for (const candidate of pendingCandidates.current[fromUserId]) {
                    try {
                        await pc.addIceCandidate(new RTCIceCandidate(candidate))
                    } catch (e) {
                        console.error('Error adding pending ICE candidate:', e)
                    }
                }
                delete pendingCandidates.current[fromUserId]
            }
        } catch (error) {
            console.error('Error handling answer:', error)
        }
    }, [])

    // Handle incoming ICE candidate
    const handleIceCandidate = useCallback(async (fromUserId, candidate) => {
        console.log('Received ICE candidate from', fromUserId)

        const pc = peerConnections.current[fromUserId]
        if (pc && pc.remoteDescription && pc.remoteDescription.type) {
            try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate))
                console.log('ICE candidate added successfully')
            } catch (error) {
                console.error('Error adding ICE candidate:', error)
            }
        } else {
            // Store candidate for later
            console.log('Storing ICE candidate for later (no remote description yet)')
            if (!pendingCandidates.current[fromUserId]) {
                pendingCandidates.current[fromUserId] = []
            }
            pendingCandidates.current[fromUserId].push(candidate)
        }
    }, [])

    // Initiate call to a new participant
    const callParticipant = useCallback(async (remoteUserId, remoteUserName) => {
        if (!localStreamRef.current) {
            console.log('Cannot call - no local stream yet')
            return
        }

        console.log(`Initiating call to ${remoteUserName} (${remoteUserId})`)

        const pc = createPeerConnection(remoteUserId, remoteUserName)

        try {
            // Check if we should create an offer (avoid collision)
            if (pc.signalingState !== 'stable') {
                console.log('Signaling not stable, skipping offer creation')
                return
            }

            const offer = await pc.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
            })
            await pc.setLocalDescription(offer)
            console.log('Offer created and set locally')

            await sendSignal({
                type: 'offer',
                payload: offer,
                to: remoteUserId,
                fromUserName: userName
            })
            console.log('Offer sent to', remoteUserId)
        } catch (error) {
            console.error('Error creating offer:', error)
        }
    }, [createPeerConnection, sendSignal, userName])

    // Process a signal from the database
    const processSignal = useCallback(async (signal) => {
        const payload = JSON.parse(signal.signal_data)

        console.log(`Processing ${signal.signal_type} from ${signal.from_user}`)

        if (signal.signal_type === 'offer') {
            await handleOffer(signal.from_user, 'Peer', payload)
        } else if (signal.signal_type === 'answer') {
            await handleAnswer(signal.from_user, payload)
        } else if (signal.signal_type === 'ice-candidate') {
            await handleIceCandidate(signal.from_user, payload)
        }

        // Delete processed signal
        try {
            await supabase
                .from('webrtc_signals')
                .delete()
                .eq('id', signal.id)
        } catch (e) {
            console.error('Error deleting signal:', e)
        }
    }, [handleOffer, handleAnswer, handleIceCandidate])

    // Listen for signaling messages
    useEffect(() => {
        if (!roomId || !userId) return

        console.log('Setting up WebRTC signaling for room', roomId)

        // Fetch and process any pending signals
        const processPendingSignals = async () => {
            const { data: signals, error } = await supabase
                .from('webrtc_signals')
                .select('*')
                .eq('room_id', roomId)
                .eq('to_user', userId)
                .order('created_at', { ascending: true })

            if (error) {
                console.error('Error fetching pending signals:', error)
                return
            }

            if (signals && signals.length > 0) {
                console.log(`Processing ${signals.length} pending signals`)
                for (const signal of signals) {
                    await processSignal(signal)
                }
            }
        }

        // Initial fetch
        processPendingSignals()

        // Subscribe to new signals
        channelRef.current = supabase
            .channel(`webrtc_signals_${roomId}_${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'webrtc_signals',
                    filter: `to_user=eq.${userId}`
                },
                async (payload) => {
                    const signal = payload.new
                    if (signal.room_id === roomId) {
                        await processSignal(signal)
                    }
                }
            )
            .subscribe((status) => {
                console.log('WebRTC channel subscription status:', status)
            })

        return () => {
            if (channelRef.current) {
                console.log('Removing WebRTC channel')
                supabase.removeChannel(channelRef.current)
            }
        }
    }, [roomId, userId, processSignal])

    // Cleanup peer connections
    const cleanup = useCallback(() => {
        console.log('Cleaning up WebRTC connections')
        Object.values(peerConnections.current).forEach(pc => {
            pc.close()
        })
        peerConnections.current = {}
        pendingCandidates.current = {}
        setRemoteStreams({})
        setConnectionStatus({})
    }, [])

    // Close connection to specific user
    const closeConnection = useCallback((remoteUserId) => {
        const pc = peerConnections.current[remoteUserId]
        if (pc) {
            console.log('Closing connection to', remoteUserId)
            pc.close()
            delete peerConnections.current[remoteUserId]
            delete pendingCandidates.current[remoteUserId]
            setRemoteStreams(prev => {
                const next = { ...prev }
                delete next[remoteUserId]
                return next
            })
            setConnectionStatus(prev => {
                const next = { ...prev }
                delete next[remoteUserId]
                return next
            })
        }
    }, [])

    return {
        remoteStreams,
        connectionStatus,
        localStream,
        updateLocalStream,
        callParticipant,
        closeConnection,
        cleanup
    }
}

export default useWebRTC
