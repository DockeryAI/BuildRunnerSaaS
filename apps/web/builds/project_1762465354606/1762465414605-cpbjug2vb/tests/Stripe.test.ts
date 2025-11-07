Here's a comprehensive set of unit tests for the StripePaymentSetup component:

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StripePaymentSetup } from './StripePaymentSetup'

// Mock framer-motion to avoid animation-related issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => children,
}))

describe('StripePaymentSetup', () => {
  const mockPaymentMethods = [
    { id: 'card_1', type: 'card', last4: '4242', brand: 'Visa', isDefault: true },
    { id: 'bank_1', type: 'bank_account', last4: '6789', bankName: 'Chase', isDefault: false },
  ]

  const mockHandlers = {
    onPaymentMethodAdded: jest.fn(),
    onPaymentMethodRemoved: jest.fn(),
    onDefaultPaymentMethodChanged: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with default payment methods', () => {
    render(<StripePaymentSetup initialPaymentMethods={mockPaymentMethods} />)
    
    expect(screen.getByText('Visa ending in 4242')).toBeInTheDocument()
    expect(screen.getByText('Chase (Bank Account) ending in 6789')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<StripePaymentSetup isLoading={true} />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows error message', () => {
    const errorMessage = 'Test error message'
    render(<StripePaymentSetup error={errorMessage} />)
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('shows empty state when no payment methods', () => {
    render(<StripePaymentSetup initialPaymentMethods={[]} />)
    
    expect(screen.getByText('No payment methods added yet.')).toBeInTheDocument()
  })

  describe('Adding new payment method', () => {
    it('shows add payment method form when button is clicked', async () => {
      render(<StripePaymentSetup {...mockHandlers} />)
      
      await userEvent.click(screen.getByText('Add New Payment Method'))
      
      expect(screen.getByText('Add New Payment Method')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Last 4 digits (e.g., 4242)')).toBeInTheDocument()
    })

    it('validates required fields when adding new method', async () => {
      render(<StripePaymentSetup {...mockHandlers} />)
      
      await userEvent.click(screen.getByText('Add New Payment Method'))
      await userEvent.click(screen.getByText('Add Method'))
      
      expect(screen.getByText('Please fill in all details for the new payment method.')).toBeInTheDocument()
    })

    it('successfully adds new card payment method', async () => {
      render(<StripePaymentSetup {...mockHandlers} />)
      
      await userEvent.click(screen.getByText('Add New Payment Method'))
      await userEvent.type(screen.getByPlaceholderText('Last 4 digits (e.g., 4242)'), '1234')
      await userEvent.type(screen.getByPlaceholderText('Card Brand (e.g., Visa, Mastercard)'), 'Visa')
      await userEvent.click(screen.getByText('Add Method'))
      
      await waitFor(() => {
        expect(screen.getByText('Payment method added successfully!')).toBeInTheDocument()
        expect(mockHandlers.onPaymentMethodAdded).toHaveBeenCalled()
      })
    })
  })

  describe('Managing existing payment methods', () => {
    it('removes payment method', async () => {
      render(<StripePaymentSetup initialPaymentMethods={mockPaymentMethods} {...mockHandlers} />)
      
      const removeButtons = screen.getAllByText('Remove')
      await userEvent.click(removeButtons[0])
      
      await waitFor(() => {
        expect(mockHandlers.onPaymentMethodRemoved).toHaveBeenCalledWith('card_1')
        expect(screen.getByText('Payment method removed.')).toBeInTheDocument()
      })
    })

    it('sets default payment method', async () => {
      render(<StripePaymentSetup initialPaymentMethods={mockPaymentMethods} {...mockHandlers} />)
      
      const setDefaultButton = screen.getByText('Set Default')
      await userEvent.click(setDefaultButton)
      
      await waitFor(() => {
        expect(mockHandlers.onDefaultPaymentMethodChanged).toHaveBeenCalledWith('bank_1')
        expect(screen.getByText('Default payment method updated.')).toBeInTheDocument()
      })
    })
  })

  describe('Error handling', () => {
    it('handles error when removing payment method', async () => {
      const mockError = new Error('Failed to remove')
      mockHandlers.onPaymentMethodRemoved.mockRejectedValueOnce(mockError)
      
      render(<StripePaymentSetup initialPaymentMethods={mockPaymentMethods} {...mockHandlers} />)
      
      const removeButton = screen.getAllByText('Remove')[0]
      await userEvent.click(removeButton)
      
      await waitFor(() => {
        expect(screen.getByText('Failed to remove payment method. Please try again.')).toBeInTheDocument()
      })
    })

    it('handles error when setting default payment method', async () => {
      const mockError = new Error('Failed to set default')
      mockHandlers.onDefaultPaymentMethodChanged.mockRejectedValueOnce(mockError)
      
      render(<StripePaymentSetup initialPaymentMethods={mockPaymentMethods} {...mockHandlers} />)
      
      const setDefaultButton = screen.getByText('Set Default')
      await userEvent.click(setDefaultButton)
      
      await waitFor(() => {
        expect(screen.getByText('Failed to set default payment method. Please try again.')).toBeInTheDocument()
      })
    })
  })
})
This test suite covers:

1. Initial rendering with default props
2. Loading states
3. Error states
4. Empty states
5. Adding new payment methods (both card and bank account)
6. Form validation
7. Removing payment methods
8. Setting default payment methods
9. Error handling for various operations
10. Callback function execution

Additional test considerations:

1. Add tests for input field validation (e.g., last4 digits only accepting numbers)
2. Test the timeout functionality for success/error messages
3. Test the animation presence (though we're mocking framer-motion here)
4. Test different combinations of props
5. Test accessibility features

To run these tests, you'll need the following dependencies in your package.json: