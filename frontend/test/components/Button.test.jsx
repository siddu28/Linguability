import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Button from '../../src/components/Button'

describe('Button Component', () => {
    it('renders with default props', () => {
        render(<Button>Click Me</Button>)
        const button = screen.getByRole('button', { name: /click me/i })
        expect(button).toBeInTheDocument()
        expect(button).toHaveClass('btn', 'btn-primary', 'btn-medium')
    })

    it('renders with different variants', () => {
        render(<Button variant="secondary">Secondary</Button>)
        const button = screen.getByRole('button', { name: /secondary/i })
        expect(button).toHaveClass('btn-secondary')
    })

    it('renders with different sizes', () => {
        render(<Button size="large">Large</Button>)
        const button = screen.getByRole('button', { name: /large/i })
        expect(button).toHaveClass('btn-large')
    })

    it('handles click events', () => {
        const handleClick = vi.fn()
        render(<Button onClick={handleClick}>Clickable</Button>)
        const button = screen.getByRole('button', { name: /clickable/i })
        fireEvent.click(button)
        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('applies custom class names', () => {
        render(<Button className="custom-class">Custom</Button>)
        const button = screen.getByRole('button', { name: /custom/i })
        expect(button).toHaveClass('custom-class')
    })
})
