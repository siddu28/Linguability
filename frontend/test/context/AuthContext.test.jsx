import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthProvider, useAuth } from '../../src/context/AuthContext'
import { supabase } from '../../src/lib/supabaseClient'

// Mock Supabase client
vi.mock('../../src/lib/supabaseClient', () => ({
    supabase: {
        auth: {
            getSession: vi.fn(),
            onAuthStateChange: vi.fn(),
        },
    },
}))

// Test component to consume context
function TestComponent() {
    const { user, loading } = useAuth()
    if (loading) return <div>Loading...</div>
    return <div>{user ? `Logged in as ${user.email}` : 'Not logged in'}</div>
}

describe('AuthContext', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('provides user session when authenticated', async () => {
        const mockSession = { user: { email: 'test@example.com' } }
        supabase.auth.getSession.mockResolvedValue({ data: { session: mockSession }, error: null })
        supabase.auth.onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        expect(screen.getByText('Loading...')).toBeInTheDocument()
        await waitFor(() => {
            expect(screen.getByText('Logged in as test@example.com')).toBeInTheDocument()
        })
    })

    it('handles unauthenticated state', async () => {
        supabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null })
        supabase.auth.onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        await waitFor(() => {
            expect(screen.getByText('Not logged in')).toBeInTheDocument()
        })
    })
})
