import { render, screen } from '@testing-library/preact'
import { describe, it, expect } from 'vitest'
import App from '../../src/popup/App'

describe('Popup App', () => {
  it('should render the title', () => {
    render(<App />)
    expect(screen.getByText('Neo ChatGPT Extension')).toBeInTheDocument()
  })
})
