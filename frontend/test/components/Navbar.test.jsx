import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import Navbar from '../../src/components/Navbar'
import * as AuthContextModule from '../../src/context/AuthContext'

// Mock the AuthContext module
vi.mock('../../src/context/AuthContext', () => ({
    useAuth: vi.fn(),
}))

const renderWithRouter = (component) => {
    return render(
        <BrowserRouter>
            {component}
        </BrowserRouter>
    )
}

describe('Navbar Component', () => {
    const mockUseAuth = vi.mocked(AuthContextModule.useAuth)
    const mockUser = { email: 'test@example.com', user_metadata: { full_name: 'Test User' } }
    const mockSignOut = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        // Default mock implementation
        mockUseAuth.mockReturnValue({
            user: mockUser,
            signOut: mockSignOut,
            loading: false
        })

        // Mock localStorage
        const localStorageMock = (function () {
            let store = {};
            return {
                getItem: function (key) {
                    return store[key] || null;
                },
                setItem: function (key, value) {
                    store[key] = value.toString();
                },
                clear: function () {
                    store = {};
                },
                removeItem: function (key) {
                    delete store[key];
                }
            };
        })();
        Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    })

    it('renders brand and links', () => {
        renderWithRouter(<Navbar />)
        expect(screen.getByText(/linguaaccess/i)).toBeInTheDocument()
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
    })

    it('toggles profile menu', () => {
        renderWithRouter(<Navbar />)
        const profileButton = screen.getByLabelText(/profile/i)
        fireEvent.click(profileButton)
        expect(screen.getByText(/test user/i)).toBeInTheDocument()
        expect(screen.getByText(/sign out/i)).toBeInTheDocument()
    })

    it('toggles theme', () => {
        renderWithRouter(<Navbar />)
        const themeButton = screen.getByLabelText(/toggle theme/i)
        fireEvent.click(themeButton)
    })
})
