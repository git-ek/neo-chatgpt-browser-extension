import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen } from '@testing-library/preact'

// Mock the App component
vi.mock('../../src/popup/App', () => ({
  default: () => <div data-testid="app" />,
}))

describe('popup/index', () => {
  beforeEach(() => {
    // Set up the DOM element that the script will render into
    const appDiv = document.createElement('div')
    appDiv.id = 'app'
    document.body.appendChild(appDiv)
  })

  afterEach(() => {
    // Clean up the DOM and reset modules
    document.body.innerHTML = ''
    vi.resetModules()
  })

  it('should render the App component into the app div', async () => {
    // Dynamically import the script to execute it
    await import('../../src/popup/index')

    // Assert that the mocked App component is in the document
    expect(screen.getByTestId('app')).toBeInTheDocument()
  })
})
