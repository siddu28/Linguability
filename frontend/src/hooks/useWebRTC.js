import { useRef, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

// Free STUN servers for NAT traversal
const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
    ]
}

export function useWebRTC(roomId, userId, userName, localStream) {
    const [remoteStreams, setRemoteStreams] = useState({})
    const [connectionStatus, setConnectionStatus] = useState({})
    const peerConnections = useRef({})
    const pendingCandidates = useRef({})
    const channelRef = useRef(null)

    // Create a peer connection for a specific user
    const createPeerConnection = useCallback((remoteUserId, remoteUserName) => {
        if (peerConnections.current[remoteUserId]) {
            return peerConnections.current[remoteUserId]
        }

        console.log(`Creating peer connection for ${remoteUserName} (${remoteUserId})`)

        const pc = new RTCPeerConnection(ICE_SERVERS)
        peerConnections.current[remoteUserId] = pc

        // Add local tracks to the connection
        if (localStream) {
            localStream.getTracks().forEach(track => {
                pc.addTrack(track, localStream)
            })
        }

        // Handle incoming remote tracks
        pc.ontrack = (event) => {
            console.log(`Received remote track from ${remoteUserName}`)
            const [remoteStream] = event.streams
            setRemoteStreams(prev => ({
                ...prev,
                [remoteUserId]: {
                    stream: remoteStream,
                    userName: remoteUserName
                }
            }))
        }

        // Handle ICE candidates
        pc.onicecandidate = async (event) => {
            if (event.candidate) {
                // Send ICE candidate via Supabase Realtime
                await sendSignal({
                    type: 'ice-candidate',
                    candidate: event.candidate,
                    from: userId,
                    to: remoteUserId,
                    roomId
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
        }

        // Handle ICE connection state
        pc.oniceconnectionstatechange = () => {
            console.log(`ICE connection state with ${remoteUserName}: ${pc.iceConnectionState}`)
        }

        return pc
    }, [localStream, roomId, userId])

    // Send signaling data via Supabase
    const sendSignal = async (data) => {
        try {
            await supabase.from('webrtc_signals').insert({
                room_id: roomId,
                from_user: data.from,
                to_user: data.to,
                signal_type: data.type,
                signal_data: JSON.stringify(data.type === 'ice-candidate' ? data.candidate : data.sdp),
                created_at: new Date().toISOString()
            })
        } catch (error) {
            console.error('Error sending signal:', error)
        }
    }

    // Handle incoming offer
    const handleOffer = useCallback(async (fromUserId, fromUserName, offer) => {
        console.log(`Received offer from ${fromUserName}`)

        const pc = createPeerConnection(fromUserId, fromUserName)

        try {
            await pc.setRemoteDescription(new RTCSessionDescription(offer))

            // Apply any pending ICE candidates
            if (pendingCandidates.current[fromUserId]) {
                for (const candidate of pendingCandidates.current[fromUserId]) {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate))
                }
                delete pendingCandidates.current[fromUserId]
            }

            const answer = await pc.createAnswer()
            await pc.setLocalDescription(answer)

            await sendSignal({
                type: 'answer',
                sdp: answer,
                from: userId,
                to: fromUserId,
                roomId
            })
        } catch (error) {
            console.error('Error handling offer:', error)
        }
    }, [createPeerConnection, roomId, userId])

    // Handle incoming answer
    const handleAnswer = useCallback(async (fromUserId, answer) => {
        console.log(`Received answer from ${fromUserId}`)

        const pc = peerConnections.current[fromUserId]
        if (pc) {
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(answer))

                // Apply any pending ICE candidates
                if (pendingCandidates.current[fromUserId]) {
                    for (const candidate of pendingCandidates.current[fromUserId]) {
                        await pc.addIceCandidate(new RTCIceCandidate(candidate))
                    }
                    delete pendingCandidates.current[fromUserId]
                }
            } catch (error) {
                console.error('Error handling answer:', error)
            }
        }
    }, [])

    // Handle incoming ICE candidate
    const handleIceCandidate = useCallback(async (fromUserId, candidate) => {
        const pc = peerConnections.current[fromUserId]
        if (pc && pc.remoteDescription) {
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
        console.log(`Initiating call to ${remoteUserName}`)

        const pc = createPeerConnection(remoteUserId, remoteUserName)

        try {
            const offer = await pc.createOffer()
            await pc.setLocalDescription(offer)

            await sendSignal({
                type: 'offer',
                sdp: offer,
                from: userId,
                to: remoteUserId,
                fromUserName: userName,
                roomId
            })
        } catch (error) {
            console.error('Error creating offer:', error)
        }
    }, [createPeerConnection, roomId, userId, userName])

    // Listen for signaling messages
    useEffect(() => {
        if (!roomId || !userId) return

        // Fetch and process any pending signals
        const processPendingSignals = async () => {
            const { data: signals } = await supabase
                .from('webrtc_signals')
                .select('*')
                .eq('room_id', roomId)
                .eq('to_user', userId)
                .order('created_at', { ascending: true })

            if (signals) {
                for (const signal of signals) {
                    const signalData = JSON.parse(signal.signal_data)

                    if (signal.signal_type === 'offer') {
                        await handleOffer(signal.from_user, 'Peer', signalData)
                    } else if (signal.signal_type === 'answer') {
                        await handleAnswer(signal.from_user, signalData)
                    } else if (signal.signal_type === 'ice-candidate') {
                        await handleIceCandidate(signal.from_user, signalData)
                    }

                    // Delete processed signal
                    await supabase
                        .from('webrtc_signals')
                        .delete()
                        .eq('id', signal.id)
                }
            }
        }

        processPendingSignals()

        // Subscribe to new signals
        channelRef.current = supabase
            .channel(`webrtc_${roomId}_${userId}`)
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
                    if (signal.room_id !== roomId) return

                    const signalData = JSON.parse(signal.signal_data)

                    if (signal.signal_type === 'offer') {
                        await handleOffer(signal.from_user, 'Peer', signalData)
                    } else if (signal.signal_type === 'answer') {
                        await handleAnswer(signal.from_user, signalData)
                    } else if (signal.signal_type === 'ice-candidate') {
                        await handleIceCandidate(signal.from_user, signalData)
                    }

                    // Delete processed signal
                    await supabase
                        .from('webrtc_signals')
                        .delete()
                        .eq('id', signal.id)
                }
            )
            .subscribe()

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current)
            }
        }
    }, [roomId, userId, handleOffer, handleAnswer, handleIceCandidate])

    // Cleanup peer connections
    const cleanup = useCallback(() => {
        Object.values(peerConnections.current).forEach(pc => {
            pc.close()
        })
        peerConnections.current = {}
        setRemoteStreams({})
        setConnectionStatus({})
    }, [])

    // Close connection to specific user
    const closeConnection = useCallback((remoteUserId) => {
        const pc = peerConnections.current[remoteUserId]
        if (pc) {
            pc.close()
            delete peerConnections.current[remoteUserId]
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
        callParticipant,
        closeConnection,
        cleanup
    }
}

export default useWebRTC
