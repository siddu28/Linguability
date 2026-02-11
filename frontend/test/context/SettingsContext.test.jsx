import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SettingsProvider, useSettings } from '../../src/context/SettingsContext'

// Do NOT mock SettingsContext, as we are hindering it.

// Mock AuthContext as it is a dependency
vi.mock('../../src/context/AuthContext', () => ({
    useAuth: () => ({
        user: { id: 'test-user-id', email: 'test@example.com' },
        loading: false
    })
}))

// Mock Database functions
vi.mock('../../src/lib/database', () => ({
    getUserSettings: vi.fn().mockResolvedValue({
        focus_mode: false,
        font_size: 'large',
        font_family: 'opendyslexic'
    }),
    upsertUserSettings: vi.fn().mockResolvedValue({})
}))

// Test Component to consume context
function TestComponent() {
    const { settings } = useSettings()
    return (
        <div>
            <span data-testid="font-size">{settings.textSize}</span>
            <span data-testid="font-family">{settings.fontFamily}</span>
        </div>
    )
}

describe('SettingsContext', () => {
    it('provides settings to children', async () => {
        render(
            <SettingsProvider>
                <TestComponent />
            </SettingsProvider>
        )

        // Wait for settings to load
        await waitFor(() => {
            expect(screen.getByTestId('font-size')).toHaveTextContent('large')
            expect(screen.getByTestId('font-family')).toHaveTextContent('opendyslexic')
        })
    })
})
