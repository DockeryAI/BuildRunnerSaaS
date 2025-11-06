Here's a comprehensive set of unit tests for the Calendar Integration component:

import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { CalendarIntegration } from './CalendarIntegration'
import userEvent from '@testing-library/user-event'

// Mock the Lucide icons
jest.mock('lucide-react', () => ({
  Calendar: () => <div data-testid="calendar-icon">Calendar</div>,
  Clock: () => <div>Clock</div>,
  Users: () => <div>Users</div>,
  MapPin: () => <div>MapPin</div>,
  AlertCircle: () => <div>AlertCircle</div>,
  CheckCircle: () => <div>CheckCircle</div>,
  Loader2: () => <div>Loader2</div>,
}))

describe('CalendarIntegration', () => {
  const mockOnEventCreate = jest.fn()
  const mockOnAvailabilityCheck = jest.fn()
  const mockOnInviteSend = jest.fn()

  const defaultProps = {
    onEventCreate: mockOnEventCreate,
    onAvailabilityCheck: mockOnAvailabilityCheck,
    onInviteSend: mockOnInviteSend,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders without crashing', () => {
    render(<CalendarIntegration {...defaultProps} />)
    expect(screen.getByText('Calendar Integration')).toBeInTheDocument()
  })

  it('displays default group members', () => {
    render(<CalendarIntegration {...defaultProps} />)
    expect(screen.getByText('Alex Chen')).toBeInTheDocument()
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
  })

  it('displays default trip events', () => {
    render(<CalendarIntegration {...defaultProps} />)
    expect(screen.getByText('Saturday Lunch Prep')).toBeInTheDocument()
    expect(screen.getByText('Firewood Collection')).toBeInTheDocument()
  })

  it('allows date selection', async () => {
    render(<CalendarIntegration {...defaultProps} />)
    const dateButtons = screen.getAllByRole('button')
    
    await userEvent.click(dateButtons[0]) // Click first date
    expect(dateButtons[0]).toHaveClass('bg-primary')
  })

  it('checks availability when button is clicked', async () => {
    mockOnAvailabilityCheck.mockResolvedValue({
      'alex@example.com': [true, false],
      'sarah@example.com': [true, true],
    })

    render(<CalendarIntegration {...defaultProps} />)
    
    // Select a date
    const dateButton = screen.getAllByRole('button')[0]
    await userEvent.click(dateButton)

    // Click check availability button
    const checkButton = screen.getByText(/Check Group Availability/i)
    await userEvent.click(checkButton)

    await waitFor(() => {
      expect(mockOnAvailabilityCheck).toHaveBeenCalled()
    })
  })

  it('sends calendar invites', async () => {
    mockOnInviteSend.mockResolvedValue(undefined)

    render(<CalendarIntegration {...defaultProps} />)
    
    const sendInviteButtons = screen.getAllByText('Send Invite')
    await userEvent.click(sendInviteButtons[0])

    await waitFor(() => {
      expect(mockOnInviteSend).toHaveBeenCalled()
    })
  })

  it('shows loading state when checking availability', async () => {
    mockOnAvailabilityCheck.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(<CalendarIntegration {...defaultProps} />)
    
    // Select a date
    const dateButton = screen.getAllByRole('button')[0]
    await userEvent.click(dateButton)

    // Click check availability button
    const checkButton = screen.getByText(/Check Group Availability/i)
    await userEvent.click(checkButton)

    expect(screen.getByText(/Checking Availability/i)).toBeInTheDocument()
  })

  it('displays error state when invite send fails', async () => {
    mockOnInviteSend.mockRejectedValue(new Error('Failed to send invite'))

    render(<CalendarIntegration {...defaultProps} />)
    
    const sendInviteButton = screen.getAllByText('Send Invite')[0]
    await userEvent.click(sendInviteButton)

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument()
    })
  })

  it('displays success state when invite is sent', async () => {
    mockOnInviteSend.mockResolvedValue(undefined)

    render(<CalendarIntegration {...defaultProps} />)
    
    const sendInviteButton = screen.getAllByText('Send Invite')[0]
    await userEvent.click(sendInviteButton)

    await waitFor(() => {
      expect(screen.getByText('Sent!')).toBeInTheDocument()
    })
  })

  it('displays availability legend', () => {
    render(<CalendarIntegration {...defaultProps} />)
    expect(screen.getByText('Availability Legend')).toBeInTheDocument()
    expect(screen.getByText('Available')).toBeInTheDocument()
    expect(screen.getByText('Unavailable')).toBeInTheDocument()
    expect(screen.getByText('Unknown')).toBeInTheDocument()
  })

  it('updates availability display when data is received', async () => {
    mockOnAvailabilityCheck.mockResolvedValue({
      'alex@example.com': [true],
      'sarah@example.com': [false],
    })

    render(<CalendarIntegration {...defaultProps} />)
    
    // Select a date and check availability
    const dateButton = screen.getAllByRole('button')[0]
    await userEvent.click(dateButton)
    
    const checkButton = screen.getByText(/Check Group Availability/i)
    await userEvent.click(checkButton)

    await waitFor(() => {
      expect(screen.getByText('Available Count')).toBeInTheDocument()
    })
  })
})
This test suite covers:

1. Basic rendering
2. Default props display
3. Date selection functionality
4. Availability checking
5. Calendar invite sending
6. Loading states
7. Error handling
8. Success states
9. Legend display
10. Availability data display

Additional test considerations:

1. Add snapshot tests
2. Test edge cases with empty/invalid data
3. Test accessibility features
4. Test responsive behavior
5. Test different date formats and timezones
6. Test keyboard navigation
7. Test different color themes

To run these tests, you'll need these dependencies in your package.json: