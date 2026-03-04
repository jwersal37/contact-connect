import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Login from './Login'
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

describe('Login Component', () => {
  const mockSignIn = vi.fn()
  const mockClearError = vi.fn()

  beforeEach(() => {
    mockSignIn.mockClear()
    mockClearError.mockClear()
    mockNavigate.mockClear()
    
    useAuthStore.mockReturnValue({
      signIn: mockSignIn,
      error: null,
      loading: false,
      clearError: mockClearError,
    })
  })

  it('renders login form correctly', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('updates email and password fields on input', async () => {
    const user = userEvent.setup()
    
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')

    expect(emailInput).toHaveValue('test@example.com')
    expect(passwordInput).toHaveValue('password123')
  })

  it('calls signIn with correct credentials on form submit', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue()

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('displays error message when sign in fails', () => {
    useAuthStore.mockReturnValue({
      signIn: mockSignIn,
      error: 'Invalid email or password',
      loading: false,
      clearError: mockClearError,
    })

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

    expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
  })

  it('shows loading state during sign in', () => {
    useAuthStore.mockReturnValue({
      signIn: mockSignIn,
      error: null,
      loading: true,
      clearError: mockClearError,
    })

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

    const submitButton = screen.getByRole('button', { name: /signing in/i })
    expect(submitButton).toBeDisabled()
  })

  it('prevents form submission with empty fields', async () => {
    const user = userEvent.setup()

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)

    // signIn should not be called with empty fields
    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it('auto-fills form on double-click (dev feature)', async () => {
    const user = userEvent.setup()

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    // Double-click the button
    await user.dblClick(submitButton)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)

    expect(emailInput).toHaveValue('test@test.com')
    expect(passwordInput).toHaveValue('test123')
  })

  it('has link to signup page', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

    const signupLink = screen.getByText(/sign up/i)
    expect(signupLink).toBeInTheDocument()
    expect(signupLink.closest('a')).toHaveAttribute('href', '/signup')
  })
})
