import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from '../src/App'

// Mock dependencies if needed
vi.mock('../src/context/AuthContext', () => ({
    AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>,
    useAuth: () => ({
        user: { email: 'test@example.com' },
        loading: false,
        signOut: vi.fn()
    })
}))

// Mock SettingsContext
vi.mock('../src/context/SettingsContext', () => ({
    SettingsProvider: ({ children }) => <div data-testid="settings-provider">{children}</div>,
    useSettings: () => ({
        settings: {
            theme: 'light',
            learningGoal: 15,
            notifications: true,
        },
        updateSettings: vi.fn(),
    }),
}))

describe('App', () => {
    it('renders without crashing', () => {
        render(
            <App />
        )
        // Basic check - just ensure it doesn't throw
        expect(document.body).toBeInTheDocument()
    })
})
