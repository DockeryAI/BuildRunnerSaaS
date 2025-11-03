Here's a comprehensive set of unit tests for the CalendarEventBuilder component:

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarEventBuilder } from './CalendarEventBuilder';
import { InstagramAPI } from '../services/instagram-api';

// Mock Instagram API
jest.mock('../services/instagram-api');

describe('CalendarEventBuilder', () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();
  const defaultProps = {
    onSave: mockOnSave,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields correctly', () => {
    render(<CalendarEventBuilder {...defaultProps} />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/attendees/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/instagram post id/i)).toBeInTheDocument();
  });

  it('populates form with initial event data', () => {
    const initialEvent = {
      title: 'Test Event',
      description: 'Test Description',
      location: 'Test Location',
      attendees: ['person1@test.com', 'person2@test.com'],
    };

    render(<CalendarEventBuilder {...defaultProps} initialEvent={initialEvent} />);

    expect(screen.getByLabelText(/title/i)).toHaveValue('Test Event');
    expect(screen.getByLabelText(/description/i)).toHaveValue('Test Description');
    expect(screen.getByLabelText(/location/i)).toHaveValue('Test Location');
    expect(screen.getByLabelText(/attendees/i)).toHaveValue('person1@test.com, person2@test.com');
  });

  it('shows validation errors for required fields', async () => {
    render(<CalendarEventBuilder {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /save event/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/title is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/at least one attendee is required/i)).toBeInTheDocument();
  });

  it('validates end date is after start date', async () => {
    render(<CalendarEventBuilder {...defaultProps} />);

    const startDate = screen.getByLabelText(/start date/i);
    const endDate = screen.getByLabelText(/end date/i);

    fireEvent.change(startDate, { target: { value: '2023-12-25T10:00' } });
    fireEvent.change(endDate, { target: { value: '2023-12-24T10:00' } });

    expect(await screen.findByText(/end date must be after start date/i)).toBeInTheDocument();
  });

  it('handles Instagram post verification successfully', async () => {
    (InstagramAPI.verifyPost as jest.Mock).mockResolvedValueOnce(true);

    render(<CalendarEventBuilder {...defaultProps} />);

    const instagramInput = screen.getByLabelText(/instagram post id/i);
    await userEvent.type(instagramInput, '123456');

    await waitFor(() => {
      expect(InstagramAPI.verifyPost).toHaveBeenCalledWith('123456');
    });
    expect(screen.queryByText(/invalid instagram post id/i)).not.toBeInTheDocument();
  });

  it('handles Instagram post verification failure', async () => {
    (InstagramAPI.verifyPost as jest.Mock).mockRejectedValueOnce(new Error('Invalid post'));

    render(<CalendarEventBuilder {...defaultProps} />);

    const instagramInput = screen.getByLabelText(/instagram post id/i);
    await userEvent.type(instagramInput, 'invalid-id');

    expect(await screen.findByText(/invalid instagram post id/i)).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    render(<CalendarEventBuilder {...defaultProps} />);

    // Fill in required fields
    await userEvent.type(screen.getByLabelText(/title/i), 'Test Event');
    await userEvent.type(screen.getByLabelText(/attendees/i), 'test@example.com');
    
    const startDate = '2023-12-25T10:00';
    const endDate = '2023-12-25T11:00';
    
    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: startDate } });
    fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: endDate } });

    const submitButton = screen.getByRole('button', { name: /save event/i });
    await userEvent.click(submitButton);

    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Test Event',
      attendees: ['test@example.com'],
      startDate: expect.any(Date),
      endDate: expect.any(Date),
    }));
  });

  it('handles cancel button click', () => {
    render(<CalendarEventBuilder {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('disables submit button when form has errors', async () => {
    render(<CalendarEventBuilder {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /save event/i });
    expect(submitButton).toBeDisabled();

    // Fill in required fields
    await userEvent.type(screen.getByLabelText(/title/i), 'Test Event');
    await userEvent.type(screen.getByLabelText(/attendees/i), 'test@example.com');
    
    const startDate = '2023-12-25T10:00';
    const endDate = '2023-12-25T11:00';
    
    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: startDate } });
    fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: endDate } });

    expect(submitButton).not.toBeDisabled();
  });

  it('shows loading state during form submission', async () => {
    (InstagramAPI.verifyPost as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<CalendarEventBuilder {...defaultProps} />);

    // Fill in required fields
    await userEvent.type(screen.getByLabelText(/title/i), 'Test Event');
    await userEvent.type(screen.getByLabelText(/attendees/i), 'test@example.com');
    
    const startDate = '2023-12-25T10:00';
    const endDate = '2023-12-25T11:00';
    
    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: startDate } });
    fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: endDate } });

    const submitButton = screen.getByRole('button', { name: /save event/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/saving/i)).toBeInTheDocument();
  });
});
```

This test suite covers:

1. Initial rendering of all form fields
2. Populating form with initial data
3. Form validation for required fields
4. Date validation logic
5. Instagram post verification (success and failure cases)
6. Form submission with valid data
7. Cancel button functionality
8. Submit button disable/enable states
9. Loading state during form submission
10. Error handling and display

The tests use:
- `render` to mount the component
- `screen` to query elements
- `fireEvent` for basic event simulation
- `userEvent` for more complex user interactions
- `waitFor` for async operations
- Jest mocks for the Instagram API
- Various assertions to verify component behavior

Make sure to have these testing libraries installed:
```bash
npm install --save-dev @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

Also, you'll need to configure Jest to handle TypeScript and CSS imports if you haven't already.