Here's a comprehensive set of unit tests for the Google Calendar API component:

// GoogleCalendarAPI.test.tsx
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GoogleCalendarAPI } from './GoogleCalendarAPI'

describe('GoogleCalendarAPI', () => {
  const mockOnEventCreated = jest.fn()
  const mockOnInvitesSent = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the initial state correctly', () => {
    render(<GoogleCalendarAPI />)
    
    expect(screen.getByText('Calendar Integration')).toBeInTheDocument()
    expect(screen.getByText('Sync trip events with your calendar')).toBeInTheDocument()
    expect(screen.getByText('Connect')).toBeInTheDocument()
  })

  it('handles calendar connection flow', async () => {
    render(<GoogleCalendarAPI />)
    
    const connectButton = screen.getByText('Connect')
    fireEvent.click(connectButton)

    expect(screen.getByText('Connecting...')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Connected')).toBeInTheDocument()
      expect(screen.getByText('Successfully connected to Google Calendar')).toBeInTheDocument()
    })
  })

  it('shows create event modal when clicking create button', async () => {
    render(<GoogleCalendarAPI />)
    
    // First connect the calendar
    const connectButton = screen.getByText('Connect')
    fireEvent.click(connectButton)
    
    await waitFor(() => {
      const createButton = screen.getByText('Create Trip Event')
      fireEvent.click(createButton)
    })

    expect(screen.getByText('Create Event')).toBeInTheDocument()
    expect(screen.getByLabelText('Event Title')).toBeInTheDocument()
  })

  it('creates a new event successfully', async () => {
    render(<GoogleCalendarAPI onEventCreated={mockOnEventCreated} onInvitesSent={mockOnInvitesSent} />)
    
    // Connect calendar
    fireEvent.click(screen.getByText('Connect'))
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Create Trip Event'))
    })

    // Fill in event details
    const titleInput = screen.getByPlaceholderText('Off-road adventure...')
    const dateInput = screen.getByLabelText('Date')
    const timeInput = screen.getByLabelText('Time')
    const locationInput = screen.getByPlaceholderText('Trail location...')

    fireEvent.change(titleInput, { target: { value: 'Test Event' } })
    fireEvent.change(dateInput, { target: { value: '2024-03-01' } })
    fireEvent.change(timeInput, { target: { value: '10:00' } })
    fireEvent.change(locationInput, { target: { value: 'Test Location' } })

    // Select attendees
    const attendeeCheckbox = screen.getByLabelText('Alex Johnson')
    fireEvent.click(attendeeCheckbox)

    // Create event
    fireEvent.click(screen.getByText('Create Event & Send Invites'))

    expect(mockOnEventCreated).toHaveBeenCalled()
    expect(mockOnInvitesSent).toHaveBeenCalledWith(['alex@example.com'])
  })

  it('displays validation by disabling create button when required fields are empty', async () => {
    render(<GoogleCalendarAPI />)
    
    // Connect calendar
    fireEvent.click(screen.getByText('Connect'))
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Create Trip Event'))
    })

    const createButton = screen.getByText('Create Event & Send Invites')
    expect(createButton).toBeDisabled()
  })

  it('displays existing events when connected', async () => {
    render(<GoogleCalendarAPI />)
    
    // Connect calendar
    fireEvent.click(screen.getByText('Connect'))
    
    await waitFor(() => {
      expect(screen.getByText('Moab Off-Road Adventure')).toBeInTheDocument()
      expect(screen.getByText('Trail Prep Meeting')).toBeInTheDocument()
    })
  })

  it('allows toggling attendees in event creation', async () => {
    render(<GoogleCalendarAPI />)
    
    // Connect calendar
    fireEvent.click(screen.getByText('Connect'))
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Create Trip Event'))
    })

    const alexCheckbox = screen.getByLabelText('Alex Johnson')
    const sarahCheckbox = screen.getByLabelText('Sarah Chen')

    fireEvent.click(alexCheckbox)
    expect(alexCheckbox).toBeChecked()

    fireEvent.click(sarahCheckbox)
    expect(sarahCheckbox).toBeChecked()

    fireEvent.click(alexCheckbox)
    expect(alexCheckbox).not.toBeChecked()
  })

  it('closes create event modal when clicking close button', async () => {
    render(<GoogleCalendarAPI />)
    
    // Connect calendar
    fireEvent.click(screen.getByText('Connect'))
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Create Trip Event'))
    })

    const closeButton = screen.getByLabelText('Close create event modal')
    fireEvent.click(closeButton)

    expect(screen.queryByText('Create Event')).not.toBeInTheDocument()
  })
})
This test suite covers:

1. Initial rendering
2. Calendar connection flow
3. Event creation modal opening/closing
4. Event creation with validation
5. Attendee selection
6. Display of existing events
7. Form validation
8. Modal interaction

Additional test considerations:

// Additional test cases you might want to add:

describe('GoogleCalendarAPI Edge Cases', () => {
  it('handles network errors during calendar connection', () => {
    // Test error handling during connection
  })

  it('formats dates correctly in different timezones', () => {
    // Test date formatting
  })

  it('handles empty group members prop', () => {
    // Test with no group members
  })

  it('maintains state between modal opens/closes', () => {
    // Test form state persistence
  })
})
To run these tests, you'll need these dependencies in your package.json: