import { useRef, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

// ICE servers with STUN and multiple free TURN options
// TURN servers relay media when direct connection fails
const ICE_SERVERS = {
    iceServers: [
        // Google STUN servers
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        // ExpressTURN free servers
        {
            urls: 'turn:relay1.expressturn.com:3478',
            username: 'efM0OFPCLPVUPH26I6',
            credential: 'jtDT4yNWQqXt0bGC'
        },
        // Numb STUN/TURN (free public)
        { urls: 'stun:numb.viagenie.ca' },
        {
            urls: 'turn:numb.viagenie.ca',
            username: 'webrtc@live.com',
            credential: 'muazkh'
        },
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
    const retryCount = useRef({})

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

    // Send signaling data via Supabase
    const sendSignal = useCallback(async (data) => {
        try {
            console.log(`Sending ${data.type} to ${data.to}`)
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
    const createPeerConnection = useCallback((remoteUserId, remoteUserName, forceNew = false) => {
        // Return existing connection if available and not closed
        if (!forceNew) {
            const existingPc = peerConnections.current[remoteUserId]
            if (existingPc && existingPc.connectionState !== 'closed' && existingPc.connectionState !== 'failed') {
                return existingPc
            }
        }

        // Close existing if forcing new
        if (peerConnections.current[remoteUserId]) {
            peerConnections.current[remoteUserId].close()
        }

        console.log(`Creating peer connection for ${remoteUserName}`)

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
            console.log(`Received ${event.track.kind} track from ${remoteUserName}`)
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

            // Handle connection failure - retry with ICE restart
            if (pc.connectionState === 'failed') {
                const retries = retryCount.current[remoteUserId] || 0
                if (retries < 2) {
                    console.log(`Connection failed, attempting ICE restart (retry ${retries + 1})`)
                    retryCount.current[remoteUserId] = retries + 1
                    pc.restartIce()
                } else {
                    console.log('Max retries reached, closing connection')
                    pc.close()
                }
            }

            if (pc.connectionState === 'connected') {
                console.log(`Successfully connected to ${remoteUserName}!`)
                retryCount.current[remoteUserId] = 0
            }
        }

        // Handle ICE connection state
        pc.oniceconnectionstatechange = () => {
            console.log(`ICE state with ${remoteUserName}: ${pc.iceConnectionState}`)

            // Try to trigger reconnection on disconnect
            if (pc.iceConnectionState === 'disconnected') {
                setTimeout(() => {
                    if (pc.iceConnectionState === 'disconnected') {
                        console.log('Still disconnected, attempting reconnection...')
                        pc.restartIce()
                    }
                }, 3000)
            }
        }

        // Handle ICE gathering state
        pc.onicegatheringstatechange = () => {
            console.log(`ICE gathering: ${pc.iceGatheringState}`)
        }

        // Handle negotiation needed (for renegotiation after ICE restart)
        pc.onnegotiationneeded = async () => {
            console.log('Negotiation needed for', remoteUserId)
            // Only the offerer should create new offers
            if (userId > remoteUserId) {
                try {
                    const offer = await pc.createOffer({ iceRestart: true })
                    await pc.setLocalDescription(offer)
                    await sendSignal({
                        type: 'offer',
                        payload: offer,
                        to: remoteUserId
                    })
                } catch (e) {
                    console.error('Error in negotiation:', e)
                }
            }
        }

        return pc
    }, [sendSignal, userId])

    // Handle incoming offer
    const handleOffer = useCallback(async (fromUserId, fromUserName, offer) => {
        console.log(`Handling offer from ${fromUserName}`)

        // Check if this is an ICE restart (renegotiation)
        const existingPc = peerConnections.current[fromUserId]
        const isRenegotiation = existingPc && existingPc.connectionState !== 'closed'

        const pc = isRenegotiation ? existingPc : createPeerConnection(fromUserId, fromUserName)

        try {
            // Handle glare (both sides sending offers simultaneously)
            if (pc.signalingState === 'have-local-offer') {
                // Rollback our offer if we have lower user ID (they take precedence)
                if (userId < fromUserId) {
                    console.log('Glare detected, rolling back local offer')
                    await pc.setLocalDescription({ type: 'rollback' })
                } else {
                    console.log('Glare detected, ignoring incoming offer')
                    return
                }
            }

            await pc.setRemoteDescription(new RTCSessionDescription(offer))
            console.log('Remote description set')

            // Apply any pending ICE candidates
            if (pendingCandidates.current[fromUserId]) {
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

            await sendSignal({
                type: 'answer',
                payload: answer,
                to: fromUserId
            })
            console.log('Answer sent')
        } catch (error) {
            console.error('Error handling offer:', error)
        }
    }, [createPeerConnection, sendSignal, userId])

    // Handle incoming answer
    const handleAnswer = useCallback(async (fromUserId, answer) => {
        console.log(`Handling answer from ${fromUserId}`)

        const pc = peerConnections.current[fromUserId]
        if (!pc) {
            console.log('No peer connection for answer')
            return
        }

        try {
            if (pc.signalingState !== 'have-local-offer') {
                console.log('Ignoring answer, signaling state:', pc.signalingState)
                return
            }

            await pc.setRemoteDescription(new RTCSessionDescription(answer))
            console.log('Remote description (answer) set')

            // Apply any pending ICE candidates
            if (pendingCandidates.current[fromUserId]) {
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
        const pc = peerConnections.current[fromUserId]
        if (pc && pc.remoteDescription && pc.remoteDescription.type) {
            try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate))
            } catch (error) {
                console.error('Error adding ICE candidate:', error)
            }
        } else {
            // Store candidate for later
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

        // Determine who initiates - higher user ID creates the offer
        // This prevents both sides from creating offers simultaneously
        if (userId < remoteUserId) {
            console.log(`Skipping call to ${remoteUserName} - they will call us`)
            return
        }

        console.log(`Calling ${remoteUserName}`)

        const pc = createPeerConnection(remoteUserId, remoteUserName)

        try {
            if (pc.signalingState !== 'stable') {
                console.log('Signaling not stable, skipping offer')
                return
            }

            const offer = await pc.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
            })
            await pc.setLocalDescription(offer)

            await sendSignal({
                type: 'offer',
                payload: offer,
                to: remoteUserId,
                fromUserName: userName
            })
            console.log('Offer sent')
        } catch (error) {
            console.error('Error creating offer:', error)
        }
    }, [createPeerConnection, sendSignal, userName, userId])

    // Process a signal from the database
    const processSignal = useCallback(async (signal) => {
        const payload = JSON.parse(signal.signal_data)

        console.log(`Processing ${signal.signal_type} from ${signal.from_user.slice(0, 8)}...`)

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

        console.log('Setting up WebRTC signaling')

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
                console.log('WebRTC channel:', status)
            })

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current)
            }
        }
    }, [roomId, userId, processSignal])

    // Cleanup peer connections
    const cleanup = useCallback(() => {
        console.log('Cleaning up WebRTC')
        Object.values(peerConnections.current).forEach(pc => {
            pc.close()
        })
        peerConnections.current = {}
        pendingCandidates.current = {}
        retryCount.current = {}
        setRemoteStreams({})
        setConnectionStatus({})
    }, [])

    // Close connection to specific user
    const closeConnection = useCallback((remoteUserId) => {
        const pc = peerConnections.current[remoteUserId]
        if (pc) {
            pc.close()
            delete peerConnections.current[remoteUserId]
            delete pendingCandidates.current[remoteUserId]
            delete retryCount.current[remoteUserId]
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
