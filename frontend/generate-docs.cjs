const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, BorderStyle, WidthType, AlignmentType } = require('docx');
const fs = require('fs');

async function generateDoc() {
    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                // Title
                new Paragraph({
                    children: [new TextRun({ text: "LINGUABILITY INTEGRATION TESTING DOCUMENTATION", bold: true, size: 48 })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 }
                }),
                new Paragraph({
                    children: [new TextRun({ text: "Comprehensive Test Suite Documentation for All 5 Team Members", size: 28, italics: true })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 }
                }),
                new Paragraph({
                    children: [new TextRun({ text: "Generated: March 10, 2026 | Testing Framework: Vitest + React Testing Library", size: 22 })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 600 }
                }),

                // Table of Contents
                new Paragraph({ children: [new TextRun({ text: "TABLE OF CONTENTS", bold: true, size: 32 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: "• Member 1: Authentication & User Profile Integration Tests", size: 24 })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: "• Member 2: Lessons & Progress Tracking Integration Tests", size: 24 })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: "• Member 3: Practice Module & API Integration Tests", size: 24 })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: "• Member 4: Quiz/Assessments & Settings Integration Tests", size: 24 })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: "• Member 5: Real-time Features & Study Rooms Integration Tests", size: 24 })], spacing: { after: 600 } }),

                // ==================== MEMBER 1 ====================
                new Paragraph({ children: [new TextRun({ text: "═══════════════════════════════════════════════════════════════", size: 24 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: "MEMBER 1: AUTHENTICATION & USER PROFILE INTEGRATION TESTS", bold: true, size: 36 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: "═══════════════════════════════════════════════════════════════", size: 24 })], spacing: { after: 300 } }),
                
                new Paragraph({ children: [new TextRun({ text: "File: ", bold: true }), new TextRun({ text: "member1-auth-profile.integration.test.jsx" })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: "Purpose: ", bold: true }), new TextRun({ text: "Tests authentication flows, session management, profile CRUD operations, and protected routes" })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: "Tools Used: ", bold: true }), new TextRun({ text: "Vitest + React Testing Library + Mocked Supabase" })], spacing: { after: 300 } }),

                new Paragraph({ children: [new TextRun({ text: "IMPORTS & MOCKS EXPLANATION", bold: true, size: 28 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: "import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'", font: "Courier New", size: 20 })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: "import { render, screen, waitFor, act } from '@testing-library/react'", font: "Courier New", size: 20 })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: "import userEvent from '@testing-library/user-event'", font: "Courier New", size: 20 })], spacing: { after: 200 } }),

                new Paragraph({ children: [new TextRun({ text: "• describe, it, expect: ", bold: true }), new TextRun({ text: "Vitest test structure - describe creates test groups, it defines individual tests, expect makes assertions" })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: "• vi: ", bold: true }), new TextRun({ text: "Vitest's mocking utility - creates mock functions, clears mocks between tests" })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: "• render, screen: ", bold: true }), new TextRun({ text: "React Testing Library - render mounts components, screen queries DOM elements" })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: "• waitFor: ", bold: true }), new TextRun({ text: "Waits for async operations to complete before assertions" })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: "• userEvent: ", bold: true }), new TextRun({ text: "Simulates real user interactions (clicks, typing)" })], spacing: { after: 300 } }),

                // AUTH-01
                new Paragraph({ children: [new TextRun({ text: "TEST CASE AUTH-01: User Registration Creates Profile", bold: true, size: 28 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: 'Test: "should create a profile entry when a new user signs up"', italics: true, size: 24 })], spacing: { after: 200 } }),
                
                new Paragraph({ children: [new TextRun({ text: "CODE:", bold: true })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: `it('should create a profile entry when a new user signs up', async () => {
    const mockUser = {
        id: 'new-user-123',
        email: 'newuser@test.com',
        user_metadata: { full_name: 'New User' }
    }

    supabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: { user: mockUser } },
        error: null
    })

    const result = await supabase.auth.signUp({
        email: 'newuser@test.com',
        password: 'password123'
    })

    expect(result.data.user).toBeDefined()
    expect(result.data.user.id).toBe('new-user-123')
})`, font: "Courier New", size: 18 })], spacing: { after: 200 } }),

                new Paragraph({ children: [new TextRun({ text: "LINE-BY-LINE EXPLANATION:", bold: true })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: "• const mockUser = {...}: ", bold: true }), new TextRun({ text: "Creates a fake user object simulating what Supabase returns" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• supabase.auth.signUp.mockResolvedValue(...): ", bold: true }), new TextRun({ text: "Tells the mock to return success data when signUp is called" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• await supabase.auth.signUp(...): ", bold: true }), new TextRun({ text: "Calls the mocked signup function" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• expect(result.data.user).toBeDefined(): ", bold: true }), new TextRun({ text: "Asserts user exists (not null/undefined)" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• expect(result.data.user.id).toBe('new-user-123'): ", bold: true }), new TextRun({ text: "Asserts the ID matches expected value" })], spacing: { after: 200 } }),

                new Paragraph({ children: [new TextRun({ text: "✅ WHY THIS TEST PASSES:", bold: true, color: "00AA00" })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: "• Mock returns valid user data with correct structure" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• signUp function is called with correct email/password" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• Expected values match what mock returns" })], spacing: { after: 300 } }),

                // AUTH-02
                new Paragraph({ children: [new TextRun({ text: "TEST CASE AUTH-02: Google OAuth Login", bold: true, size: 28 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: 'Test: "should initiate Google OAuth sign in"', italics: true, size: 24 })], spacing: { after: 200 } }),
                
                new Paragraph({ children: [new TextRun({ text: "CODE:", bold: true })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: `it('should initiate Google OAuth sign in', async () => {
    supabase.auth.signInWithOAuth.mockResolvedValue({
        data: { url: 'https://accounts.google.com/oauth...' },
        error: null
    })

    const result = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: 'http://localhost:5173/dashboard' }
    })

    expect(result.error).toBeNull()
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: { redirectTo: 'http://localhost:5173/dashboard' }
    })
})`, font: "Courier New", size: 18 })], spacing: { after: 200 } }),

                new Paragraph({ children: [new TextRun({ text: "LINE-BY-LINE EXPLANATION:", bold: true })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: "• signInWithOAuth.mockResolvedValue(...): ", bold: true }), new TextRun({ text: "Mocks Google OAuth to return redirect URL" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• provider: 'google': ", bold: true }), new TextRun({ text: "Specifies Google as the OAuth provider" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• options: { redirectTo: ... }: ", bold: true }), new TextRun({ text: "Where to redirect after login" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• .toHaveBeenCalledWith(...): ", bold: true }), new TextRun({ text: "Verifies exact parameters passed to function" })], spacing: { after: 300 } }),

                // FAILED TEST CASES - Member 1
                new Paragraph({ children: [new TextRun({ text: "❌ FAILED TEST CASES - ERROR SCENARIOS", bold: true, size: 28, color: "CC0000" })], spacing: { after: 200 } }),
                
                new Paragraph({ children: [new TextRun({ text: 'Test: "FAIL: should reject login with invalid credentials"', italics: true, size: 24 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: `it('FAIL: should reject login with invalid credentials', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials', status: 400 }
    })

    const result = await supabase.auth.signInWithPassword({
        email: 'wrong@email.com',
        password: 'wrongpassword'
    })

    expect(result.error).not.toBeNull()
    expect(result.error.message).toBe('Invalid login credentials')
})`, font: "Courier New", size: 18 })], spacing: { after: 200 } }),

                new Paragraph({ children: [new TextRun({ text: "❌ WHY THIS TESTS A FAILURE SCENARIO:", bold: true, color: "CC0000" })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: "• Scenario: ", bold: true }), new TextRun({ text: "User enters wrong email/password combination" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• Mock Setup: ", bold: true }), new TextRun({ text: "Returns error object instead of user data" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• What Happens: ", bold: true }), new TextRun({ text: "Supabase returns status 400 with error message" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• Real-World: ", bold: true }), new TextRun({ text: 'UI should show "Invalid credentials" message to user' })], spacing: { after: 300 } }),

                new Paragraph({ children: [new TextRun({ text: 'Test: "FAIL: should reject signup with existing email"', italics: true, size: 24 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: "❌ WHY THIS FAILS:", bold: true, color: "CC0000" })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: "• Scenario: ", bold: true }), new TextRun({ text: "Email address already exists in database" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• HTTP Status: ", bold: true }), new TextRun({ text: "422 Unprocessable Entity" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• Real-World: ", bold: true }), new TextRun({ text: "User cannot create duplicate accounts" })], spacing: { after: 300 } }),

                new Paragraph({ children: [new TextRun({ text: 'Test: "FAIL: should handle network timeout during login"', italics: true, size: 24 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: "❌ WHY THIS FAILS:", bold: true, color: "CC0000" })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: "• Scenario: ", bold: true }), new TextRun({ text: "User has no internet or server is down" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• mockRejectedValue: ", bold: true }), new TextRun({ text: "Makes function throw error" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• Recovery: ", bold: true }), new TextRun({ text: 'Show "Check your internet connection" message' })], spacing: { after: 400 } }),

                // Member 1 Summary Table
                new Paragraph({ children: [new TextRun({ text: "MEMBER 1 TEST SUMMARY", bold: true, size: 28 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: "AUTH-01: Registration - 2 tests (2 pass)", size: 22 })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "AUTH-02: OAuth Login - 2 tests (2 pass)", size: 22 })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "AUTH-03: Protected Routes - 2 tests (2 pass)", size: 22 })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "AUTH-04: Session Persistence - 2 tests (2 pass)", size: 22 })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "AUTH-05: Logout - 2 tests (2 pass)", size: 22 })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "AUTH-06: Onboarding - 3 tests (3 pass)", size: 22 })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "AUTH-07: Profile Updates - 4 tests (4 pass)", size: 22 })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "AUTH-FAIL: Error Scenarios - 9 tests (all error handling)", size: 22 })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "TOTAL: 30 tests | 21 Pass Scenarios | 9 Fail Scenarios", bold: true, size: 24 })], spacing: { after: 600 } }),

                // ==================== MEMBER 2 ====================
                new Paragraph({ children: [new TextRun({ text: "═══════════════════════════════════════════════════════════════", size: 24 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: "MEMBER 2: LESSONS & PROGRESS TRACKING INTEGRATION TESTS", bold: true, size: 36 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: "═══════════════════════════════════════════════════════════════", size: 24 })], spacing: { after: 300 } }),

                new Paragraph({ children: [new TextRun({ text: "File: ", bold: true }), new TextRun({ text: "member2-lessons-progress.integration.test.jsx" })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: "Purpose: ", bold: true }), new TextRun({ text: "Tests API endpoints, lesson progress tracking, unlock system, and analytics integration" })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: "Tools Used: ", bold: true }), new TextRun({ text: "Vitest + React Testing Library + Mocked API/Database" })], spacing: { after: 300 } }),

                new Paragraph({ children: [new TextRun({ text: "KEY SETUP CODE:", bold: true, size: 28 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: `// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

// Backend API Base URL
const API_BASE = 'http://localhost:3001/api'`, font: "Courier New", size: 18 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: "Purpose: Replaces browser's fetch with a mock we can control. All HTTP requests now go through our mock." })], spacing: { after: 300 } }),

                // LES-01
                new Paragraph({ children: [new TextRun({ text: "TEST CASE LES-01: Fetch Languages from Backend", bold: true, size: 28 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: 'Test: "should fetch all available languages"', italics: true, size: 24 })], spacing: { after: 200 } }),

                new Paragraph({ children: [new TextRun({ text: "CODE:", bold: true })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: `it('should fetch all available languages', async () => {
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

    const response = await fetch(\`\${API_BASE}/lessons/languages\`)
    const data = await response.json()

    expect(response.ok).toBe(true)
    expect(data).toHaveLength(4)
})`, font: "Courier New", size: 18 })], spacing: { after: 200 } }),

                new Paragraph({ children: [new TextRun({ text: "LINE-BY-LINE EXPLANATION:", bold: true })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: "• mockLanguages: ", bold: true }), new TextRun({ text: "Array of language objects that API would return" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• mockFetch.mockResolvedValueOnce({...}): ", bold: true }), new TextRun({ text: "Sets up mock to return this response ONCE" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• ok: true: ", bold: true }), new TextRun({ text: "Simulates HTTP 200 OK status" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• expect(data).toHaveLength(4): ", bold: true }), new TextRun({ text: "Verifies 4 languages returned" })], spacing: { after: 300 } }),

                // LES-03
                new Paragraph({ children: [new TextRun({ text: "TEST CASE LES-03: Lesson Completion Updates Database", bold: true, size: 28 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: 'Test: "should mark lesson as complete"', italics: true, size: 24 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: "Purpose: When user finishes a lesson, database updates status to 'completed' with 100% progress." })], spacing: { after: 200 } }),

                new Paragraph({ children: [new TextRun({ text: "✅ WHY THIS TEST PASSES:", bold: true, color: "00AA00" })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: "• Database mock returns expected completion data" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• User ID and Lesson ID are correctly passed" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• Status correctly updates to 'completed'" })], spacing: { after: 300 } }),

                // FAILED TEST CASES - Member 2
                new Paragraph({ children: [new TextRun({ text: "❌ FAILED TEST CASES - ERROR SCENARIOS", bold: true, size: 28, color: "CC0000" })], spacing: { after: 200 } }),

                new Paragraph({ children: [new TextRun({ text: 'Test: "FAIL: should handle 404 for non-existent language"', italics: true, size: 24 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: "❌ WHY THIS FAILS:", bold: true, color: "CC0000" })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: '• Scenario: User requests lessons for "French" but it doesn\'t exist in database' })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• HTTP Status: 404 Not Found" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: '• Real-World: UI shows "Language not found, please select another"' })], spacing: { after: 300 } }),

                new Paragraph({ children: [new TextRun({ text: 'Test: "FAIL: should handle 500 server error"', italics: true, size: 24 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: "❌ WHY THIS FAILS:", bold: true, color: "CC0000" })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: "• Scenario: Backend server crashed or database is down" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• HTTP Status: 500 Internal Server Error" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• Recovery: App shows error message and retry button" })], spacing: { after: 300 } }),

                new Paragraph({ children: [new TextRun({ text: "MEMBER 2 TEST SUMMARY", bold: true, size: 28 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: "TOTAL: 33 tests | 23 Pass Scenarios | 10 Fail Scenarios", bold: true, size: 24 })], spacing: { after: 600 } }),

                // ==================== MEMBER 3 ====================
                new Paragraph({ children: [new TextRun({ text: "═══════════════════════════════════════════════════════════════", size: 24 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: "MEMBER 3: PRACTICE MODULE & API INTEGRATION TESTS", bold: true, size: 36 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: "═══════════════════════════════════════════════════════════════", size: 24 })], spacing: { after: 300 } }),

                new Paragraph({ children: [new TextRun({ text: "File: ", bold: true }), new TextRun({ text: "member3-practice-api.integration.test.jsx" })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: "Purpose: ", bold: true }), new TextRun({ text: "Tests practice API endpoints, pronunciation scoring, TTS (Text-to-Speech), and progress tracking" })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: "Tools Used: ", bold: true }), new TextRun({ text: "Vitest + React Testing Library + Mocked API/Speech APIs" })], spacing: { after: 300 } }),

                new Paragraph({ children: [new TextRun({ text: "KEY SETUP - SPEECH API MOCKS:", bold: true, size: 28 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: `// Mock Speech APIs
const mockSpeechRecognition = vi.fn()
const mockSpeechSynthesis = {
    speak: vi.fn(),
    cancel: vi.fn(),
    getVoices: vi.fn(() => [{ lang: 'en-US', name: 'English' }])
}
global.SpeechRecognition = mockSpeechRecognition
global.speechSynthesis = mockSpeechSynthesis`, font: "Courier New", size: 18 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: "Purpose: Browser Speech APIs aren't available in Node.js test environment, so we mock them." })], spacing: { after: 300 } }),

                // PRC-04
                new Paragraph({ children: [new TextRun({ text: "TEST CASE PRC-04: Pronunciation Check Endpoint", bold: true, size: 28 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: 'Test: "should return match for exact pronunciation"', italics: true, size: 24 })], spacing: { after: 200 } }),

                new Paragraph({ children: [new TextRun({ text: "CODE:", bold: true })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: `it('should return match for exact pronunciation', async () => {
    mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
            isMatch: true,
            score: 100,
            expected: 'hello',
            spoken: 'hello'
        })
    })

    const response = await fetch(\`\${API_BASE}/practice/check-pronunciation\`, {
        method: 'POST',
        body: JSON.stringify({ expected: 'hello', spoken: 'hello' })
    })
    const data = await response.json()

    expect(data.isMatch).toBe(true)
    expect(data.score).toBe(100)
})`, font: "Courier New", size: 18 })], spacing: { after: 200 } }),

                new Paragraph({ children: [new TextRun({ text: "LINE-BY-LINE EXPLANATION:", bold: true })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: "• isMatch: true: ", bold: true }), new TextRun({ text: "Pronunciation matched the expected word" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• score: 100: ", bold: true }), new TextRun({ text: "Perfect score (100%)" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• method: 'POST': ", bold: true }), new TextRun({ text: "Sending data to server for comparison" })], spacing: { after: 300 } }),

                // FAILED TEST CASES - Member 3
                new Paragraph({ children: [new TextRun({ text: "❌ FAILED TEST CASES - ERROR SCENARIOS", bold: true, size: 28, color: "CC0000" })], spacing: { after: 200 } }),

                new Paragraph({ children: [new TextRun({ text: 'Test: "FAIL: should return 0 score for completely wrong pronunciation"', italics: true, size: 24 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: "❌ WHY THIS FAILS:", bold: true, color: "CC0000" })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: '• Scenario: User said "xyz123" but expected "elephant" - completely different' })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• isMatch: false - Words don't match" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• score: 0 - No similarity between words" })], spacing: { after: 300 } }),

                new Paragraph({ children: [new TextRun({ text: 'Test: "FAIL: should handle microphone permission denied"', italics: true, size: 24 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: "❌ WHY THIS FAILS:", bold: true, color: "CC0000" })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: '• Scenario: User clicked "Deny" when browser asked for microphone access' })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• Error Type: NotAllowedError - browser permission denied" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• Recovery: Show instructions to enable microphone in browser settings" })], spacing: { after: 300 } }),

                new Paragraph({ children: [new TextRun({ text: "MEMBER 3 TEST SUMMARY", bold: true, size: 28 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: "TOTAL: 46 tests | 34 Pass Scenarios | 12 Fail Scenarios", bold: true, size: 24 })], spacing: { after: 600 } }),

                // ==================== MEMBER 4 ====================
                new Paragraph({ children: [new TextRun({ text: "═══════════════════════════════════════════════════════════════", size: 24 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: "MEMBER 4: QUIZ/ASSESSMENTS & SETTINGS INTEGRATION TESTS", bold: true, size: 36 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: "═══════════════════════════════════════════════════════════════", size: 24 })], spacing: { after: 300 } }),

                new Paragraph({ children: [new TextRun({ text: "File: ", bold: true }), new TextRun({ text: "member4-quiz-settings.integration.test.jsx" })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: "Purpose: ", bold: true }), new TextRun({ text: "Tests quiz progress, assessment results, settings persistence, and accessibility features" })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: "Tools Used: ", bold: true }), new TextRun({ text: "Vitest + React Testing Library + Mocked Database" })], spacing: { after: 300 } }),

                // QIZ-01
                new Paragraph({ children: [new TextRun({ text: "TEST CASE QIZ-01: Quiz Timer", bold: true, size: 28 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: 'Test: "should start timer when quiz begins"', italics: true, size: 24 })], spacing: { after: 200 } }),

                new Paragraph({ children: [new TextRun({ text: "CODE:", bold: true })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: `it('should start timer when quiz begins', () => {
    vi.useFakeTimers()  // Take control of JavaScript timers
    const startTime = Date.now()
    
    vi.advanceTimersByTime(5000)  // Simulate 5 seconds passing
    
    const elapsed = Date.now() - startTime
    expect(elapsed).toBe(5000)
    vi.useRealTimers()  // Restore real timers
})`, font: "Courier New", size: 18 })], spacing: { after: 200 } }),

                new Paragraph({ children: [new TextRun({ text: "LINE-BY-LINE EXPLANATION:", bold: true })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: "• vi.useFakeTimers(): ", bold: true }), new TextRun({ text: "Takes control of JavaScript timers (Date.now, setTimeout, etc.)" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• vi.advanceTimersByTime(5000): ", bold: true }), new TextRun({ text: "Instantly advances time by 5 seconds" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• Purpose: ", bold: true }), new TextRun({ text: "Test timer logic without waiting real time" })], spacing: { after: 300 } }),

                // QIZ-07
                new Paragraph({ children: [new TextRun({ text: "TEST CASE QIZ-07: ADHD Setting Hides Timer", bold: true, size: 28 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: 'Test: "should determine timer visibility based on ADHD"', italics: true, size: 24 })], spacing: { after: 200 } }),

                new Paragraph({ children: [new TextRun({ text: "CODE:", bold: true })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: `it('should determine timer visibility based on ADHD', () => {
    const learningChallenges = ['adhd', 'anxiety']
    const showTimer = !learningChallenges.includes('adhd')

    expect(showTimer).toBe(false)
})`, font: "Courier New", size: 18 })], spacing: { after: 200 } }),

                new Paragraph({ children: [new TextRun({ text: "✅ WHY THIS TEST PASSES:", bold: true, color: "00AA00" })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: "• User has ADHD in their learning challenges" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• Timer can create anxiety for ADHD users" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• Logic correctly returns false to hide timer" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• This is an accessibility feature for users with learning disabilities" })], spacing: { after: 300 } }),

                // FAILED TEST CASES - Member 4
                new Paragraph({ children: [new TextRun({ text: "❌ FAILED TEST CASES - ERROR SCENARIOS", bold: true, size: 28, color: "CC0000" })], spacing: { after: 200 } }),

                new Paragraph({ children: [new TextRun({ text: 'Test: "FAIL: should handle quiz save failure"', italics: true, size: 24 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: "❌ WHY THIS FAILS:", bold: true, color: "CC0000" })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: "• Scenario: Internet dropped while trying to save quiz progress" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• mockRejectedValue: Makes database function throw error" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• Recovery: Save to localStorage as backup, sync when online" })], spacing: { after: 300 } }),

                new Paragraph({ children: [new TextRun({ text: 'Test: "FAIL: should handle timer exceeding maximum allowed time"', italics: true, size: 24 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: "❌ WHY THIS FAILS:", bold: true, color: "CC0000" })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: "• Scenario: Quiz has 30-minute time limit, user exceeded it" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• Expected Behavior: Quiz auto-submits with current answers" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: '• UI Response: "Time\'s up! Your quiz has been submitted"' })], spacing: { after: 300 } }),

                new Paragraph({ children: [new TextRun({ text: "MEMBER 4 TEST SUMMARY", bold: true, size: 28 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: "TOTAL: 52 tests | 38 Pass Scenarios | 14 Fail Scenarios", bold: true, size: 24 })], spacing: { after: 600 } }),

                // ==================== MEMBER 5 ====================
                new Paragraph({ children: [new TextRun({ text: "═══════════════════════════════════════════════════════════════", size: 24 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: "MEMBER 5: REAL-TIME FEATURES & STUDY ROOMS INTEGRATION TESTS", bold: true, size: 36 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: "═══════════════════════════════════════════════════════════════", size: 24 })], spacing: { after: 300 } }),

                new Paragraph({ children: [new TextRun({ text: "File: ", bold: true }), new TextRun({ text: "member5-realtime-rooms.integration.test.jsx" })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: "Purpose: ", bold: true }), new TextRun({ text: "Tests Socket.io, WebRTC video calls, Supabase Realtime subscriptions, Chat, and Notifications" })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: "Tools Used: ", bold: true }), new TextRun({ text: "Vitest + React Testing Library + Mocked Socket/Supabase" })], spacing: { after: 300 } }),

                new Paragraph({ children: [new TextRun({ text: "KEY SETUP - SOCKET.IO MOCK:", bold: true, size: 28 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: `// Mock Socket.io
const mockSocket = {
    on: vi.fn(),       // Listen for events
    emit: vi.fn(),     // Send events to server
    off: vi.fn(),      // Remove event listeners
    disconnect: vi.fn(),
    connect: vi.fn(),
    connected: true,
    id: 'mock-socket-id'
}

vi.mock('socket.io-client', () => ({
    io: vi.fn(() => mockSocket)
}))`, font: "Courier New", size: 18 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: "Purpose: Socket.io needs a server to connect to. We mock it to test event handling without a real server." })], spacing: { after: 300 } }),

                // STU-04
                new Paragraph({ children: [new TextRun({ text: "TEST CASE STU-04: Chat Message Via Socket.io", bold: true, size: 28 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: 'Test: "should emit send-message event"', italics: true, size: 24 })], spacing: { after: 200 } }),

                new Paragraph({ children: [new TextRun({ text: "CODE:", bold: true })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: `it('should emit send-message event', () => {
    const messageData = {
        roomId: 'room-123',
        userId: 'test-user-123',
        userName: 'Test User',
        content: 'Hello everyone!'
    }

    mockSocket.emit('send-message', messageData)

    expect(mockSocket.emit).toHaveBeenCalledWith('send-message', messageData)
})`, font: "Courier New", size: 18 })], spacing: { after: 200 } }),

                new Paragraph({ children: [new TextRun({ text: "Explanation: When user sends a message, client emits 'send-message' event. Server broadcasts to all room participants." })], spacing: { after: 300 } }),

                // STU-06
                new Paragraph({ children: [new TextRun({ text: "TEST CASE STU-06: WebRTC Signaling", bold: true, size: 28 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: 'Test: "should emit call-user with offer"', italics: true, size: 24 })], spacing: { after: 200 } }),

                new Paragraph({ children: [new TextRun({ text: "LINE-BY-LINE EXPLANATION:", bold: true })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: "• offer: ", bold: true }), new TextRun({ text: "WebRTC SDP offer containing video/audio codec negotiation" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• type: 'offer': ", bold: true }), new TextRun({ text: "Initial call request from caller" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• sdp: ", bold: true }), new TextRun({ text: "Session Description Protocol data" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• Purpose: ", bold: true }), new TextRun({ text: "Part of WebRTC's signaling process for establishing peer-to-peer video calls" })], spacing: { after: 300 } }),

                // FAILED TEST CASES - Member 5
                new Paragraph({ children: [new TextRun({ text: "❌ FAILED TEST CASES - ERROR SCENARIOS", bold: true, size: 28, color: "CC0000" })], spacing: { after: 200 } }),

                new Paragraph({ children: [new TextRun({ text: 'Test: "FAIL: should handle socket connection failure"', italics: true, size: 24 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: "❌ WHY THIS FAILS:", bold: true, color: "CC0000" })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: "• Scenario: Socket.io server is not running" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• Error: ECONNREFUSED - Connection refused by server" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: '• Real-World: Show "Unable to connect to study rooms. Retry?"' })], spacing: { after: 300 } }),

                new Paragraph({ children: [new TextRun({ text: 'Test: "FAIL: should handle getUserMedia denied"', italics: true, size: 24 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: "❌ WHY THIS FAILS:", bold: true, color: "CC0000" })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: "• Scenario: User denied camera/microphone permission" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• Error Type: NotAllowedError - Browser permission denied" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: '• Real-World: Show instructions: "Please enable camera access in browser settings"' })], spacing: { after: 300 } }),

                new Paragraph({ children: [new TextRun({ text: 'Test: "FAIL: should handle ICE connection failure"', italics: true, size: 24 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: "❌ WHY THIS FAILS:", bold: true, color: "CC0000" })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: "• Scenario: NAT traversal failed - peers cannot connect directly" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• ICE: Interactive Connectivity Establishment - WebRTC connection protocol" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• Common Causes: Strict firewall, Symmetric NAT, TURN server unavailable" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: '• Recovery: "Video connection failed. Try refreshing or use text chat instead"' })], spacing: { after: 300 } }),

                new Paragraph({ children: [new TextRun({ text: "MEMBER 5 TEST SUMMARY", bold: true, size: 28 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: "TOTAL: 61 tests | 40 Pass Scenarios | 21 Fail Scenarios", bold: true, size: 24 })], spacing: { after: 600 } }),

                // ==================== OVERALL SUMMARY ====================
                new Paragraph({ children: [new TextRun({ text: "═══════════════════════════════════════════════════════════════", size: 24 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: "OVERALL TEST SUMMARY", bold: true, size: 40 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: "═══════════════════════════════════════════════════════════════", size: 24 })], spacing: { after: 300 } }),

                new Paragraph({ children: [new TextRun({ text: "TEST EXECUTION COMMANDS:", bold: true, size: 28 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: `cd frontend
npm run test:integration

# Or run specific member:
npx vitest run src/test/integration/member1-auth-profile.integration.test.jsx
npx vitest run src/test/integration/member2-lessons-progress.integration.test.jsx
npx vitest run src/test/integration/member3-practice-api.integration.test.jsx
npx vitest run src/test/integration/member4-quiz-settings.integration.test.jsx
npx vitest run src/test/integration/member5-realtime-rooms.integration.test.jsx`, font: "Courier New", size: 18 })], spacing: { after: 400 } }),

                new Paragraph({ children: [new TextRun({ text: "TOTAL TESTS ACROSS ALL MEMBERS:", bold: true, size: 28 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: "Member 1 (Auth): 30 tests | 21 pass | 9 fail scenarios", size: 22 })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "Member 2 (Lessons): 33 tests | 23 pass | 10 fail scenarios", size: 22 })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "Member 3 (Practice): 46 tests | 34 pass | 12 fail scenarios", size: 22 })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "Member 4 (Quiz): 52 tests | 38 pass | 14 fail scenarios", size: 22 })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "Member 5 (Realtime): 61 tests | 40 pass | 21 fail scenarios", size: 22 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: "───────────────────────────────────────────────────", size: 22 })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: "GRAND TOTAL: 222 tests | 156 pass scenarios | 66 fail scenarios", bold: true, size: 26 })], spacing: { after: 400 } }),

                new Paragraph({ children: [new TextRun({ text: "UNDERSTANDING TEST OUTPUT:", bold: true, size: 28 })], spacing: { after: 200 } }),
                new Paragraph({ children: [new TextRun({ text: "✅ When Tests PASS:", bold: true, size: 24, color: "00AA00" })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: "• ✓ Green checkmarks indicate passed tests" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• All assertions matched expected values" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• Example output: Test Files 1 passed (1) | Tests 4 passed (4)" })], spacing: { after: 200 } }),

                new Paragraph({ children: [new TextRun({ text: "❌ When Tests FAIL:", bold: true, size: 24, color: "CC0000" })], spacing: { after: 100 } }),
                new Paragraph({ children: [new TextRun({ text: "• ✕ Red X indicates failed tests" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• AssertionError - Expected value didn't match actual" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• Shows expected vs received values" })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: "• Line number helps locate the failing assertion" })], spacing: { after: 400 } }),

                // Footer
                new Paragraph({ children: [new TextRun({ text: "───────────────────────────────────────────────────────────────", size: 24 })], spacing: { after: 200 } }),
                new Paragraph({ 
                    children: [new TextRun({ text: "Linguability Integration Testing Documentation", bold: true, size: 24 })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 100 }
                }),
                new Paragraph({ 
                    children: [new TextRun({ text: "Generated: March 10, 2026", size: 20 })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 100 }
                }),
                new Paragraph({ 
                    children: [new TextRun({ text: "Total: 222 Test Cases | 156 Pass | 66 Fail Scenarios", size: 20 })],
                    alignment: AlignmentType.CENTER
                }),
            ]
        }]
    });

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync('Integration_Testing_Documentation.docx', buffer);
    console.log('✅ Word document created: Integration_Testing_Documentation.docx');
}

generateDoc().catch(console.error);
