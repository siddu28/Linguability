import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Input from '../../src/components/Input'

describe('Input Component', () => {
    it('renders correctly', () => {
        render(<Input placeholder="Enter text" />)
        expect(screen.getByPlaceholderText(/enter text/i)).toBeInTheDocument()
    })

    it('renders with label', () => {
        render(<Input id="test-input" label="Test Label" />)
        expect(screen.getByLabelText(/test label/i)).toBeInTheDocument()
    })

    it('handles changes', () => {
        const handleChange = vi.fn()
        render(<Input onChange={handleChange} />)
        const input = screen.getByRole('textbox')
        fireEvent.change(input, { target: { value: 'New Value' } })
        expect(handleChange).toHaveBeenCalledTimes(1)
    })

    it('displays error message', () => {
        render(<Input error="Invalid input" />)
        expect(screen.getByText(/invalid input/i)).toBeInTheDocument()
        expect(screen.getByRole('textbox')).toHaveClass('input-error')
    })
})
