import { render, screen, act, waitFor } from '@testing-library/preact'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ChatGPTQuery from '../../src/content-script/ChatGPTQuery'
import { ProviderType, ChatGPTMode, ProviderConfigs } from '../../src/config'
import useSWR from 'swr'
import Browser from 'webextension-polyfill'
import ChatGPTFeedback from '../../src/content-script/ChatGPTFeedback'

// --- Mocks ---

// Mock SWR
vi.mock('swr')
const mockedUseSWR = vi.mocked(useSWR)

// Mock child components and external libraries
vi.mock('react-markdown', () => ({
  default: (props) => <div data-testid="markdown">{props.children}</div>,
}))
vi.mock('../../src/content-script/ChatGPTFeedback')
const mockedChatGPTFeedback = vi.mocked(ChatGPTFeedback)

vi.mock('@geist-ui/core', async (importOriginal) => {
  const original = await importOriginal<typeof import('@geist-ui/core')>()
  const MockTabs = (props) => <div data-testid="tabs">{props.children}</div>
  MockTabs.Item = (props) => <div data-testid={`tab-${props.value}`}>{props.label}</div>
  return {
    ...original,
    Spinner: () => <div data-testid="spinner" />,
    Tabs: MockTabs,
  }
})
vi.mock('@primer/octicons-react', () => ({
  GearIcon: () => <div data-testid="gear-icon" />,
  ThumbsupIcon: () => <div />,
  ThumbsdownIcon: () => <div />,
  CopyIcon: () => <div />,
  CheckIcon: () => <div />,
}))

// Mock Browser.runtime.connect
const mockPort = {
  onMessage: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
  },
  postMessage: vi.fn(),
  disconnect: vi.fn(),
}
vi.spyOn(Browser.runtime, 'connect').mockReturnValue(mockPort as unknown as Browser.Runtime.Port)

describe('ChatGPTQuery', () => {
  const mockConfigs: ProviderConfigs = {
    provider: ProviderType.ChatGPT,
    configs: {
      chatgpt: { mode: ChatGPTMode.API, apiKey: 'test-key', model: 'gpt-4' },
      gemini: { apiKey: 'gemini-key', model: 'gemini-pro' },
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseSWR.mockReturnValue({
      data: mockConfigs,
      error: undefined,
    })
    mockedChatGPTFeedback.mockReturnValue(<div data-testid="feedback" />)
  })

  it('should render loading spinner while configs are loading', () => {
    mockedUseSWR.mockReturnValue({ data: undefined, error: undefined })
    render(<ChatGPTQuery question="test" />)
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('should render error message if config loading fails', () => {
    mockedUseSWR.mockReturnValue({ data: undefined, error: new Error('Failed to load') })
    render(<ChatGPTQuery question="test" />)
    expect(screen.getByText('ext_error_load_settings')).toBeInTheDocument()
  })

  it('should show waiting message initially', async () => {
    render(<ChatGPTQuery question="test" />)
    expect(await screen.findByText('ext_waiting_for_response')).toBeInTheDocument()
  })

  it('should render the answer when received', async () => {
    render(<ChatGPTQuery question="test" />)
    const answer = { text: 'This is the answer', messageId: '1', conversationId: '1' }

    await waitFor(() => expect(mockPort.onMessage.addListener).toHaveBeenCalled())

    act(() => {
      mockPort.onMessage.addListener.mock.calls[0][0](answer)
    })

    const markdown = await screen.findByTestId('markdown')
    expect(markdown.textContent).toBe(answer.text)
    expect(screen.getByTestId('feedback')).toBeInTheDocument()
  })

  it('should render error message when an error is received', async () => {
    render(<ChatGPTQuery question="test" />)
    const error = { error: 'UNAUTHORIZED' }

    await waitFor(() => expect(mockPort.onMessage.addListener).toHaveBeenCalled())

    act(() => {
      mockPort.onMessage.addListener.mock.calls[0][0](error)
    })

    expect(await screen.findByText('ext_error_prefix')).toBeInTheDocument()
    expect(await screen.findByText('UNAUTHORIZED')).toBeInTheDocument()
  })

  it('should show API key missing message if key is not set', async () => {
    mockedUseSWR.mockReturnValue({
      data: {
        ...mockConfigs,
        configs: {
          ...mockConfigs.configs,
          chatgpt: { ...mockConfigs.configs.chatgpt, apiKey: '' },
        },
      },
      error: undefined,
    })
    render(<ChatGPTQuery question="test" />)
    expect(await screen.findByText(/ext_apikey_not_set/)).toBeInTheDocument()
    expect(await screen.findByText('ext_apikey_link_to_options')).toBeInTheDocument()
  })
})
