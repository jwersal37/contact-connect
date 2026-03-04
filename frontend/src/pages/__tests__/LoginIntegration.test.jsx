import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Login from '../Login'

// Mock Firebase
const mockSignIn = vi.fn()
const mockNavigate = vi.fn()

vi.mock('../../store/authStore', () => ({
  useAuthStore: () => ({
    signIn: mockSignIn,
  }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Login Integration Tests', () => {
  beforeEach(() => {
    mockSignIn.mockClear()
    mockNavigate.mockClear()
  })

  it('CRITICAL: Double-click should sign in and navigate', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue({ success: true })

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

    const signInButton = screen.getByRole('button', { name: /sign in/i })
    
    // Double-click the button
    await user.dblClick(signInButton)

    // Wait for async signin to complete
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@test.com', 'test123')
    }, { timeout: 3000 })

    // Should navigate to dashboard on success
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('should show error if double-click login fails', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue({ 
      success: false, 
      error: 'Invalid email or password' 
    })

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

    const signInButton = screen.getByRole('button', { name: /sign in/i })
    await user.dblClick(signInButton)

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
    })
  })

  it('should fill form fields on double-click', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue({ success: true })

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

    const signInButton = screen.getByRole('button', { name: /sign in/i })
    await user.dblClick(signInButton)

    // Check that form fields were filled
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)

    await waitFor(() => {
      expect(emailInput).toHaveValue('test@test.com')
      expect(passwordInput).toHaveValue('test123')
    })
  })

  it('manual form submission should work', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue({ success: true })

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

    await user.type(screen.getByLabelText(/email/i), 'user@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')

    const signInButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(signInButton)

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('user@example.com', 'password123')
    })
  })
})
