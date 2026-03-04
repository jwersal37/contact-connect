import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Signup from '../Signup'

// Mock Firebase
const mockSignUp = vi.fn()
const mockNavigate = vi.fn()

vi.mock('../../store/authStore', () => ({
  useAuthStore: () => ({
    signUp: mockSignUp,
  }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Signup Integration Tests', () => {
  beforeEach(() => {
    mockSignUp.mockClear()
    mockNavigate.mockClear()
  })

  it('CRITICAL: Double-click should create account and navigate', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValue({ success: true })

    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    )

    const signUpButton = screen.getByRole('button', { name: /sign up/i })
    
    // Double-click the button
    await user.dblClick(signUpButton)

    // Wait for async signup to complete
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        expect.stringMatching(/test\d+@test\.com/),
        'test123',
        'Test User'
      )
    }, { timeout: 3000 })

    // Should navigate to dashboard on success
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('should show error if double-click signup fails', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValue({ 
      success: false, 
      error: 'Email already in use' 
    })

    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    )

    const signUpButton = screen.getByRole('button', { name: /sign up/i })
    await user.dblClick(signUpButton)

    await waitFor(() => {
      expect(screen.getByText('Email already in use')).toBeInTheDocument()
    })
  })

  it('should NOT submit on single click', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValue({ success: true })

    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    )

    const signUpButton = screen.getByRole('button', { name: /sign up/i })
    
    // Single click should not submit (form is empty)
    await user.click(signUpButton)

    // Wait a bit to ensure it doesn't call signup
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('manual form submission should work', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValue({ success: true })

    render(
      <BrowserRouter>
        <Signup />
      </BrowserRouter>
    )

    // Fill form manually
    await user.type(screen.getByLabelText(/full name/i), 'Manual User')
    await user.type(screen.getByLabelText(/^email/i), 'manual@test.com')
    await user.type(screen.getByLabelText(/^password$/i), 'manual123')
    await user.type(screen.getByLabelText(/confirm password/i), 'manual123')

    const signUpButton = screen.getByRole('button', { name: /sign up/i })
    await user.click(signUpButton)

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        'manual@test.com',
        'manual123',
        'Manual User'
      )
    })
  })
})
