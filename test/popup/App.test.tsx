import { render, screen, fireEvent } from '@testing-library/preact'
import { describe, it, expect } from 'vitest'
import App from '../../src/popup/App'
import Browser from 'webextension-polyfill'

describe('Popup App', () => {
  it('should render the main popup UI', () => {
    render(<App />)
    // Check for title (mocked i18n returns the key)
    expect(screen.getByText('ext_popup_title')).toBeInTheDocument()
    // Check for button
    expect(screen.getByText('ext_popup_open_settings')).toBeInTheDocument()
    // Check for privacy link
    expect(screen.getByText('ext_privacy_link_text')).toBeInTheDocument()
  })

  it('should send a message when the options button is clicked', async () => {
    render(<App />)
    const button = screen.getByText('ext_popup_open_settings')
    fireEvent.click(button)
    expect(Browser.runtime.sendMessage).toHaveBeenCalledWith({ type: 'OPEN_OPTIONS_PAGE' })
  })
})
