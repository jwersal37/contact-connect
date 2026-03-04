import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Signup from './Signup'
import { useAuthStore } from '../store/authStore'

// Mock the auth store
vi.mock('../store/authStore', () => ({
  useAuthStore: vi.fn(),
}))

// Mock navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Signup Component', () => {
  const mockSignUp = vi.fn()
  const mockClearError = vi.fn()

  beforeEach(() => {
    mockSignUp.mockClear()
    mockClearError.mockClear()
    mockNavigate.mockClear()
    
    useAuthStore.mockReturnValue({
      signUp: mockSignUp,
      error: null,
      loading: false,
      clearError: mockClearError,
    })
  })

  it('renders signup form correctly', () => {
    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    )

    expect(screen.getByText('Create Account')).toBeInTheDocument()
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
  })

  it('updates form fields on input', async () => {
    const user = userEvent.setup()
    
    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    )

    const nameInput = screen.getByLabelText(/display name/i)
    const emailInput = screen.getByLabelText(/^email$/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

    await user.type(nameInput, 'Test User')
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')

    expect(nameInput).toHaveValue('Test User')
    expect(emailInput).toHaveValue('test@example.com')
    expect(passwordInput).toHaveValue('password123')
    expect(confirmPasswordInput).toHaveValue('password123')
  })

  it('calls signUp with correct data on form submit', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValue()

    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    )

    await user.type(screen.getByLabelText(/display name/i), 'Test User')
    await user.type(screen.getByLabelText(/^email$/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')
    
    const submitButton = screen.getByRole('button', { name: /sign up/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password123', 'Test User')
    })
  })

  it('shows error when passwords do not match', async () => {
    const user = userEvent.setup()

    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    )

    await user.type(screen.getByLabelText(/display name/i), 'Test User')
    await user.type(screen.getByLabelText(/^email$/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'differentpassword')
    
    const submitButton = screen.getByRole('button', { name: /sign up/i })
    await user.click(submitButton)

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('shows error when password is too short', async () => {
    const user = userEvent.setup()

    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    )

    await user.type(screen.getByLabelText(/display name/i), 'Test User')
    await user.type(screen.getByLabelText(/^email$/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^password$/i), '12345')
    await user.type(screen.getByLabelText(/confirm password/i), '12345')
    
    const submitButton = screen.getByRole('button', { name: /sign up/i })
    await user.click(submitButton)

    expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('displays error message from auth store', () => {
    useAuthStore.mockReturnValue({
      signUp: mockSignUp,
      error: 'Email already in use',
      loading: false,
      clearError: mockClearError,
    })

    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    )

    expect(screen.getByText('Email already in use')).toBeInTheDocument()
  })

  it('shows loading state during signup', () => {
    useAuthStore.mockReturnValue({
      signUp: mockSignUp,
      error: null,
      loading: true,
      clearError: mockClearError,
    })

    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    )

    const submitButton = screen.getByRole('button', { name: /creating account/i })
    expect(submitButton).toBeDisabled()
  })

  it('auto-fills form on double-click (dev feature)', async () => {
    const user = userEvent.setup()

    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    )

    const submitButton = screen.getByRole('button', { name: /sign up/i })
    
    // Double-click the button
    await user.dblClick(submitButton)

    const nameInput = screen.getByLabelText(/display name/i)
    const emailInput = screen.getByLabelText(/^email$/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

    expect(nameInput).toHaveValue('Test User')
    expect(emailInput.value).toMatch(/test\d+@test\.com/)
    expect(passwordInput).toHaveValue('test123')
    expect(confirmPasswordInput).toHaveValue('test123')
  })

  it('has link to login page', () => {
    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    )

    const loginLink = screen.getByText(/sign in/i)
    expect(loginLink).toBeInTheDocument()
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login')
  })
})
