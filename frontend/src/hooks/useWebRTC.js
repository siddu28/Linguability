import { useRef, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

// ICE servers with STUN and TURN
// TURN servers relay media when direct peer-to-peer connection fails (different networks)
const ICE_SERVERS = {
    iceServers: [
        // Google STUN servers (reliable, always available)
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
        // Open Relay TURN server (free, community-maintained)
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
    ],
    iceCandidatePoolSize: 10
}

// Max age of signals to consider (in seconds). Older ones are cleaned up.
const SIGNAL_MAX_AGE_SECONDS = 30

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
            console.log(`[WebRTC] 📤 Sending ${data.type} to ${data.to?.slice(0, 8)}...`)

            // Try inserting with from_user_name column
            const signalRow = {
                room_id: roomId,
                from_user: userId,
                from_user_name: userName,
                to_user: data.to,
                signal_type: data.type,
                signal_data: JSON.stringify(data.payload),
                created_at: new Date().toISOString()
            }

            let { error } = await supabase.from('webrtc_signals').insert(signalRow)

            // If from_user_name column doesn't exist, retry without it
            if (error && (error.message?.includes('from_user_name') || error.code === '42703')) {
                console.warn('[WebRTC] ⚠️ from_user_name column not found, retrying without it')
                const { from_user_name, ...rowWithoutName } = signalRow
                const result = await supabase.from('webrtc_signals').insert(rowWithoutName)
                error = result.error
            }

            if (error) {
                console.error('[WebRTC] ❌ Error sending signal:', error)
            } else {
                console.log(`[WebRTC] ✅ Signal sent successfully`)
            }
        } catch (error) {
            console.error('[WebRTC] ❌ Error sending signal:', error)
        }
    }, [roomId, userId, userName])

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

        console.log(`[WebRTC] 🔗 Creating peer connection for ${remoteUserName} (${remoteUserId?.slice(0, 8)}...)`)

        const pc = new RTCPeerConnection(ICE_SERVERS)
        peerConnections.current[remoteUserId] = pc

        // Set initial status
        setConnectionStatus(prev => ({
            ...prev,
            [remoteUserId]: 'new'
        }))

        // Add local tracks to the connection if stream exists
        if (localStreamRef.current) {
            console.log('[WebRTC] 🎥 Adding local tracks to peer connection')
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current)
            })
        } else {
            console.warn('[WebRTC] ⚠️ No local stream available when creating peer connection')
        }

        // Handle incoming remote tracks
        pc.ontrack = (event) => {
            console.log(`[WebRTC] 🎬 Received ${event.track.kind} track from ${remoteUserName}`)
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
            const state = pc.connectionState
            console.log(`[WebRTC] 🔄 Connection state with ${remoteUserName}: ${state}`)
            setConnectionStatus(prev => ({
                ...prev,
                [remoteUserId]: state
            }))

            // Handle connection failure - retry with ICE restart
            if (state === 'failed') {
                const retries = retryCount.current[remoteUserId] || 0
                if (retries < 3) {
                    console.log(`[WebRTC] 🔁 Connection failed, attempting ICE restart (retry ${retries + 1}/3)`)
                    retryCount.current[remoteUserId] = retries + 1
                    pc.restartIce()
                } else {
                    console.error('[WebRTC] ❌ Max retries reached, closing connection')
                    pc.close()
                }
            }

            if (state === 'connected') {
                console.log(`[WebRTC] ✅ Successfully connected to ${remoteUserName}!`)
                retryCount.current[remoteUserId] = 0
            }
        }

        // Handle ICE connection state
        pc.oniceconnectionstatechange = () => {
            console.log(`[WebRTC] 🧊 ICE state with ${remoteUserName}: ${pc.iceConnectionState}`)

            // Try to trigger reconnection on disconnect
            if (pc.iceConnectionState === 'disconnected') {
                setTimeout(() => {
                    if (pc.iceConnectionState === 'disconnected') {
                        console.log('[WebRTC] 🔁 Still disconnected, attempting reconnection...')
                        pc.restartIce()
                    }
                }, 3000)
            }
        }

        // Handle ICE gathering state
        pc.onicegatheringstatechange = () => {
            console.log(`[WebRTC] 🧊 ICE gathering: ${pc.iceGatheringState}`)
        }

        // Handle negotiation needed (for renegotiation after ICE restart)
        pc.onnegotiationneeded = async () => {
            console.log(`[WebRTC] 🤝 Negotiation needed for ${remoteUserId?.slice(0, 8)}...`)
            // Only the offerer should create new offers (use deterministic ordering)
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
                    console.error('[WebRTC] ❌ Error in negotiation:', e)
                }
            }
        }

        return pc
    }, [sendSignal, userId])

    // Handle incoming offer
    const handleOffer = useCallback(async (fromUserId, fromUserName, offer) => {
        console.log(`[WebRTC] 📥 Handling offer from ${fromUserName} (${fromUserId?.slice(0, 8)}...)`)

        // Check if this is an ICE restart (renegotiation)
        const existingPc = peerConnections.current[fromUserId]
        const isRenegotiation = existingPc && existingPc.connectionState !== 'closed'

        const pc = isRenegotiation ? existingPc : createPeerConnection(fromUserId, fromUserName)

        try {
            // Handle glare (both sides sending offers simultaneously)
            if (pc.signalingState === 'have-local-offer') {
                // Rollback our offer if we have lower user ID (they take precedence)
                if (userId < fromUserId) {
                    console.log('[WebRTC] ⚡ Glare detected, rolling back local offer')
                    await pc.setLocalDescription({ type: 'rollback' })
                } else {
                    console.log('[WebRTC] ⚡ Glare detected, ignoring incoming offer')
                    return
                }
            }

            await pc.setRemoteDescription(new RTCSessionDescription(offer))
            console.log('[WebRTC] ✅ Remote description (offer) set')

            // Apply any pending ICE candidates
            if (pendingCandidates.current[fromUserId]) {
                console.log(`[WebRTC] 📦 Applying ${pendingCandidates.current[fromUserId].length} pending ICE candidates`)
                for (const candidate of pendingCandidates.current[fromUserId]) {
                    try {
                        await pc.addIceCandidate(new RTCIceCandidate(candidate))
                    } catch (e) {
                        console.error('[WebRTC] ❌ Error adding pending ICE candidate:', e)
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
            console.log('[WebRTC] ✅ Answer sent')
        } catch (error) {
            console.error('[WebRTC] ❌ Error handling offer:', error)
        }
    }, [createPeerConnection, sendSignal, userId])

    // Handle incoming answer
    const handleAnswer = useCallback(async (fromUserId, answer) => {
        console.log(`[WebRTC] 📥 Handling answer from ${fromUserId?.slice(0, 8)}...`)

        const pc = peerConnections.current[fromUserId]
        if (!pc) {
            console.log('[WebRTC] ⚠️ No peer connection for answer')
            return
        }

        try {
            if (pc.signalingState !== 'have-local-offer') {
                console.log(`[WebRTC] ⚠️ Ignoring answer, signaling state: ${pc.signalingState}`)
                return
            }

            await pc.setRemoteDescription(new RTCSessionDescription(answer))
            console.log('[WebRTC] ✅ Remote description (answer) set')

            // Apply any pending ICE candidates
            if (pendingCandidates.current[fromUserId]) {
                console.log(`[WebRTC] 📦 Applying ${pendingCandidates.current[fromUserId].length} pending ICE candidates`)
                for (const candidate of pendingCandidates.current[fromUserId]) {
                    try {
                        await pc.addIceCandidate(new RTCIceCandidate(candidate))
                    } catch (e) {
                        console.error('[WebRTC] ❌ Error adding pending ICE candidate:', e)
                    }
                }
                delete pendingCandidates.current[fromUserId]
            }
        } catch (error) {
            console.error('[WebRTC] ❌ Error handling answer:', error)
        }
    }, [])

    // Handle incoming ICE candidate
    const handleIceCandidate = useCallback(async (fromUserId, candidate) => {
        const pc = peerConnections.current[fromUserId]
        if (pc && pc.remoteDescription && pc.remoteDescription.type) {
            try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate))
            } catch (error) {
                console.error('[WebRTC] ❌ Error adding ICE candidate:', error)
            }
        } else {
            // Store candidate for later (remote description not set yet)
            if (!pendingCandidates.current[fromUserId]) {
                pendingCandidates.current[fromUserId] = []
            }
            pendingCandidates.current[fromUserId].push(candidate)
            console.log(`[WebRTC] 📦 Queued ICE candidate for ${fromUserId?.slice(0, 8)}... (${pendingCandidates.current[fromUserId].length} pending)`)
        }
    }, [])

    // Initiate call to a new participant
    const callParticipant = useCallback(async (remoteUserId, remoteUserName) => {
        if (!localStreamRef.current) {
            console.log('[WebRTC] ⚠️ Cannot call - no local stream yet')
            return
        }

        // Determine who initiates - higher user ID creates the offer
        // This prevents both sides from creating offers simultaneously
        if (userId < remoteUserId) {
            console.log(`[WebRTC] ⏳ Skipping call to ${remoteUserName} - they will call us (their ID is higher)`)
            return
        }

        console.log(`[WebRTC] 📞 Calling ${remoteUserName} (${remoteUserId?.slice(0, 8)}...)`)

        const pc = createPeerConnection(remoteUserId, remoteUserName)

        try {
            if (pc.signalingState !== 'stable') {
                console.log(`[WebRTC] ⚠️ Signaling not stable (${pc.signalingState}), skipping offer`)
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
                to: remoteUserId
            })
            console.log('[WebRTC] ✅ Offer sent')
        } catch (error) {
            console.error('[WebRTC] ❌ Error creating offer:', error)
        }
    }, [createPeerConnection, sendSignal, userName, userId])

    // Process a signal from the database
    const processSignal = useCallback(async (signal) => {
        const payload = JSON.parse(signal.signal_data)
        const fromUserName = signal.from_user_name || 'Peer'

        console.log(`[WebRTC] 📨 Processing ${signal.signal_type} from ${fromUserName} (${signal.from_user?.slice(0, 8)}...)`)

        if (signal.signal_type === 'offer') {
            await handleOffer(signal.from_user, fromUserName, payload)
        } else if (signal.signal_type === 'answer') {
            await handleAnswer(signal.from_user, payload)
        } else if (signal.signal_type === 'ice-candidate') {
            await handleIceCandidate(signal.from_user, payload)
        }

        // Delete processed signal to keep the table clean
        try {
            await supabase
                .from('webrtc_signals')
                .delete()
                .eq('id', signal.id)
        } catch (e) {
            console.error('[WebRTC] Error deleting signal:', e)
        }
    }, [handleOffer, handleAnswer, handleIceCandidate])

    // Clean up stale signals from previous sessions
    const cleanupStaleSignals = useCallback(async () => {
        try {
            const cutoff = new Date(Date.now() - SIGNAL_MAX_AGE_SECONDS * 1000).toISOString()
            const { error } = await supabase
                .from('webrtc_signals')
                .delete()
                .eq('room_id', roomId)
                .lt('created_at', cutoff)

            if (error) {
                console.error('[WebRTC] Error cleaning stale signals:', error)
            } else {
                console.log('[WebRTC] 🧹 Cleaned up stale signals')
            }
        } catch (e) {
            console.error('[WebRTC] Error cleaning stale signals:', e)
        }
    }, [roomId])

    // Listen for signaling messages
    useEffect(() => {
        if (!roomId || !userId) return

        console.log('[WebRTC] 🚀 Setting up signaling channel...')
        console.log(`[WebRTC] Room: ${roomId?.slice(0, 8)}..., User: ${userId?.slice(0, 8)}...`)

        // Clean up stale signals first
        cleanupStaleSignals()

        // Fetch and process any pending signals
        const processPendingSignals = async () => {
            const { data: signals, error } = await supabase
                .from('webrtc_signals')
                .select('*')
                .eq('room_id', roomId)
                .eq('to_user', userId)
                .order('created_at', { ascending: true })

            if (error) {
                console.error('[WebRTC] ❌ Error fetching pending signals:', error)
                return
            }

            if (signals && signals.length > 0) {
                console.log(`[WebRTC] 📬 Processing ${signals.length} pending signals`)
                for (const signal of signals) {
                    await processSignal(signal)
                }
            } else {
                console.log('[WebRTC] 📭 No pending signals')
            }
        }

        processPendingSignals()

        // Subscribe to new signals via Supabase Realtime
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
            .subscribe((status, err) => {
                console.log(`[WebRTC] 📡 Signaling channel status: ${status}`)
                if (status === 'SUBSCRIBED') {
                    console.log('[WebRTC] ✅ Signaling channel is ACTIVE — ready to receive signals')
                } else if (status === 'CHANNEL_ERROR') {
                    console.error('[WebRTC] ❌ Signaling channel ERROR — signals will NOT be received!', err)
                    console.error('[WebRTC] 💡 Check: Is Realtime enabled on the webrtc_signals table in Supabase Dashboard?')
                    console.error('[WebRTC] 💡 Check: Are RLS policies set correctly on the webrtc_signals table?')
                } else if (status === 'TIMED_OUT') {
                    console.error('[WebRTC] ❌ Signaling channel TIMED OUT — retrying...')
                } else if (status === 'CLOSED') {
                    console.warn('[WebRTC] ⚠️ Signaling channel CLOSED')
                }
            })

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current)
            }
        }
    }, [roomId, userId, processSignal, cleanupStaleSignals])

    // Cleanup peer connections
    const cleanup = useCallback(() => {
        console.log('[WebRTC] 🧹 Cleaning up all WebRTC connections')
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
