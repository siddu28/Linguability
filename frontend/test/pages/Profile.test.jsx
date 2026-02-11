import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import Component from '../../src/pages/Profile'

// Mock dependencies if needed
vi.mock('../../src/context/AuthContext', () => ({
    useAuth: () => ({
        user: { email: 'test@example.com' },
        loading: false,
        signOut: vi.fn()
    })
}))

// Mock Supabase to avoid errors
vi.mock('../../src/lib/supabaseClient', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            delete: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: {}, error: null }),
        })),
        auth: {
            getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
            onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
        },
        storage: {
            from: vi.fn(() => ({
                upload: vi.fn().mockResolvedValue({ data: {}, error: null }),
                getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/image.png' } }),
            })),
        }
    }
}))

describe('Profile', () => {
    it('renders without crashing', () => {
        render(
            <BrowserRouter>
                <Component />
            </BrowserRouter>
        )
        // Basic check - just ensure it doesn't throw
        expect(document.body).toBeInTheDocument()
    })
})
