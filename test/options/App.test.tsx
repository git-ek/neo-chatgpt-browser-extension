import { render, screen } from '@testing-library/preact'
import { describe, it, expect, vi } from 'vitest'
import App from '../../src/options/App'

// Mock the child component
vi.mock('../../src/options/ProviderSelect', () => ({
  default: () => <div data-testid="provider-select" />,
}))

// Mock the logo import
vi.mock('../../src/logo.png', () => ({
  default: 'logo.png',
}))

describe('options/App', () => {
  it('should render the options page with title, logo, and provider select', () => {
    render(<App />)

    // Check for title
    expect(screen.getByText('ext_settings_title')).toBeInTheDocument()

    // Check for logo
    expect(screen.getByRole('img')).toHaveAttribute('src', 'logo.png')

    // Check for mocked child component
    expect(screen.getByTestId('provider-select')).toBeInTheDocument()

    // Check for privacy link
    expect(screen.getByText('ext_privacy_link_text')).toBeInTheDocument()
  })
})
