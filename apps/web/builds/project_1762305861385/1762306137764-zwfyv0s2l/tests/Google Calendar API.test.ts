Here's a comprehensive set of unit tests for the Google Calendar API component:

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GoogleCalendarAPI } from './GoogleCalendarAPI'
import '@testing-library/jest-dom'

describe('GoogleCalendarAPI', () => {
  const mockOnAvailabilityCheck = jest.fn()
  const mockOnEventCreate = jest.fn()
  
  const defaultProps = {
    tripDates: {
      start: new Date('2024-01-01T10:00:00'),
      end: new Date('2024-01-03T16:00:00')
    },
    groupMembers: [
      { id: '1', name: 'Test User', email: 'test@example.com' },
      { id: '2', name: 'Another User', email: 'another@example.com' }
    ],
    onAvailabilityCheck: mockOnAvailabilityCheck,
    onEventCreate: mockOnEventCreate
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders initial state correctly', () => {
    render(<GoogleCalendarAPI {...defaultProps} />)
    
    expect(screen.getByText('Calendar Integration')).toBeInTheDocument()
    expect(screen.getByText('Not Connected')).toBeInTheDocument()
    expect(screen.getByText('Connect Google Calendar')).toBeInTheDocument()
  })

  it('displays trip dates correctly', () => {
    render(<GoogleCalendarAPI {...defaultProps} />)
    
    expect(screen.getByText('Mon, Jan 1, 2024')).toBeInTheDocument()
    expect(screen.getByText('Wed, Jan 3, 2024')).toBeInTheDocument()
  })

  it('handles Google Calendar connection', async () => {
    render(<GoogleCalendarAPI {...defaultProps} />)
    
    const connectButton = screen.getByText('Connect Google Calendar')
    fireEvent.click(connectButton)

    expect(screen.getByText('Connecting...')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Connected')).toBeInTheDocument()
      expect(mockOnAvailabilityCheck).toHaveBeenCalled()
    })
  })

  it('displays error message when connection fails', async () => {
    // Mock the Promise to reject
    jest.spyOn(global, 'Promise').mockImplementationOnce(() => {
      return Promise.reject('Connection failed')
    })

    render(<GoogleCalendarAPI {...defaultProps} />)
    
    const connectButton = screen.getByText('Connect Google Calendar')
    fireEvent.click(connectButton)

    await waitFor(() => {
      expect(screen.getByText('Failed to connect to Google Calendar. Please try again.')).toBeInTheDocument()
    })
  })

  it('allows selecting group members after connection', async () => {
    render(<GoogleCalendarAPI {...defaultProps} />)
    
    const connectButton = screen.getByText('Connect Google Calendar')
    fireEvent.click(connectButton)

    await waitFor(() => {
      expect(screen.getByText('Connected')).toBeInTheDocument()
    })

    const checkbox = screen.getByLabelText(`Select ${defaultProps.groupMembers[0].name} for calendar invite`)
    fireEvent.click(checkbox)

    expect(checkbox).toBeChecked()
  })

  it('creates calendar event with selected members', async () => {
    render(<GoogleCalendarAPI {...defaultProps} />)
    
    // Connect to calendar
    const connectButton = screen.getByText('Connect Google Calendar')
    fireEvent.click(connectButton)

    await waitFor(() => {
      expect(screen.getByText('Connected')).toBeInTheDocument()
    })

    // Select a member
    const checkbox = screen.getByLabelText(`Select ${defaultProps.groupMembers[0].name} for calendar invite`)
    fireEvent.click(checkbox)

    // Create event
    const createButton = screen.getByText('Create Event & Send Invites')
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(mockOnEventCreate).toHaveBeenCalled()
      const calledWith = mockOnEventCreate.mock.calls[0][0]
      expect(calledWith.attendees).toContain(defaultProps.groupMembers[0].email)
    })
  })

  it('shows error when trying to create event without selected members', async () => {
    render(<GoogleCalendarAPI {...defaultProps} />)
    
    // Connect to calendar
    const connectButton = screen.getByText('Connect Google Calendar')
    fireEvent.click(connectButton)

    await waitFor(() => {
      expect(screen.getByText('Connected')).toBeInTheDocument()
    })

    // Try to create event without selecting members
    const createButton = screen.getByText('Create Event & Send Invites')
    fireEvent.click(createButton)

    expect(screen.getByText('Please select at least one group member')).toBeInTheDocument()
  })

  it('handles loading states correctly', async () => {
    render(<GoogleCalendarAPI {...defaultProps} />)
    
    const connectButton = screen.getByText('Connect Google Calendar')
    fireEvent.click(connectButton)

    expect(screen.getByText('Connecting...')).toBeInTheDocument()
    expect(connectButton).toBeDisabled()

    await waitFor(() => {
      expect(screen.getByText('Connected')).toBeInTheDocument()
    })
  })

  it('displays availability status correctly', async () => {
    render(<GoogleCalendarAPI {...defaultProps} />)
    
    const connectButton = screen.getByText('Connect Google Calendar')
    fireEvent.click(connectButton)

    await waitFor(() => {
      const availabilityStatuses = screen.getAllByText(/Available|Conflict/)
      expect(availabilityStatuses.length).toBeGreaterThan(0)
    })
  })
})
This test suite covers:

1. Initial rendering
2. Trip dates display
3. Google Calendar connection process
4. Error handling
5. Member selection functionality
6. Calendar event creation
7. Validation for event creation
8. Loading states
9. Availability status display

Additional considerations for the test suite:

1. Add `jest.mock()` calls for external dependencies if needed
2. Add more edge cases and error scenarios
3. Test accessibility features
4. Test responsive behavior
5. Test date formatting functions separately

To run these tests, you'll need these dependencies in your `package.json`: