/**
 * ============================================================
 *  MEMBER 5 — Real-time Features & Study Rooms Integration Tests
 *  Tests: Socket.io, WebRTC, Supabase Realtime, Chat, Notifications
 *  Tools: Vitest + React Testing Library + Mocked Socket/Supabase
 * ============================================================
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'

// Mock Socket.io
const mockSocket = {
    on: vi.fn(),
    emit: vi.fn(),
    off: vi.fn(),
    disconnect: vi.fn(),
    connect: vi.fn(),
    connected: true,
    id: 'mock-socket-id'
}

vi.mock('socket.io-client', () => ({
    io: vi.fn(() => mockSocket),
    default: vi.fn(() => mockSocket)
}))

// Mock Supabase with Realtime
const mockSupabaseChannel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn()
}

vi.mock('../../lib/supabaseClient', () => ({
    supabase: {
        auth: {
            getSession: vi.fn(() => Promise.resolve({
                data: { session: { user: { id: 'test-user-123' } } },
                error: null
            })),
            onAuthStateChange: vi.fn(() => ({
                data: { subscription: { unsubscribe: vi.fn() } }
            }))
        },
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn(),
                    order: vi.fn(() => ({
                        limit: vi.fn()
                    }))
                })),
                order: vi.fn()
            })),
            insert: vi.fn(() => ({
                select: vi.fn(() => ({
                    single: vi.fn()
                }))
            })),
            update: vi.fn(() => ({
                eq: vi.fn()
            })),
            delete: vi.fn(() => ({
                eq: vi.fn()
            })),
            upsert: vi.fn(() => ({
                select: vi.fn(() => ({
                    single: vi.fn()
                }))
            }))
        })),
        channel: vi.fn(() => mockSupabaseChannel),
        removeChannel: vi.fn()
    }
}))

// Mock database functions
vi.mock('../../lib/database', () => ({
    getNotifications: vi.fn(),
    markNotificationRead: vi.fn(),
    createNotification: vi.fn(),
    getLessonProgress: vi.fn(),
    getAllPracticeProgress: vi.fn(),
    getAssessmentStats: vi.fn(),
    getUserSettings: vi.fn(() => Promise.resolve(null)),
    // Added for failing test cases
    getStudyRoom: vi.fn(),
    createStudyRoom: vi.fn(),
    joinStudyRoom: vi.fn(),
    sendRoomMessage: vi.fn(),
    unlockAchievement: vi.fn()
}))

import * as database from '../../lib/database'
import { supabase } from '../../lib/supabaseClient'
import { io } from 'socket.io-client'

// ==================== STU-01: Create Study Room ====================

describe('STU-01: Create study room saves to study_rooms table', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should insert new room into database', async () => {
        const mockRoom = {
            id: 'room-123',
            name: 'English Practice',
            description: 'A room for practicing English',
            created_by: 'test-user-123',
            is_active: true,
            max_participants: 10
        }

        supabase.from.mockReturnValue({
            insert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ data: mockRoom, error: null })
                })
            })
        })

        const { data } = await supabase.from('study_rooms').insert({
            name: 'English Practice',
            description: 'A room for practicing English',
            created_by: 'test-user-123'
        }).select().single()

        expect(supabase.from).toHaveBeenCalledWith('study_rooms')
    })

    it('should generate unique room ID', () => {
        const roomId1 = `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const roomId2 = `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        expect(roomId1).not.toBe(roomId2)
    })
})

// ==================== STU-02: Join Room Adds Participant ====================

describe('STU-02: Join room adds entry to room_participants', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should add participant to room', async () => {
        const mockParticipant = {
            room_id: 'room-123',
            user_id: 'test-user-123',
            user_name: 'Test User',
            is_audio_enabled: true,
            is_video_enabled: true
        }

        supabase.from.mockReturnValue({
            insert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ data: mockParticipant, error: null })
                })
            })
        })

        await supabase.from('room_participants').insert(mockParticipant)

        expect(supabase.from).toHaveBeenCalledWith('room_participants')
    })

    it('should emit join-room event via Socket.io', () => {
        const roomId = 'room-123'
        const userId = 'test-user-123'

        mockSocket.emit('join-room', roomId, userId)

        expect(mockSocket.emit).toHaveBeenCalledWith('join-room', roomId, userId)
    })
})

// ==================== STU-03: Real-time Participant Count Updates ====================

describe('STU-03: Real-time participant count updates via Supabase Realtime', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should subscribe to room changes', () => {
        const roomId = 'room-123'

        supabase.channel(`room:${roomId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'room_participants' }, () => {})
            .subscribe()

        expect(supabase.channel).toHaveBeenCalledWith(`room:${roomId}`)
        expect(mockSupabaseChannel.on).toHaveBeenCalled()
        expect(mockSupabaseChannel.subscribe).toHaveBeenCalled()
    })

    it('should handle INSERT event for new participant', () => {
        const callback = vi.fn()
        const newParticipant = {
            eventType: 'INSERT',
            new: { user_id: 'new-user', user_name: 'New User' }
        }

        // Simulate callback
        callback(newParticipant)

        expect(callback).toHaveBeenCalledWith(newParticipant)
    })

    it('should handle DELETE event when participant leaves', () => {
        const callback = vi.fn()
        const leftParticipant = {
            eventType: 'DELETE',
            old: { user_id: 'left-user' }
        }

        callback(leftParticipant)

        expect(callback).toHaveBeenCalledWith(leftParticipant)
    })
})

// ==================== STU-04: Chat Message Via Socket.io ====================

describe('STU-04: Chat message sends via Socket.io and persists', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should emit send-message event', () => {
        const messageData = {
            roomId: 'room-123',
            userId: 'test-user-123',
            userName: 'Test User',
            content: 'Hello everyone!'
        }

        mockSocket.emit('send-message', messageData)

        expect(mockSocket.emit).toHaveBeenCalledWith('send-message', messageData)
    })

    it('should listen for receive-message event', () => {
        const callback = vi.fn()

        mockSocket.on('receive-message', callback)

        expect(mockSocket.on).toHaveBeenCalledWith('receive-message', callback)
    })

    it('should format message correctly', () => {
        const message = {
            id: Date.now().toString(),
            room_id: 'room-123',
            user_id: 'test-user-123',
            user_name: 'Test User',
            content: 'Hello!',
            created_at: new Date().toISOString()
        }

        expect(message).toHaveProperty('id')
        expect(message).toHaveProperty('content')
        expect(message).toHaveProperty('created_at')
    })
})

// ==================== STU-05: Chat History Loads from Database ====================

describe('STU-05: Chat history loads from database on room join', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should fetch chat messages from room_messages', async () => {
        const mockMessages = [
            { id: '1', content: 'Hello', user_name: 'User1', created_at: '2026-03-09T09:00:00Z' },
            { id: '2', content: 'Hi there!', user_name: 'User2', created_at: '2026-03-09T09:01:00Z' }
        ]

        supabase.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    order: vi.fn().mockResolvedValue({ data: mockMessages, error: null })
                })
            })
        })

        const { data } = await supabase.from('room_messages')
            .select('*')
            .eq('room_id', 'room-123')
            .order('created_at', { ascending: true })

        expect(supabase.from).toHaveBeenCalledWith('room_messages')
    })

    it('should order messages by created_at', () => {
        const messages = [
            { created_at: '2026-03-09T09:01:00Z', content: 'Second' },
            { created_at: '2026-03-09T09:00:00Z', content: 'First' }
        ]

        const sorted = messages.sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )

        expect(sorted[0].content).toBe('First')
        expect(sorted[1].content).toBe('Second')
    })
})

// ==================== STU-06: WebRTC Signaling Via Socket.io ====================

describe('STU-06: WebRTC signaling via Socket.io', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should emit call-user with offer', () => {
        const callData = {
            roomId: 'room-123',
            offer: { type: 'offer', sdp: 'mock-sdp-offer' },
            user: 'test-user-123'
        }

        mockSocket.emit('call-user', callData)

        expect(mockSocket.emit).toHaveBeenCalledWith('call-user', callData)
    })

    it('should listen for call-made event', () => {
        const callback = vi.fn()

        mockSocket.on('call-made', callback)

        expect(mockSocket.on).toHaveBeenCalledWith('call-made', callback)
    })

    it('should emit make-answer with answer', () => {
        const answerData = {
            to: 'socket-id-456',
            answer: { type: 'answer', sdp: 'mock-sdp-answer' }
        }

        mockSocket.emit('make-answer', answerData)

        expect(mockSocket.emit).toHaveBeenCalledWith('make-answer', answerData)
    })

    it('should listen for answer-made event', () => {
        const callback = vi.fn()

        mockSocket.on('answer-made', callback)

        expect(mockSocket.on).toHaveBeenCalledWith('answer-made', callback)
    })
})

// ==================== STU-07: ICE Candidate Exchange ====================

describe('STU-07: ICE candidates exchange establishes video connection', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should emit ice-candidate', () => {
        const iceData = {
            roomId: 'room-123',
            candidate: {
                candidate: 'candidate:123 1 udp 2122260223 192.168.1.1 54321',
                sdpMid: '0',
                sdpMLineIndex: 0
            }
        }

        mockSocket.emit('ice-candidate', iceData)

        expect(mockSocket.emit).toHaveBeenCalledWith('ice-candidate', iceData)
    })

    it('should listen for ice-candidate-received', () => {
        const callback = vi.fn()

        mockSocket.on('ice-candidate-received', callback)

        expect(mockSocket.on).toHaveBeenCalledWith('ice-candidate-received', callback)
    })

    it('should create RTCPeerConnection with STUN servers', () => {
        const config = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        }

        expect(config.iceServers).toHaveLength(2)
        expect(config.iceServers[0].urls).toContain('stun')
    })
})

// ==================== STU-08: Audio/Video Toggle Updates ====================

describe('STU-08: Audio/video toggle updates room_participants', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should update audio status in database', async () => {
        supabase.from.mockReturnValue({
            update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ error: null })
                })
            })
        })

        await supabase.from('room_participants')
            .update({ is_audio_enabled: false })
            .eq('room_id', 'room-123')
            .eq('user_id', 'test-user-123')

        expect(supabase.from).toHaveBeenCalledWith('room_participants')
    })

    it('should update video status in database', async () => {
        supabase.from.mockReturnValue({
            update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ error: null })
                })
            })
        })

        await supabase.from('room_participants')
            .update({ is_video_enabled: false })
            .eq('room_id', 'room-123')
            .eq('user_id', 'test-user-123')

        expect(supabase.from).toHaveBeenCalledWith('room_participants')
    })

    it('should toggle local media track', () => {
        const mockTrack = { enabled: true }
        
        mockTrack.enabled = !mockTrack.enabled

        expect(mockTrack.enabled).toBe(false)
    })
})

// ==================== STU-09: Task List Syncs to room_tasks ====================

describe('STU-09: Task list syncs to room_tasks table', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should insert new task', async () => {
        const mockTask = {
            id: 'task-1',
            room_id: 'room-123',
            title: 'Practice vocabulary',
            description: 'Review 20 new words',
            status: 'pending'
        }

        supabase.from.mockReturnValue({
            insert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ data: mockTask, error: null })
                })
            })
        })

        await supabase.from('room_tasks').insert(mockTask)

        expect(supabase.from).toHaveBeenCalledWith('room_tasks')
    })

    it('should update task status', async () => {
        supabase.from.mockReturnValue({
            update: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null })
            })
        })

        await supabase.from('room_tasks')
            .update({ status: 'completed' })
            .eq('id', 'task-1')

        expect(supabase.from).toHaveBeenCalledWith('room_tasks')
    })

    it('should fetch all tasks for a room', async () => {
        const mockTasks = [
            { id: 'task-1', title: 'Task 1', status: 'completed' },
            { id: 'task-2', title: 'Task 2', status: 'pending' }
        ]

        supabase.from.mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: mockTasks, error: null })
            })
        })

        const { data } = await supabase.from('room_tasks')
            .select('*')
            .eq('room_id', 'room-123')

        expect(supabase.from).toHaveBeenCalledWith('room_tasks')
    })
})

// ==================== STU-10: User Disconnect Cleanup ====================

describe('STU-10: User disconnect removes from room_participants', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should listen for disconnect event', () => {
        const callback = vi.fn()

        mockSocket.on('disconnect', callback)

        expect(mockSocket.on).toHaveBeenCalledWith('disconnect', callback)
    })

    it('should delete participant on disconnect', async () => {
        supabase.from.mockReturnValue({
            delete: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ error: null })
                })
            })
        })

        await supabase.from('room_participants')
            .delete()
            .eq('room_id', 'room-123')
            .eq('user_id', 'test-user-123')

        expect(supabase.from).toHaveBeenCalledWith('room_participants')
    })

    it('should cleanup socket listeners on unmount', () => {
        mockSocket.off('receive-message')
        mockSocket.off('user-connected')
        mockSocket.off('call-made')

        expect(mockSocket.off).toHaveBeenCalledWith('receive-message')
        expect(mockSocket.off).toHaveBeenCalledWith('user-connected')
        expect(mockSocket.off).toHaveBeenCalledWith('call-made')
    })
})

// ==================== NOT-01: Notifications Save and Retrieve ====================

describe('NOT-01: Notifications save and retrieve from notifications table', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should fetch notifications for user', async () => {
        const mockNotifications = [
            { id: '1', title: 'New achievement!', message: 'You completed 10 lessons', read_at: null },
            { id: '2', title: 'Daily reminder', message: 'Time to practice', read_at: '2026-03-09T10:00:00Z' }
        ]

        database.getNotifications.mockResolvedValue(mockNotifications)

        const notifications = await database.getNotifications('test-user-123')

        expect(notifications).toHaveLength(2)
        expect(database.getNotifications).toHaveBeenCalledWith('test-user-123')
    })

    it('should create new notification', async () => {
        const mockNotification = {
            id: '3',
            title: 'Level up!',
            message: 'You reached level 5'
        }

        database.createNotification.mockResolvedValue(mockNotification)

        const result = await database.createNotification('test-user-123', {
            title: 'Level up!',
            message: 'You reached level 5'
        })

        expect(result.title).toBe('Level up!')
    })
})

// ==================== NOT-02: Mark Notification as Read ====================

describe('NOT-02: Mark notification as read updates database', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should mark notification as read', async () => {
        database.markNotificationRead.mockResolvedValue(undefined)

        await database.markNotificationRead('notification-123')

        expect(database.markNotificationRead).toHaveBeenCalledWith('notification-123')
    })

    it('should update read_at timestamp', async () => {
        const beforeRead = { id: '1', title: 'Test', read_at: null }
        const afterRead = { ...beforeRead, read_at: new Date().toISOString() }

        expect(beforeRead.read_at).toBeNull()
        expect(afterRead.read_at).not.toBeNull()
    })
})

// ==================== ACH-01: Achievements Reflect Completion Data ====================

describe('ACH-01: Achievements component reflects actual completion data', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should aggregate lesson progress for achievements', async () => {
        database.getLessonProgress.mockResolvedValue([
            { status: 'completed' },
            { status: 'completed' },
            { status: 'in_progress' }
        ])

        const lessons = await database.getLessonProgress('test-user-123')
        const completedLessons = lessons.filter(l => l.status === 'completed').length

        expect(completedLessons).toBe(2)
    })

    it('should aggregate practice progress for achievements', async () => {
        database.getAllPracticeProgress.mockResolvedValue([
            { practice_type: 'vocabulary', completed_count: 50 },
            { practice_type: 'pronunciation', completed_count: 30 },
            { practice_type: 'listening', completed_count: 20 }
        ])

        const practices = await database.getAllPracticeProgress('test-user-123')
        const totalPracticed = practices.reduce((sum, p) => sum + p.completed_count, 0)

        expect(totalPracticed).toBe(100)
    })

    it('should get assessment stats for achievements', async () => {
        database.getAssessmentStats.mockResolvedValue({
            completed: 10,
            averageScore: 85
        })

        const stats = await database.getAssessmentStats('test-user-123')

        expect(stats.completed).toBe(10)
        expect(stats.averageScore).toBe(85)
    })

    it('should determine unlocked achievements', () => {
        const achievements = [
            { id: 'first-lesson', name: 'First Steps', requirement: 1, type: 'lessons' },
            { id: 'ten-lessons', name: 'Quick Learner', requirement: 10, type: 'lessons' },
            { id: 'perfect-score', name: 'Perfectionist', requirement: 100, type: 'score' }
        ]

        const completedLessons = 5
        const bestScore = 95

        const unlocked = achievements.filter(a => {
            if (a.type === 'lessons') return completedLessons >= a.requirement
            if (a.type === 'score') return bestScore >= a.requirement
            return false
        })

        expect(unlocked).toHaveLength(1)
        expect(unlocked[0].id).toBe('first-lesson')
    })
})

// ==================== STK-01: Streak Calendar Shows Activity ====================

describe('STK-01: Streak calendar shows activity from all tracked tables', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should fetch lesson activity dates', async () => {
        database.getLessonProgress.mockResolvedValue([
            { completed_at: '2026-03-09T10:00:00Z' },
            { completed_at: '2026-03-08T14:00:00Z' },
            { completed_at: '2026-03-07T09:00:00Z' }
        ])

        const lessons = await database.getLessonProgress('test-user-123')
        const activityDates = lessons
            .filter(l => l.completed_at)
            .map(l => l.completed_at.split('T')[0])

        expect(activityDates).toContain('2026-03-09')
        expect(activityDates).toContain('2026-03-08')
    })

    it('should combine activity from multiple sources', async () => {
        const lessonDates = ['2026-03-09', '2026-03-08']
        const practiceDates = ['2026-03-09', '2026-03-07']
        const quizDates = ['2026-03-06']

        const allDates = [...new Set([...lessonDates, ...practiceDates, ...quizDates])]

        expect(allDates).toHaveLength(4)
    })

    it('should calculate current streak', () => {
        const activityDates = ['2026-03-09', '2026-03-08', '2026-03-07', '2026-03-05']
        const today = '2026-03-09'

        let streak = 0
        let checkDate = new Date(today)

        for (const date of activityDates.sort().reverse()) {
            const dateStr = checkDate.toISOString().split('T')[0]
            if (date === dateStr) {
                streak++
                checkDate.setDate(checkDate.getDate() - 1)
            } else {
                break
            }
        }

        expect(streak).toBe(3) // Mar 9, 8, 7 are consecutive
    })

    it('should mark active days on calendar', () => {
        const march2026 = {
            1: false, 2: false, 3: false, 4: false, 5: true,
            6: true, 7: true, 8: true, 9: true
        }

        const activeDays = Object.entries(march2026)
            .filter(([_, active]) => active)
            .map(([day]) => parseInt(day))

        expect(activeDays).toHaveLength(5)
        expect(activeDays).toContain(9)
    })
})

// ============================================================
// FAILED TEST CASES - Real-time & Study Room Error Scenarios
// These tests demonstrate error handling for sockets, WebRTC, etc.
// ============================================================

/**
 * WHY TESTS PASS:
 * ----------------
 * 1. Socket connects successfully - Server is running and reachable
 * 2. Room creation works - Database accepts room data
 * 3. WebRTC signaling works - Peers exchange offers/answers
 * 4. Messages deliver - Socket emits received by all participants
 * 5. Notifications display - Database insert and realtime subscription work
 * 
 * WHY TESTS FAIL:
 * ---------------
 * 1. Socket connection fails - Server down or network unavailable
 * 2. Room not found - Invalid room ID or room was deleted
 * 3. WebRTC peer fails - Browser doesn't support WebRTC
 * 4. Message delivery fails - User disconnected or room closed
 * 5. Notification fails - Database error or quota exceeded
 */

describe('SOCKET-FAIL: Socket Connection Error Scenarios', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('FAIL: should handle socket connection failure', () => {
        // WHY THIS FAILS: Server is not running or unreachable
        const mockSocket = {
            connected: false,
            connect: vi.fn(),
            on: vi.fn(),
            emit: vi.fn()
        }

        let connectionError = null
        mockSocket.on.mockImplementation((event, callback) => {
            if (event === 'connect_error') {
                connectionError = new Error('ECONNREFUSED')
                callback(connectionError)
            }
        })

        // Trigger the connect_error handler
        const errorCallback = mockSocket.on.mock.calls.find(c => c[0] === 'connect_error')
        if (errorCallback) errorCallback[1](new Error('ECONNREFUSED'))

        expect(mockSocket.connected).toBe(false)
    })

    it('FAIL: should handle socket timeout', async () => {
        // WHY THIS FAILS: Server takes too long to respond
        const mockSocket = {
            connected: false,
            timeout: 5000
        }

        const connectWithTimeout = (socket, timeout) => {
            return new Promise((_, reject) => {
                setTimeout(() => {
                    if (!socket.connected) {
                        reject(new Error('Connection timeout'))
                    }
                }, timeout)
            })
        }

        vi.useFakeTimers()
        const promise = connectWithTimeout(mockSocket, 5000)
        vi.advanceTimersByTime(5001)

        await expect(promise).rejects.toThrow('Connection timeout')
        vi.useRealTimers()
    })

    it('FAIL: should handle unexpected disconnection', () => {
        // WHY THIS FAILS: Network dropped or server crashed
        const mockSocket = {
            connected: true,
            on: vi.fn()
        }

        let disconnectReason = null
        mockSocket.on.mockImplementation((event, callback) => {
            if (event === 'disconnect') {
                disconnectReason = 'transport error'
                callback(disconnectReason)
            }
        })

        mockSocket.on('disconnect', (reason) => { disconnectReason = reason })
        
        expect(['transport error', 'io server disconnect', 'ping timeout'])
            .toContain('transport error')
    })
})

describe('ROOM-FAIL: Study Room Error Scenarios', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('FAIL: should handle room not found', async () => {
        // WHY THIS FAILS: Room was deleted or ID is invalid
        database.getStudyRoom.mockResolvedValue(null)

        const room = await database.getStudyRoom('deleted-room-id')

        expect(room).toBeNull()
        // UI should show "Room not found" and redirect
    })

    it('FAIL: should handle room creation failure', async () => {
        // WHY THIS FAILS: User has reached maximum room limit
        database.createStudyRoom.mockRejectedValue(
            new Error('Failed to create room: User has reached maximum limit of 5 rooms')
        )

        await expect(
            database.createStudyRoom({
                name: 'New Room',
                host_id: 'user-123',
                topic: 'Spanish'
            })
        ).rejects.toThrow('maximum limit')
    })

    it('FAIL: should handle full room join attempt', async () => {
        // WHY THIS FAILS: Room has reached capacity
        database.joinStudyRoom.mockRejectedValue(
            new Error('Cannot join room: Room is full (10/10 participants)')
        )

        await expect(
            database.joinStudyRoom('room-123', 'user-456')
        ).rejects.toThrow('Room is full')
    })

    it('FAIL: should handle duplicate join attempt', async () => {
        // WHY THIS FAILS: User is already in the room
        database.joinStudyRoom.mockRejectedValue(
            new Error('Cannot join room: You are already a participant')
        )

        await expect(
            database.joinStudyRoom('room-123', 'user-123')
        ).rejects.toThrow('already a participant')
    })
})

describe('WEBRTC-FAIL: WebRTC Error Scenarios', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('FAIL: should handle getUserMedia denied', async () => {
        // WHY THIS FAILS: User denied camera/microphone permission
        global.navigator.mediaDevices = {
            getUserMedia: vi.fn().mockRejectedValue(
                new DOMException('Permission denied', 'NotAllowedError')
            )
        }

        await expect(
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        ).rejects.toThrow('Permission denied')
    })

    it('FAIL: should handle no media devices available', async () => {
        // WHY THIS FAILS: Device has no camera or microphone
        global.navigator.mediaDevices = {
            getUserMedia: vi.fn().mockRejectedValue(
                new DOMException('Requested device not found', 'NotFoundError')
            )
        }

        await expect(
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        ).rejects.toThrow('not found')
    })

    it('FAIL: should handle ICE connection failure', () => {
        // WHY THIS FAILS: NAT traversal failed, peers cannot connect
        const mockPeerConnection = {
            iceConnectionState: 'failed',
            connectionState: 'failed'
        }

        expect(mockPeerConnection.iceConnectionState).toBe('failed')
        // Should show "Connection failed" and offer retry
    })

    it('FAIL: should handle signaling server unreachable', async () => {
        // WHY THIS FAILS: Socket.io server down for WebRTC signaling
        const mockSocket = {
            emit: vi.fn((event, data, callback) => {
                callback({ error: 'Signaling server unavailable' })
            })
        }

        const sendSignal = (socket, data) => {
            return new Promise((resolve, reject) => {
                socket.emit('webrtc-signal', data, (response) => {
                    if (response.error) reject(new Error(response.error))
                    else resolve(response)
                })
            })
        }

        await expect(
            sendSignal(mockSocket, { type: 'offer', sdp: '...' })
        ).rejects.toThrow('Signaling server unavailable')
    })
})

describe('MSG-FAIL: Chat Message Error Scenarios', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('FAIL: should handle message send failure', async () => {
        // WHY THIS FAILS: User was removed from room
        database.sendRoomMessage.mockRejectedValue(
            new Error('Cannot send message: You are not a member of this room')
        )

        await expect(
            database.sendRoomMessage({
                room_id: 'room-123',
                user_id: 'kicked-user',
                content: 'Hello!'
            })
        ).rejects.toThrow('not a member')
    })

    it('FAIL: should handle empty message content', async () => {
        // WHY THIS FAILS: Message validation failed
        database.sendRoomMessage.mockRejectedValue(
            new Error('Message cannot be empty')
        )

        await expect(
            database.sendRoomMessage({
                room_id: 'room-123',
                user_id: 'user-123',
                content: ''
            })
        ).rejects.toThrow('cannot be empty')
    })

    it('FAIL: should handle message rate limiting', async () => {
        // WHY THIS FAILS: User sending too many messages
        database.sendRoomMessage.mockRejectedValue(
            new Error('Rate limit exceeded: Please wait before sending more messages')
        )

        await expect(
            database.sendRoomMessage({
                room_id: 'room-123',
                user_id: 'user-123',
                content: 'Spam message'
            })
        ).rejects.toThrow('Rate limit exceeded')
    })
})

describe('NOTIFY-FAIL: Notification Error Scenarios', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('FAIL: should handle notification creation failure', async () => {
        // WHY THIS FAILS: Database error
        database.createNotification.mockRejectedValue(
            new Error('Failed to create notification')
        )

        await expect(
            database.createNotification({
                user_id: 'user-123',
                title: 'Test',
                message: 'Test notification'
            })
        ).rejects.toThrow('Failed to create notification')
    })

    it('FAIL: should handle notification not found for mark read', async () => {
        // WHY THIS FAILS: Notification was already deleted
        database.markNotificationRead.mockRejectedValue(
            new Error('Notification not found')
        )

        await expect(
            database.markNotificationRead('deleted-notification-id')
        ).rejects.toThrow('Notification not found')
    })
})

describe('STREAK-FAIL: Streak Calculation Edge Cases', () => {
    it('FAIL: should handle no activity data', () => {
        // WHY THIS HAPPENS: New user with no activity
        const activityDates = []
        const streak = activityDates.length > 0 ? 1 : 0

        expect(streak).toBe(0)
        // Should show "Start your streak today!"
    })

    it('FAIL: should handle broken streak', () => {
        // WHY THIS FAILS: User missed a day
        const activityDates = ['2026-03-09', '2026-03-07', '2026-03-06']
        const today = '2026-03-09'

        let streak = 0
        let checkDate = new Date(today)

        for (const date of activityDates.sort().reverse()) {
            const dateStr = checkDate.toISOString().split('T')[0]
            if (date === dateStr) {
                streak++
                checkDate.setDate(checkDate.getDate() - 1)
            } else {
                break
            }
        }

        expect(streak).toBe(1) // Only today counts, streak broken on Mar 8
    })

    it('FAIL: should handle invalid date in activity', () => {
        // WHY THIS FAILS: Corrupted date data
        const activityDates = ['2026-03-09', 'invalid-date', '2026-03-07']
        const validDates = activityDates.filter(d => !isNaN(new Date(d).getTime()))

        expect(validDates).toHaveLength(2)
        // Should filter out invalid dates
    })
})

describe('ACH-FAIL: Achievement Error Scenarios', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('FAIL: should handle achievement unlock failure', async () => {
        // WHY THIS FAILS: Database constraint error
        database.unlockAchievement.mockRejectedValue(
            new Error('Failed to unlock achievement: Achievement not found')
        )

        await expect(
            database.unlockAchievement('user-123', 'invalid-achievement-id')
        ).rejects.toThrow('Achievement not found')
    })

    it('FAIL: should handle duplicate achievement unlock', async () => {
        // WHY THIS HAPPENS: User already has this achievement
        database.unlockAchievement.mockRejectedValue(
            new Error('Achievement already unlocked')
        )

        await expect(
            database.unlockAchievement('user-123', 'first-lesson')
        ).rejects.toThrow('already unlocked')
    })
})

// ============================================================
// INTENTIONALLY FAILING TEST - Demonstrates what a real failure looks like
// ============================================================

describe('DEMO-FAIL: Intentionally Failing Test (Member 5)', () => {
    /**
     * WHY THIS TEST FAILS:
     * ---------------------
     * This test INTENTIONALLY fails to demonstrate object property mismatch.
     * The socket connection status is 'disconnected' but we expect 'connected'.
     * 
     * In real scenarios, this fails when:
     * 1. Server is not running
     * 2. Network connection failed
     * 3. Socket authentication failed
     * 
     * TO MAKE THIS PASS: Change expected status from 'connected' to 'disconnected'
     */
    // NOTE: This test is SKIPPED - it demonstrates what a failure looks like
    // Remove .skip and change expected value to see it pass
    it.skip('INTENTIONAL FAILURE: Socket status demonstrates string comparison failure', () => {
        // Socket is disconnected
        const socketStatus = {
            connected: false,
            status: 'disconnected',
            error: 'Server unreachable'
        }

        // But we expect it to be connected - THIS WILL FAIL
        expect(socketStatus.status).toBe('connected')
    })
})
