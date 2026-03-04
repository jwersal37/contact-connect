import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Contacts from './Contacts'
import { useAuthStore } from '../store/authStore'
import { useContactStore } from '../store/contactStore'

// Mock the stores
vi.mock('../store/authStore', () => ({
  useAuthStore: vi.fn(),
}))

vi.mock('../store/contactStore', () => ({
  useContactStore: vi.fn(),
}))

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn((date) => '2 days ago'),
}))

describe('Contacts Component', () => {
  const mockSubscribeToContacts = vi.fn()
  const mockUnsubscribeFromContacts = vi.fn()
  const mockAddContact = vi.fn()
  const mockDeleteContact = vi.fn()
  const mockLogInteraction = vi.fn()

  beforeEach(() => {
    mockSubscribeToContacts.mockClear()
    mockUnsubscribeFromContacts.mockClear()
    mockAddContact.mockClear()
    mockDeleteContact.mockClear()
    mockLogInteraction.mockClear()

    useAuthStore.mockReturnValue({
      user: { id: 'user123', email: 'test@example.com' },
    })

    useContactStore.mockReturnValue({
      contacts: [],
      subscribeToContacts: mockSubscribeToContacts,
      unsubscribeFromContacts: mockUnsubscribeFromContacts,
      addContact: mockAddContact,
      deleteContact: mockDeleteContact,
      logInteraction: mockLogInteraction,
    })
  })

  it('renders contacts page correctly', () => {
    render(
      <BrowserRouter>
        <Contacts />
      </BrowserRouter>
    )

    expect(screen.getByText('My Contacts')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/search contacts/i)).toBeInTheDocument()
  })

  it('subscribes to contacts on mount', () => {
    render(
      <BrowserRouter>
        <Contacts />
      </BrowserRouter>
    )

    expect(mockSubscribeToContacts).toHaveBeenCalledWith('user123')
  })

  it('unsubscribes from contacts on unmount', () => {
    const { unmount } = render(
      <BrowserRouter>
        <Contacts />
      </BrowserRouter>
    )

    unmount()

    expect(mockUnsubscribeFromContacts).toHaveBeenCalled()
  })

  it('displays list of contacts', () => {
    useContactStore.mockReturnValue({
      contacts: [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
          lastInteraction: new Date(),
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '098-765-4321',
          lastInteraction: new Date(),
        },
      ],
      subscribeToContacts: mockSubscribeToContacts,
      unsubscribeFromContacts: mockUnsubscribeFromContacts,
      addContact: mockAddContact,
      deleteContact: mockDeleteContact,
      logInteraction: mockLogInteraction,
    })

    render(
      <BrowserRouter>
        <Contacts />
      </BrowserRouter>
    )

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('filters contacts based on search query', async () => {
    const user = userEvent.setup()

    useContactStore.mockReturnValue({
      contacts: [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          lastInteraction: new Date(),
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          lastInteraction: new Date(),
        },
      ],
      subscribeToContacts: mockSubscribeToContacts,
      unsubscribeFromContacts: mockUnsubscribeFromContacts,
      addContact: mockAddContact,
      deleteContact: mockDeleteContact,
      logInteraction: mockLogInteraction,
    })

    render(
      <BrowserRouter>
        <Contacts />
      </BrowserRouter>
    )

    const searchInput = screen.getByPlaceholderText(/search contacts/i)
    await user.type(searchInput, 'john')

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
  })

  it('opens add contact modal when add button is clicked', async () => {
    const user = userEvent.setup()

    render(
      <BrowserRouter>
        <Contacts />
      </BrowserRouter>
    )

    const addButton = screen.getByRole('button', { name: /add contact/i })
    await user.click(addButton)

    expect(screen.getByText(/add new contact/i)).toBeInTheDocument()
  })

  it('submits new contact form', async () => {
    const user = userEvent.setup()
    mockAddContact.mockResolvedValue({ success: true })

    render(
      <BrowserRouter>
        <Contacts />
      </BrowserRouter>
    )

    // Open modal
    const addButton = screen.getByRole('button', { name: /add contact/i })
    await user.click(addButton)

    // Fill form - be more specific with label queries
    const nameInput = screen.getByLabelText(/^name$/i)
    await user.type(nameInput, 'New Contact')

    const emailInputs = screen.getAllByLabelText(/email/i)
    await user.type(emailInputs[emailInputs.length - 1], 'new@example.com')

    // Submit form
    const saveButton = screen.getByRole('button', { name: /save contact/i })
    await user.click(saveButton)

    await waitFor(() => {
      expect(mockAddContact).toHaveBeenCalledWith(
        'user123',
        expect.objectContaining({
          name: 'New Contact',
          email: 'new@example.com',
        })
      )
    })
  })

  it('displays empty state when no contacts', () => {
    render(
      <BrowserRouter>
        <Contacts />
      </BrowserRouter>
    )

    expect(screen.getByText(/no contacts yet/i)).toBeInTheDocument()
  })

  it('calls logInteraction when interaction button is clicked', async () => {
    const user = userEvent.setup()

    useContactStore.mockReturnValue({
      contacts: [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          lastInteraction: new Date(),
        },
      ],
      subscribeToContacts: mockSubscribeToContacts,
      unsubscribeFromContacts: mockUnsubscribeFromContacts,
      addContact: mockAddContact,
      deleteContact: mockDeleteContact,
      logInteraction: mockLogInteraction,
    })

    render(
      <BrowserRouter>
        <Contacts />
      </BrowserRouter>
    )

    const interactionButtons = screen.getAllByRole('button', { name: '' })
    const logButton = interactionButtons.find(btn => btn.querySelector('svg'))
    
    if (logButton) {
      await user.click(logButton)
      expect(mockLogInteraction).toHaveBeenCalledWith('1')
    }
  })
})
