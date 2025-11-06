Here's a comprehensive set of unit tests for the Calendar component:

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TripCalendar } from './TripCalendar'

// Mock Framer Motion to avoid animation-related issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}))

describe('TripCalendar', () => {
  const mockEvents = [
    {
      id: '1',
      title: 'Test Event 1',
      start: new Date('2024-01-15T10:00:00'),
      end: new Date('2024-01-15T11:00:00'),
      attendees: [],
    },
  ]

  const mockOnAddEvent = jest.fn()
  const mockOnDeleteEvent = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders calendar with correct month and year', () => {
    const currentDate = new Date('2024-01-15')
    jest.useFakeTimers().setSystemTime(currentDate)

    render(<TripCalendar />)
    
    expect(screen.getByText('January 2024')).toBeInTheDocument()
  })

  it('displays events on the correct day', () => {
    const currentDate = new Date('2024-01-15')
    jest.useFakeTimers().setSystemTime(currentDate)

    render(
      <TripCalendar
        events={mockEvents}
        onAddEvent={mockOnAddEvent}
        onDeleteEvent={mockOnDeleteEvent}
      />
    )

    expect(screen.getByText('Test Event 1')).toBeInTheDocument()
  })

  it('navigates between months', async () => {
    render(<TripCalendar />)

    const prevButton = screen.getByLabelText('Previous month')
    const nextButton = screen.getByLabelText('Next month')

    fireEvent.click(nextButton)
    await waitFor(() => {
      expect(screen.getByText(/February/)).toBeInTheDocument()
    })

    fireEvent.click(prevButton)
    await waitFor(() => {
      expect(screen.getByText(/January/)).toBeInTheDocument()
    })
  })

  it('opens add event modal when clicking Add Event button', async () => {
    render(<TripCalendar />)

    fireEvent.click(screen.getByText('Add Event'))
    
    expect(screen.getByText('Add New Event')).toBeInTheDocument()
    expect(screen.getByLabelText('Title')).toBeInTheDocument()
  })

  it('adds new event when submitting the form', async () => {
    render(
      <TripCalendar
        events={mockEvents}
        onAddEvent={mockOnAddEvent}
        onDeleteEvent={mockOnDeleteEvent}
      />
    )

    // Open modal
    fireEvent.click(screen.getByText('Add Event'))

    // Fill form
    const titleInput = screen.getByLabelText('Title')
    await userEvent.type(titleInput, 'New Test Event')

    // Submit form
    fireEvent.submit(screen.getByText('Add Event').closest('form'))

    expect(mockOnAddEvent).toHaveBeenCalledTimes(1)
    expect(mockOnAddEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'New Test Event',
      })
    )
  })

  it('deletes event when clicking delete button', async () => {
    render(
      <TripCalendar
        events={mockEvents}
        onAddEvent={mockOnAddEvent}
        onDeleteEvent={mockOnDeleteEvent}
      />
    )

    const deleteButton = screen.getByLabelText('Delete event: Test Event 1')
    fireEvent.click(deleteButton)

    expect(mockOnDeleteEvent).toHaveBeenCalledTimes(1)
    expect(mockOnDeleteEvent).toHaveBeenCalledWith('1')
  })

  it('closes modal when clicking cancel button', () => {
    render(<TripCalendar />)

    // Open modal
    fireEvent.click(screen.getByText('Add Event'))
    expect(screen.getByText('Add New Event')).toBeInTheDocument()

    // Close modal
    fireEvent.click(screen.getByText('Cancel'))
    expect(screen.queryByText('Add New Event')).not.toBeInTheDocument()
  })

  it('displays loading state correctly', () => {
    render(<TripCalendar />)
    
    // Set loading state
    // Note: You might need to modify the component to accept a loading prop
    // or expose a way to trigger loading state for testing

    const skeletons = screen.getAllByTestId('calendar-skeleton')
    expect(skeletons).toHaveLength(35) // 5 weeks × 7 days
  })

  it('displays error message when error state is present', () => {
    const errorMessage = 'Failed to load calendar events'
    render(<TripCalendar error={errorMessage} />)

    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('validates required fields in add event form', async () => {
    render(<TripCalendar />)

    // Open modal
    fireEvent.click(screen.getByText('Add Event'))

    // Try to submit without filling required fields
    fireEvent.submit(screen.getByText('Add Event').closest('form'))

    // Check for HTML5 validation messages
    expect(screen.getByLabelText('Title')).toBeInvalid()
    expect(screen.getByLabelText('Start')).toBeInvalid()
    expect(screen.getByLabelText('End')).toBeInvalid()
  })
})
Additional test setup in `jest.setup.js`:

import '@testing-library/jest-dom'
import 'jest-canvas-mock'

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
This test suite covers:

1. Basic rendering
2. Month navigation
3. Event display
4. Adding new events
5. Deleting events
6. Modal functionality
7. Form validation
8. Loading states
9. Error handling
10. Date manipulation

To run these tests, you'll need these dependencies in your `package.json`: