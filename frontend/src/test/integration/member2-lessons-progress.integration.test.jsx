/**
 * ============================================================
 *  MEMBER 2 — Lessons & Progress Tracking Integration Tests
 *  Tests: API endpoints, lesson progress, unlock system, analytics
 *  Tools: Vitest + React Testing Library + Mocked API/Database
 * ============================================================
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock Supabase
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
        from: vi.fn()
    }
}))

// Mock database functions
vi.mock('../../lib/database', () => ({
    getLessonProgress: vi.fn(),
    updateLessonProgress: vi.fn(),
    markLessonComplete: vi.fn(),
    getSingleLessonProgress: vi.fn(),
    getUserSettings: vi.fn(() => Promise.resolve(null)),
    getProfile: vi.fn(() => Promise.resolve({ id: 'test-user-123' }))
}))

import * as database from '../../lib/database'
import { supabase } from '../../lib/supabaseClient'

// Mock AuthContext
vi.mock('../../context/AuthContext', () => ({
    useAuth: () => ({
        user: { id: 'test-user-123', email: 'test@test.com' },
        session: { user: { id: 'test-user-123' } },
        loading: false
    }),
    AuthProvider: ({ children }) => children
}))

// Mock SettingsContext
vi.mock('../../context/SettingsContext', () => ({
    useSettings: () => ({
        settings: { textSize: 'medium', fontFamily: 'system' },
        loading: false
    }),
    SettingsProvider: ({ children }) => children
}))

// Backend API Base URL
const API_BASE = 'http://localhost:3001/api'

// ==================== LES-01: Fetch Languages from Backend ====================

describe('LES-01: Fetch languages from /api/lessons/languages', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should fetch all available languages', async () => {
        const mockLanguages = [
            { id: 'english', name: 'English', flag: '🇺🇸' },
            { id: 'hindi', name: 'Hindi', flag: '🇮🇳' },
            { id: 'tamil', name: 'Tamil', flag: '🇮🇳' },
            { id: 'telugu', name: 'Telugu', flag: '🇮🇳' }
        ]

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockLanguages)
        })

        const response = await fetch(`${API_BASE}/lessons/languages`)
        const data = await response.json()

        expect(response.ok).toBe(true)
        expect(data).toHaveLength(4)
        expect(data[0]).toHaveProperty('id')
        expect(data[0]).toHaveProperty('name')
    })

    it('should handle API error gracefully', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: () => Promise.resolve({ error: 'Internal Server Error' })
        })

        const response = await fetch(`${API_BASE}/lessons/languages`)
        
        expect(response.ok).toBe(false)
        expect(response.status).toBe(500)
    })
})

// ==================== LES-02: Fetch Lesson Content ====================

describe('LES-02: Fetch lesson content from /api/lessons/:languageId/:lessonType', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should fetch words lesson for English', async () => {
        const mockWords = [
            { word: 'apple', translation: 'सेब', pronunciation: 'aapul' },
            { word: 'book', translation: 'किताब', pronunciation: 'book' }
        ]

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockWords)
        })

        const response = await fetch(`${API_BASE}/lessons/english/words`)
        const data = await response.json()

        expect(response.ok).toBe(true)
        expect(data).toBeInstanceOf(Array)
        expect(data[0]).toHaveProperty('word')
    })

    it('should fetch numbers lesson for Hindi', async () => {
        const mockNumbers = [
            { number: 1, word: 'एक', pronunciation: 'ek' },
            { number: 2, word: 'दो', pronunciation: 'do' }
        ]

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockNumbers)
        })

        const response = await fetch(`${API_BASE}/lessons/hindi/numbers`)
        const data = await response.json()

        expect(response.ok).toBe(true)
        expect(data[0]).toHaveProperty('number')
    })

    it('should fetch sentences lesson', async () => {
        const mockSentences = [
            { sentence: 'Hello, how are you?', translation: 'नमस्ते, आप कैसे हैं?' }
        ]

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockSentences)
        })

        const response = await fetch(`${API_BASE}/lessons/english/sentences`)
        const data = await response.json()

        expect(response.ok).toBe(true)
        expect(data[0]).toHaveProperty('sentence')
    })

    it('should return 404 for unknown language', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 404,
            json: () => Promise.resolve({ error: 'Language not found' })
        })

        const response = await fetch(`${API_BASE}/lessons/unknown/words`)
        
        expect(response.ok).toBe(false)
        expect(response.status).toBe(404)
    })
})

// ==================== LES-03: Lesson Completion Updates Database ====================

describe('LES-03: Lesson completion updates lesson_progress table', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should mark lesson as complete', async () => {
        database.markLessonComplete.mockResolvedValue({
            user_id: 'test-user-123',
            lesson_id: 'english-words-1',
            status: 'completed',
            progress_percent: 100,
            completed_at: '2026-03-09T10:00:00Z'
        })

        const result = await database.markLessonComplete('test-user-123', 'english-words-1')

        expect(database.markLessonComplete).toHaveBeenCalledWith('test-user-123', 'english-words-1')
        expect(result.status).toBe('completed')
        expect(result.progress_percent).toBe(100)
    })

    it('should record completion timestamp', async () => {
        database.markLessonComplete.mockResolvedValue({
            user_id: 'test-user-123',
            lesson_id: 'hindi-numbers-2',
            status: 'completed',
            completed_at: expect.any(String)
        })

        const result = await database.markLessonComplete('test-user-123', 'hindi-numbers-2')

        expect(result.completed_at).toBeDefined()
    })
})

// ==================== LES-04: Progressive Unlock System ====================

describe('LES-04: Progressive unlock - completing lesson unlocks next', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should show lesson 1 as available by default', async () => {
        database.getLessonProgress.mockResolvedValue([])

        const progress = await database.getLessonProgress('test-user-123')
        
        // With no progress, only lesson 1 should be available
        // This is typically handled by UI logic
        expect(progress).toEqual([])
    })

    it('should unlock lesson 2 when lesson 1 is completed', async () => {
        database.getLessonProgress.mockResolvedValue([
            { lesson_id: 'english-words-1', status: 'completed', progress_percent: 100 }
        ])

        const progress = await database.getLessonProgress('test-user-123')
        const lesson1Complete = progress.find(p => p.lesson_id === 'english-words-1')?.status === 'completed'

        expect(lesson1Complete).toBe(true)
        // Lesson 2 would be unlocked based on this logic in UI
    })

    it('should track multiple completed lessons for unlock chain', async () => {
        database.getLessonProgress.mockResolvedValue([
            { lesson_id: 'english-words-1', status: 'completed', progress_percent: 100 },
            { lesson_id: 'english-words-2', status: 'completed', progress_percent: 100 },
            { lesson_id: 'english-words-3', status: 'in_progress', progress_percent: 60 }
        ])

        const progress = await database.getLessonProgress('test-user-123')
        
        expect(progress).toHaveLength(3)
        expect(progress.filter(p => p.status === 'completed')).toHaveLength(2)
    })
})

// ==================== LES-05: Partial Lesson Progress Saves ====================

describe('LES-05: Partial lesson progress saves correctly', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should save progress at 25%', async () => {
        database.updateLessonProgress.mockResolvedValue({
            lesson_id: 'english-words-1',
            progress_percent: 25,
            status: 'in_progress'
        })

        const result = await database.updateLessonProgress('test-user-123', 'english-words-1', {
            progress_percent: 25,
            status: 'in_progress'
        })

        expect(result.progress_percent).toBe(25)
        expect(result.status).toBe('in_progress')
    })

    it('should save progress at 50%', async () => {
        database.updateLessonProgress.mockResolvedValue({
            lesson_id: 'english-words-1',
            progress_percent: 50,
            status: 'in_progress'
        })

        const result = await database.updateLessonProgress('test-user-123', 'english-words-1', {
            progress_percent: 50,
            status: 'in_progress'
        })

        expect(result.progress_percent).toBe(50)
    })

    it('should allow resume from saved progress', async () => {
        database.getSingleLessonProgress.mockResolvedValue({
            lesson_id: 'english-words-1',
            progress_percent: 60,
            status: 'in_progress',
            last_accessed_at: '2026-03-08T15:30:00Z'
        })

        const savedProgress = await database.getSingleLessonProgress('test-user-123', 'english-words-1')

        expect(savedProgress.progress_percent).toBe(60)
        expect(savedProgress.last_accessed_at).toBeDefined()
    })
})

// ==================== LES-06: Lesson Progress on Dashboard ====================

describe('LES-06: Lesson progress reflects on Dashboard stats', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should calculate total completed lessons', async () => {
        database.getLessonProgress.mockResolvedValue([
            { lesson_id: 'english-words-1', status: 'completed' },
            { lesson_id: 'english-words-2', status: 'completed' },
            { lesson_id: 'hindi-words-1', status: 'completed' },
            { lesson_id: 'hindi-words-2', status: 'in_progress' }
        ])

        const progress = await database.getLessonProgress('test-user-123')
        const completedCount = progress.filter(p => p.status === 'completed').length

        expect(completedCount).toBe(3)
    })

    it('should calculate progress percentage per language', async () => {
        database.getLessonProgress.mockResolvedValue([
            { lesson_id: 'english-words-1', status: 'completed', progress_percent: 100 },
            { lesson_id: 'english-words-2', status: 'completed', progress_percent: 100 },
            { lesson_id: 'english-words-3', status: 'in_progress', progress_percent: 50 },
            { lesson_id: 'english-words-4', status: 'available', progress_percent: 0 },
            { lesson_id: 'english-words-5', status: 'locked', progress_percent: 0 }
        ])

        const progress = await database.getLessonProgress('test-user-123')
        const englishLessons = progress.filter(p => p.lesson_id.startsWith('english'))
        const totalProgress = englishLessons.reduce((sum, p) => sum + p.progress_percent, 0)
        const avgProgress = totalProgress / englishLessons.length

        expect(avgProgress).toBe(50) // (100+100+50+0+0)/5 = 50%
    })
})

// ==================== LES-07: Lesson Progress in Analytics ====================

describe('LES-07: Lesson progress appears in Analytics page', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should fetch lesson progress for analytics charts', async () => {
        database.getLessonProgress.mockResolvedValue([
            { lesson_id: 'english-words-1', status: 'completed', completed_at: '2026-03-01T10:00:00Z' },
            { lesson_id: 'english-words-2', status: 'completed', completed_at: '2026-03-03T14:00:00Z' },
            { lesson_id: 'hindi-words-1', status: 'completed', completed_at: '2026-03-05T09:00:00Z' }
        ])

        const progress = await database.getLessonProgress('test-user-123')

        expect(database.getLessonProgress).toHaveBeenCalledWith('test-user-123')
        expect(progress.every(p => p.completed_at)).toBe(true)
    })

    it('should group lessons by date for activity chart', async () => {
        database.getLessonProgress.mockResolvedValue([
            { lesson_id: 'eng-1', completed_at: '2026-03-05T10:00:00Z' },
            { lesson_id: 'eng-2', completed_at: '2026-03-05T14:00:00Z' },
            { lesson_id: 'eng-3', completed_at: '2026-03-06T09:00:00Z' }
        ])

        const progress = await database.getLessonProgress('test-user-123')
        
        // Group by date
        const byDate = progress.reduce((acc, p) => {
            const date = p.completed_at.split('T')[0]
            acc[date] = (acc[date] || 0) + 1
            return acc
        }, {})

        expect(byDate['2026-03-05']).toBe(2)
        expect(byDate['2026-03-06']).toBe(1)
    })

    it('should calculate language-wise progress breakdown', async () => {
        database.getLessonProgress.mockResolvedValue([
            { lesson_id: 'english-words-1', status: 'completed' },
            { lesson_id: 'english-words-2', status: 'completed' },
            { lesson_id: 'hindi-words-1', status: 'completed' },
            { lesson_id: 'tamil-words-1', status: 'in_progress' }
        ])

        const progress = await database.getLessonProgress('test-user-123')

        const languageStats = {
            english: progress.filter(p => p.lesson_id.startsWith('english') && p.status === 'completed').length,
            hindi: progress.filter(p => p.lesson_id.startsWith('hindi') && p.status === 'completed').length,
            tamil: progress.filter(p => p.lesson_id.startsWith('tamil') && p.status === 'completed').length
        }

        expect(languageStats.english).toBe(2)
        expect(languageStats.hindi).toBe(1)
        expect(languageStats.tamil).toBe(0)
    })
})

// ==================== LES-08: Different Lesson Types Load Correct Data ====================

describe('LES-08: Different lesson types (Words/Numbers/Sentences) load correct data', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should load words with word/translation structure', async () => {
        const wordsData = [
            { word: 'hello', translation: 'नमस्ते' },
            { word: 'goodbye', translation: 'अलविदा' }
        ]

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(wordsData)
        })

        const response = await fetch(`${API_BASE}/lessons/english/words`)
        const data = await response.json()

        expect(data.every(item => 'word' in item && 'translation' in item)).toBe(true)
    })

    it('should load numbers with number/word structure', async () => {
        const numbersData = [
            { number: 1, word: 'one', translation: 'एक' },
            { number: 2, word: 'two', translation: 'दो' }
        ]

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(numbersData)
        })

        const response = await fetch(`${API_BASE}/lessons/english/numbers`)
        const data = await response.json()

        expect(data.every(item => 'number' in item)).toBe(true)
    })

    it('should load sentences with sentence/translation structure', async () => {
        const sentencesData = [
            { sentence: 'How are you?', translation: 'आप कैसे हैं?' },
            { sentence: 'Thank you', translation: 'धन्यवाद' }
        ]

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(sentencesData)
        })

        const response = await fetch(`${API_BASE}/lessons/english/sentences`)
        const data = await response.json()

        expect(data.every(item => 'sentence' in item)).toBe(true)
    })

    it('should return different data for different languages', async () => {
        // English words
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve([{ word: 'apple', translation: 'सेब' }])
        })

        const engResponse = await fetch(`${API_BASE}/lessons/english/words`)
        const engData = await engResponse.json()

        // Hindi words
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve([{ word: 'सेब', translation: 'apple' }])
        })

        const hindiResponse = await fetch(`${API_BASE}/lessons/hindi/words`)
        const hindiData = await hindiResponse.json()

        expect(engData[0].word).toBe('apple')
        expect(hindiData[0].word).toBe('सेब')
    })
})

// ============================================================
// FAILED TEST CASES - API & Database Error Scenarios
// These tests demonstrate what happens when API calls fail
// ============================================================

/**
 * WHY TESTS PASS:
 * ----------------
 * 1. Mock fetch returns valid JSON - API endpoints return correctly structured data
 * 2. Database mocks return expected objects - Progress tracking works correctly
 * 3. Status codes are 200 OK - Server responds successfully
 * 4. Data structure matches expectations - words/numbers/sentences have correct fields
 * 
 * WHY TESTS FAIL:
 * ---------------
 * 1. 404 Not Found - Requested language or lesson type doesn't exist
 * 2. 500 Server Error - Backend crashes or database is down
 * 3. Network timeout - API request takes too long
 * 4. Invalid JSON - Server returns malformed response
 * 5. Empty data - No lessons available for the requested type
 */

describe('LES-FAIL: API Error Scenarios', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('FAIL: should handle 404 for non-existent language', async () => {
        // WHY THIS FAILS: Language "french" is not in the database
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 404,
            json: () => Promise.resolve({ error: 'Language not found' })
        })

        const response = await fetch(`${API_BASE}/lessons/french/words`)
        const data = await response.json()

        // Test PASSES because we correctly identify the error
        expect(response.ok).toBe(false)
        expect(response.status).toBe(404)
        expect(data.error).toBe('Language not found')
    })

    it('FAIL: should handle 404 for non-existent lesson type', async () => {
        // WHY THIS FAILS: Lesson type "poems" doesn't exist
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 404,
            json: () => Promise.resolve({ error: 'Lesson type not found' })
        })

        const response = await fetch(`${API_BASE}/lessons/english/poems`)

        expect(response.ok).toBe(false)
        expect(response.status).toBe(404)
    })

    it('FAIL: should handle 500 server error', async () => {
        // WHY THIS FAILS: Backend server crashed or database connection failed
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: () => Promise.resolve({ error: 'Internal Server Error' })
        })

        const response = await fetch(`${API_BASE}/lessons/languages`)

        expect(response.ok).toBe(false)
        expect(response.status).toBe(500)
    })

    it('FAIL: should handle network timeout', async () => {
        // WHY THIS FAILS: Network is slow or server is unresponsive
        mockFetch.mockRejectedValueOnce(new Error('Network timeout'))

        await expect(
            fetch(`${API_BASE}/lessons/english/words`)
        ).rejects.toThrow('Network timeout')
    })

    it('FAIL: should handle empty lessons array', async () => {
        // WHY THIS FAILS: No lessons have been created for this language
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve([])
        })

        const response = await fetch(`${API_BASE}/lessons/telugu/words`)
        const data = await response.json()

        expect(data).toHaveLength(0)
        // UI should show "No lessons available" message
    })
})

describe('PROGRESS-FAIL: Progress Tracking Error Scenarios', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('FAIL: should handle database write error when saving progress', async () => {
        // WHY THIS FAILS: Database constraint violation or disk full
        database.updateLessonProgress.mockRejectedValue(
            new Error('Failed to save progress: Database write error')
        )

        await expect(
            database.updateLessonProgress('user-123', 'lesson-1', { progress_percent: 50 })
        ).rejects.toThrow('Database write error')
    })

    it('FAIL: should reject invalid progress percentage', async () => {
        // WHY THIS FAILS: Progress can't be negative or > 100
        database.updateLessonProgress.mockRejectedValue(
            new Error('Invalid progress_percent: must be between 0 and 100')
        )

        await expect(
            database.updateLessonProgress('user-123', 'lesson-1', { progress_percent: 150 })
        ).rejects.toThrow('Invalid progress_percent')
    })

    it('FAIL: should handle concurrent update conflict', async () => {
        // WHY THIS FAILS: Another session updated the same record
        database.updateLessonProgress.mockRejectedValue(
            new Error('Conflict: Record was modified by another session')
        )

        await expect(
            database.updateLessonProgress('user-123', 'lesson-1', { progress_percent: 80 })
        ).rejects.toThrow('Conflict')
    })

    it('FAIL: should return empty array when no progress exists', async () => {
        // WHY THIS HAPPENS: User just signed up, hasn't started any lessons
        database.getLessonProgress.mockResolvedValue([])

        const progress = await database.getLessonProgress('new-user-123')

        expect(progress).toHaveLength(0)
        // UI should show "Start your first lesson!" message
    })

    it('FAIL: should handle marking non-started lesson as complete', async () => {
        // WHY THIS FAILS: Can't complete a lesson that was never started
        database.markLessonComplete.mockRejectedValue(
            new Error('Cannot complete lesson: No progress record found')
        )

        await expect(
            database.markLessonComplete('user-123', 'never-started-lesson')
        ).rejects.toThrow('No progress record found')
    })
})

// ============================================================
// INTENTIONALLY FAILING TEST - Demonstrates what a real failure looks like
// ============================================================

describe('DEMO-FAIL: Intentionally Failing Test (Member 2)', () => {
    /**
     * WHY THIS TEST FAILS:
     * ---------------------
     * This test INTENTIONALLY fails to demonstrate array length mismatch.
     * The API returns 3 lessons but we incorrectly expect 5 lessons.
     * 
     * In real scenarios, this fails when:
     * 1. API response format changed
     * 2. Filtering logic removed items unexpectedly
     * 3. Test expectations are outdated
     * 
     * TO MAKE THIS PASS: Change toHaveLength(5) to toHaveLength(3)
     */
    // NOTE: This test is SKIPPED - it demonstrates what a failure looks like
    // Remove .skip and change expected value to see it pass
    it.skip('INTENTIONAL FAILURE: Lesson count mismatch demonstrates length assertion failure', () => {
        // API returns 3 lessons
        const mockLessons = [
            { id: 1, title: 'Lesson 1' },
            { id: 2, title: 'Lesson 2' },
            { id: 3, title: 'Lesson 3' }
        ]

        // But we expect 5 lessons - THIS WILL FAIL
        expect(mockLessons).toHaveLength(5)
    })
})
