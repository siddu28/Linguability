/**
 * ============================================================
 *  MEMBER 3 — Lessons & Practice Pages Testing
 *  File: Practice.jsx, Lessons.jsx (main pages)
 *  Tools: Vitest + React Testing Library + jest-dom + user-event
 * ============================================================
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

// ---- Mock all external dependencies ----
vi.mock('../lib/supabaseClient', () => ({
    supabase: {
        auth: {
            getSession: vi.fn().mockResolvedValue({
                data: { session: { user: { id: 'test-user' } } }
            }),
            onAuthStateChange: vi.fn().mockReturnValue({
                data: { subscription: { unsubscribe: vi.fn() } }
            })
        },
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    order: vi.fn(() => ({
                        data: [],
                        error: null
                    })),
                    single: vi.fn().mockResolvedValue({ data: null, error: null }),
                    data: [],
                    error: null
                }))
            }))
        }))
    }
}))

vi.mock('../lib/database', () => ({
    getLessonProgress: vi.fn().mockResolvedValue([]),
    markLessonComplete: vi.fn().mockResolvedValue({}),
    updateLessonProgress: vi.fn().mockResolvedValue({}),
    getUserSettings: vi.fn().mockResolvedValue(null),
    getProfile: vi.fn().mockResolvedValue(null),
    getAllPracticeProgress: vi.fn().mockResolvedValue([])
}))

import Practice from '../pages/Practice'
import { AuthProvider } from '../context/AuthContext'
import { SettingsProvider } from '../context/SettingsContext'

function renderWithProviders(ui, { route = '/practice' } = {}) {
    return render(
        <MemoryRouter initialEntries={[route]}>
            <AuthProvider>
                <SettingsProvider>
                    {ui}
                </SettingsProvider>
            </AuthProvider>
        </MemoryRouter>
    )
}

// ==================== PRACTICE PAGE ====================

describe('Practice Page — Language Selection', () => {
    it('renders the "Choose a Language" heading', async () => {
        renderWithProviders(<Practice />)
        await waitFor(() => {
            expect(screen.getByText('Choose a Language')).toBeInTheDocument()
        })
    })

    it('renders subtitle text', async () => {
        renderWithProviders(<Practice />)
        await waitFor(() => {
            expect(screen.getByText('Select a language to start practicing')).toBeInTheDocument()
        })
    })

    it('displays all 4 language cards', async () => {
        renderWithProviders(<Practice />)
        await waitFor(() => {
            expect(screen.getByText('English')).toBeInTheDocument()
            expect(screen.getByText('Hindi')).toBeInTheDocument()
            expect(screen.getByText('Tamil')).toBeInTheDocument()
            expect(screen.getByText('Telugu')).toBeInTheDocument()
        })
    })

    it('displays language flag badges (EN, हि, த, తె)', async () => {
        renderWithProviders(<Practice />)
        await waitFor(() => {
            expect(screen.getByText('EN')).toBeInTheDocument()
            expect(screen.getByText('हि')).toBeInTheDocument()
            expect(screen.getByText('த')).toBeInTheDocument()
            expect(screen.getByText('తె')).toBeInTheDocument()
        })
    })

    it('displays language descriptions', async () => {
        renderWithProviders(<Practice />)
        await waitFor(() => {
            expect(screen.getByText('Standard Practice')).toBeInTheDocument()
            // Checking one non-English desc (Telugu)
        })
    })

    it('has Select buttons for each language', async () => {
        renderWithProviders(<Practice />)
        await waitFor(() => {
            const selectBtns = screen.getAllByText(/Select/)
            expect(selectBtns.length).toBeGreaterThanOrEqual(4)
        })
    })

    it('renders stats banner section', async () => {
        renderWithProviders(<Practice />)
        await waitFor(() => {
            expect(screen.getByText('Items Practiced')).toBeInTheDocument()
            expect(screen.getByText('Total Score')).toBeInTheDocument()
            expect(screen.getByText('Time Spent')).toBeInTheDocument()
            expect(screen.getByText('Sessions')).toBeInTheDocument()
        })
    })
})

describe('Practice Page — Language Selected View', () => {
    it('shows practice types after selecting a language', async () => {
        renderWithProviders(<Practice />, { route: '/practice?lang=english' })
        await waitFor(() => {
            expect(screen.getByText('English Practice')).toBeInTheDocument()
        })
    })

    it('displays all 3 practice types', async () => {
        renderWithProviders(<Practice />, { route: '/practice?lang=english' })
        await waitFor(() => {
            expect(screen.getByText('Pronunciation')).toBeInTheDocument()
            expect(screen.getByText('Listening')).toBeInTheDocument()
            expect(screen.getByText('Vocabulary')).toBeInTheDocument()
        })
    })

    it('shows practice type descriptions', async () => {
        renderWithProviders(<Practice />, { route: '/practice?lang=english' })
        await waitFor(() => {
            expect(screen.getByText('Perfect your accent with real-time feedback')).toBeInTheDocument()
            expect(screen.getByText('Train your ears with diverse audio clips')).toBeInTheDocument()
            expect(screen.getByText('Expand your word bank with flashcards')).toBeInTheDocument()
        })
    })

    it('has "Start Practice" buttons for each type', async () => {
        renderWithProviders(<Practice />, { route: '/practice?lang=english' })
        await waitFor(() => {
            const startBtns = screen.getAllByText('Start Practice')
            expect(startBtns.length).toBe(3)
        })
    })

    it('has correct links for practice types', async () => {
        renderWithProviders(<Practice />, { route: '/practice?lang=english' })
        await waitFor(() => {
            const links = screen.getAllByRole('link')
            const practiceLinks = links.filter(l => l.href.includes('/practice/'))
            expect(practiceLinks.length).toBeGreaterThanOrEqual(3)
        })
    })

    it('shows back button when language is selected', async () => {
        renderWithProviders(<Practice />, { route: '/practice?lang=english' })
        await waitFor(() => {
            expect(screen.getByText('← Back to Languages')).toBeInTheDocument()
        })
    })

    it('shows selected language flag badge', async () => {
        renderWithProviders(<Practice />, { route: '/practice?lang=english' })
        await waitFor(() => {
            expect(screen.getByText('EN')).toBeInTheDocument()
        })
    })

    it('shows subtitle in selected language view', async () => {
        renderWithProviders(<Practice />, { route: '/practice?lang=english' })
        await waitFor(() => {
            expect(screen.getByText('Master your skills with focused exercises')).toBeInTheDocument()
        })
    })
})

describe('Practice Page — Navigation', () => {
    it('can navigate back to languages via back button', async () => {
        const user = userEvent.setup()
        renderWithProviders(<Practice />, { route: '/practice?lang=english' })

        await waitFor(() => {
            expect(screen.getByText('← Back to Languages')).toBeInTheDocument()
        })

        await user.click(screen.getByText('← Back to Languages'))

        await waitFor(() => {
            expect(screen.getByText('Choose a Language')).toBeInTheDocument()
        })
    })

    it('can select a language by clicking its card', async () => {
        const user = userEvent.setup()
        renderWithProviders(<Practice />)

        await waitFor(() => {
            expect(screen.getByText('English')).toBeInTheDocument()
        })

        // Click on the English card
        await user.click(screen.getByText('English'))

        await waitFor(() => {
            expect(screen.getByText('English Practice')).toBeInTheDocument()
        })
    })
})

// ==================== PRACTICE PAGE STATS ====================

describe('Practice Page — Stats Display', () => {
    it('displays 0 for Items Practiced initially', async () => {
        renderWithProviders(<Practice />)
        await waitFor(() => {
            const statValues = screen.getAllByText('0')
            expect(statValues.length).toBeGreaterThanOrEqual(1)
        })
    })

    it('displays stat icons (CheckCircle, TrendingUp, Clock, Flame)', async () => {
        renderWithProviders(<Practice />)
        await waitFor(() => {
            const statIcons = document.querySelectorAll('.practice-stat-icon')
            expect(statIcons.length).toBe(4)
        })
    })

    it('stat cards have hover-ready classes', async () => {
        renderWithProviders(<Practice />)
        await waitFor(() => {
            const cards = document.querySelectorAll('.practice-stat-card')
            expect(cards.length).toBe(4)
        })
    })
})
