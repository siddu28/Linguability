/**
 * ============================================================
 *  MEMBER 1 — UI Components Testing
 *  File: Button, Card, Input, Select, Toggle
 *  Tools: Vitest + React Testing Library + jest-dom + user-event
 * ============================================================
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'
import Select from '../components/Select'
import Toggle from '../components/Toggle'

// ==================== BUTTON ====================

describe('Button Component', () => {
    it('renders children text correctly', () => {
        render(<Button>Click Me</Button>)
        expect(screen.getByText('Click Me')).toBeInTheDocument()
    })

    it('applies primary variant class by default', () => {
        render(<Button>Primary</Button>)
        const btn = screen.getByText('Primary')
        expect(btn).toHaveClass('btn-primary')
    })

    it('applies secondary variant class when specified', () => {
        render(<Button variant="secondary">Secondary</Button>)
        const btn = screen.getByText('Secondary')
        expect(btn).toHaveClass('btn-secondary')
    })

    it('applies medium size class by default', () => {
        render(<Button>Medium</Button>)
        const btn = screen.getByText('Medium')
        expect(btn).toHaveClass('btn-medium')
    })

    it('applies small size class when specified', () => {
        render(<Button size="small">Small</Button>)
        const btn = screen.getByText('Small')
        expect(btn).toHaveClass('btn-small')
    })

    it('applies custom className', () => {
        render(<Button className="custom-class">Custom</Button>)
        const btn = screen.getByText('Custom')
        expect(btn).toHaveClass('custom-class')
    })

    it('renders icon when provided', () => {
        const MockIcon = ({ size }) => <svg data-testid="mock-icon" width={size} height={size} />
        render(<Button icon={MockIcon}>With Icon</Button>)
        expect(screen.getByTestId('mock-icon')).toBeInTheDocument()
    })

    it('does not render icon when not provided', () => {
        render(<Button>No Icon</Button>)
        expect(screen.queryByTestId('mock-icon')).not.toBeInTheDocument()
    })

    it('fires onClick handler when clicked', async () => {
        const handleClick = vi.fn()
        const user = userEvent.setup()
        render(<Button onClick={handleClick}>Click</Button>)
        await user.click(screen.getByText('Click'))
        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('is disabled when disabled prop is passed', () => {
        render(<Button disabled>Disabled</Button>)
        expect(screen.getByText('Disabled')).toBeDisabled()
    })

    it('does not fire onClick when disabled', async () => {
        const handleClick = vi.fn()
        const user = userEvent.setup()
        render(<Button disabled onClick={handleClick}>Disabled</Button>)
        await user.click(screen.getByText('Disabled'))
        expect(handleClick).not.toHaveBeenCalled()
    })
})

// ==================== CARD ====================

describe('Card Component', () => {
    it('renders children correctly', () => {
        render(<Card><p>Card Content</p></Card>)
        expect(screen.getByText('Card Content')).toBeInTheDocument()
    })

    it('applies the card base class', () => {
        const { container } = render(<Card>Test</Card>)
        expect(container.firstChild).toHaveClass('card')
    })

    it('applies custom className alongside card class', () => {
        const { container } = render(<Card className="my-card">Test</Card>)
        expect(container.firstChild).toHaveClass('card')
        expect(container.firstChild).toHaveClass('my-card')
    })

    it('passes additional props to the div', async () => {
        const handleClick = vi.fn()
        const user = userEvent.setup()
        render(<Card onClick={handleClick}>Clickable Card</Card>)
        await user.click(screen.getByText('Clickable Card'))
        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('renders multiple children', () => {
        render(
            <Card>
                <h1>Title</h1>
                <p>Description</p>
            </Card>
        )
        expect(screen.getByText('Title')).toBeInTheDocument()
        expect(screen.getByText('Description')).toBeInTheDocument()
    })
})

// ==================== INPUT ====================

describe('Input Component', () => {
    it('renders with label when provided', () => {
        render(<Input label="Email" id="email" />)
        expect(screen.getByText('Email')).toBeInTheDocument()
    })

    it('does not render label when not provided', () => {
        render(<Input id="email" placeholder="Enter email" />)
        expect(screen.queryByText('Email')).not.toBeInTheDocument()
    })

    it('renders with placeholder', () => {
        render(<Input placeholder="Enter your name" />)
        expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument()
    })

    it('renders input with correct type', () => {
        render(<Input type="password" placeholder="Password" />)
        expect(screen.getByPlaceholderText('Password')).toHaveAttribute('type', 'password')
    })

    it('defaults to text type', () => {
        render(<Input placeholder="Default" />)
        expect(screen.getByPlaceholderText('Default')).toHaveAttribute('type', 'text')
    })

    it('shows error message when error prop is provided', () => {
        render(<Input error="This field is required" />)
        expect(screen.getByText('This field is required')).toBeInTheDocument()
    })

    it('applies input-error class when error is present', () => {
        render(<Input error="Required" placeholder="With Error" />)
        expect(screen.getByPlaceholderText('With Error')).toHaveClass('input-error')
    })

    it('does not apply error class when no error', () => {
        render(<Input placeholder="No Error" />)
        expect(screen.getByPlaceholderText('No Error')).not.toHaveClass('input-error')
    })

    it('calls onChange handler when typing', async () => {
        const handleChange = vi.fn()
        const user = userEvent.setup()
        render(<Input onChange={handleChange} placeholder="Type here" />)
        await user.type(screen.getByPlaceholderText('Type here'), 'Hello')
        expect(handleChange).toHaveBeenCalled()
    })

    it('associates label with input via htmlFor', () => {
        render(<Input label="Name" id="name-input" placeholder="Name" />)
        const label = screen.getByText('Name')
        expect(label).toHaveAttribute('for', 'name-input')
    })
})

// ==================== SELECT ====================

describe('Select Component', () => {
    const options = [
        { value: 'en', label: 'English' },
        { value: 'hi', label: 'Hindi' },
        { value: 'ta', label: 'Tamil' }
    ]

    it('renders label when provided', () => {
        render(<Select label="Language" id="lang" options={options} />)
        expect(screen.getByText('Language')).toBeInTheDocument()
    })

    it('renders all options', () => {
        render(<Select id="lang" options={options} />)
        expect(screen.getByText('English')).toBeInTheDocument()
        expect(screen.getByText('Hindi')).toBeInTheDocument()
        expect(screen.getByText('Tamil')).toBeInTheDocument()
    })

    it('selects correct value', () => {
        render(<Select id="lang" options={options} value="hi" onChange={() => { }} />)
        expect(screen.getByRole('combobox')).toHaveValue('hi')
    })

    it('calls onChange when option is selected', async () => {
        const handleChange = vi.fn()
        const user = userEvent.setup()
        render(<Select id="lang" options={options} value="en" onChange={handleChange} />)
        await user.selectOptions(screen.getByRole('combobox'), 'hi')
        expect(handleChange).toHaveBeenCalled()
    })

    it('renders empty when no options provided', () => {
        render(<Select id="empty" />)
        const select = screen.getByRole('combobox')
        expect(select.options).toHaveLength(0)
    })

    it('associates label with select via htmlFor', () => {
        render(<Select label="Pick" id="pick" options={options} />)
        expect(screen.getByText('Pick')).toHaveAttribute('for', 'pick')
    })
})

// ==================== TOGGLE ====================

describe('Toggle Component', () => {
    it('renders with label', () => {
        render(<Toggle label="Dark Mode" id="dark" checked={false} onChange={() => { }} />)
        expect(screen.getByText('Dark Mode')).toBeInTheDocument()
    })

    it('renders description when provided', () => {
        render(
            <Toggle
                label="Focus"
                description="Enable focus mode"
                id="focus"
                checked={false}
                onChange={() => { }}
            />
        )
        expect(screen.getByText('Enable focus mode')).toBeInTheDocument()
    })

    it('does not render description when not provided', () => {
        render(<Toggle label="Mode" id="mode" checked={false} onChange={() => { }} />)
        expect(screen.queryByText('Enable focus mode')).not.toBeInTheDocument()
    })

    it('checkbox reflects checked state', () => {
        render(<Toggle label="On" id="on" checked={true} onChange={() => { }} />)
        expect(screen.getByRole('checkbox')).toBeChecked()
    })

    it('checkbox reflects unchecked state', () => {
        render(<Toggle label="Off" id="off" checked={false} onChange={() => { }} />)
        expect(screen.getByRole('checkbox')).not.toBeChecked()
    })

    it('calls onChange when toggled', async () => {
        const handleChange = vi.fn()
        const user = userEvent.setup()
        render(<Toggle label="Toggle" id="toggle" checked={false} onChange={handleChange} />)
        await user.click(screen.getByRole('checkbox'))
        expect(handleChange).toHaveBeenCalledTimes(1)
    })
})
