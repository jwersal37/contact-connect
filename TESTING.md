# Testing Guide

## Overview
This project uses Vitest as the test runner along with React Testing Library for component testing. The test suite covers authentication flows, contact management, and UI interactions.

## Running Tests

### Run all tests
```bash
cd frontend
npm test
```

### Run tests with UI
```bash
npm run test:ui
```
This opens an interactive browser-based UI to view and run tests.

### Run tests with coverage
```bash
npm run test:coverage
```
This generates a coverage report showing which parts of the code are tested.

## Test Structure

### Unit Tests (Stores)
- `src/store/authStore.test.js` - Tests for authentication (signup, signin, signout)
- `src/store/contactStore.test.js` - Tests for contact CRUD operations and subscriptions

### Component Tests (Pages)
- `src/pages/Login.test.jsx` - Login form validation, auto-fill feature
- `src/pages/Signup.test.jsx` - Signup form, password matching, validation
- `src/pages/Contacts.test.jsx` - Contact list, search, add/delete operations

## Test Configuration

### Files
- `vitest.config.js` - Main Vitest configuration
- `src/test/setup.js` - Test environment setup, mocks for Firebase and React Router

### Mocks
- Firebase Auth and Firestore are mocked to avoid needing actual Firebase credentials in tests
- React Router is mocked to avoid navigation issues during testing

## Current Status
✅ 12 tests passing  
⚠️ Some tests need refinement to match implementation details  
📝 Test coverage can be expanded as new features are added

## Next Steps
1. Fix remaining test failures by adjusting mocks and assertions
2. Add integration tests for end-to-end flows
3. Increase test coverage for edge cases
4. Add tests for new features as they're developed

## Writing New Tests

### Example Test Structure
```javascript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('Component Name', () => {
  it('should do something', async () => {
    const user = userEvent.setup()
    
    render(<YourComponent />)
    
    // Find elements
    const button = screen.getByRole('button', { name: /click me/i })
    
    // Interact
    await user.click(button)
    
    // Assert
    expect(screen.getByText('Success')).toBeInTheDocument()
  })
})
```

### Best Practices
- Use `screen.getByRole()` when possible for better accessibility testing
- Mock external dependencies (Firebase, APIs)
- Test user interactions, not implementation details
- Keep tests focused on one behavior per test
- Use descriptive test names that explain what is being tested
