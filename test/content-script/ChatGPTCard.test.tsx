import { render, screen, fireEvent } from '@testing-library/preact'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ChatGPTCard from '../../src/content-script/ChatGPTCard'
import useSWR from 'swr'
import { ProviderConfigs, ProviderType } from '../../src/config'

// Mock useSWR
vi.mock('swr')
const mockedUseSWR = vi.mocked(useSWR)

// Mock the child component to isolate the parent
vi.mock('../../src/content-script/ChatGPTQuery', () => ({
  default: vi.fn((props) => (
    <div data-testid="chat-gpt-query">
      {props.question}-{props.activeProvider}
    </div>
  )),
}))

// Mock Browser i18n
vi.spyOn(window.browser.i18n, 'getMessage').mockImplementation((key) => key)

// Mock the logo import
vi.mock('../../src/logo.png', () => ({
  default: 'logo.png',
}))

describe('ChatGPTCard', () => {
  const mockConfigs: ProviderConfigs = {
    provider: ProviderType.ChatGPT,
    configs: {
      chatgpt: { mode: 'API', apiKey: 'test-key', model: 'gpt-4' },
      gemini: { apiKey: 'gemini-key', model: 'gemini-pro' },
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseSWR.mockReturnValue({
      data: mockConfigs,
      error: undefined,
    })
  })

  it('should render the card with tabs, logo, and the query component', async () => {
    const question = 'What is React?'

    render(<ChatGPTCard question={question} />)

    // Check for the tabs
    const chatGPTTab = screen.getByText('ChatGPT')
    const geminiTab = screen.getByText('Gemini')
    expect(chatGPTTab).toBeInTheDocument()
    expect(geminiTab).toBeInTheDocument()

    // Check for the logo
    const logo = screen.getByAltText('ChatGPT')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('src', 'logo.png')

    // Check that the mocked child component is rendered with the default provider
    const queryComponent = screen.getByTestId('chat-gpt-query')
    expect(queryComponent).toBeInTheDocument()
    expect(queryComponent.textContent).toBe('What is React?-chatgpt')

    // Click the Gemini tab and check if the prop changes
    fireEvent.click(geminiTab)
    expect(queryComponent.textContent).toBe('What is React?-gemini')
  })
})
