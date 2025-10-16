import { render, screen, act, waitFor } from '@testing-library/preact'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ChatGPTQuery from '../../src/content-script/ChatGPTQuery'
import { ProviderType, ChatGPTMode, ProviderConfigs } from '../../src/config'
import useSWR from 'swr'
import Browser from 'webextension-polyfill'

// --- Mocks ---

// Mock SWR
vi.mock('swr')
const mockedUseSWR = vi.mocked(useSWR)

// Mock child components and external libraries
vi.mock('react-markdown', () => ({
  default: (props) => <div data-testid="markdown">{props.children}</div>,
}))

vi.mock('@primer/octicons-react', () => ({
  GearIcon: () => <div data-testid="gear-icon" />,
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
  })

  it('should render loading text while configs are loading', () => {
    mockedUseSWR.mockReturnValue({ data: undefined, error: undefined })
    render(
      <ChatGPTQuery
        question="test"
        activeProvider={ProviderType.ChatGPT}
        onAnswer={vi.fn()}
        onOpenSettings={vi.fn()}
      />,
    )
    expect(screen.getByText('ext_waiting_for_response')).toBeInTheDocument()
  })

  it('should render error message if config loading fails', () => {
    mockedUseSWR.mockReturnValue({ data: undefined, error: new Error('Failed to load') })
    render(
      <ChatGPTQuery
        question="test"
        activeProvider={ProviderType.ChatGPT}
        onAnswer={vi.fn()}
        onOpenSettings={vi.fn()}
      />,
    )
    expect(screen.getByText('ext_error_load_settings')).toBeInTheDocument()
  })

  it('should show waiting message initially', async () => {
    render(
      <ChatGPTQuery
        question="test"
        activeProvider={ProviderType.ChatGPT}
        onAnswer={vi.fn()}
        onOpenSettings={vi.fn()}
      />,
    )
    expect(await screen.findByText('ext_waiting_for_response')).toBeInTheDocument()
  })

  it('should render the answer when received', async () => {
    const onAnswer = vi.fn()
    render(
      <ChatGPTQuery
        question="test"
        activeProvider={ProviderType.ChatGPT}
        onAnswer={onAnswer}
        onOpenSettings={vi.fn()}
      />,
    )
    const answer = { text: 'This is the answer', messageId: '1', conversationId: '1' }

    await waitFor(() => expect(mockPort.onMessage.addListener).toHaveBeenCalled())

    act(() => {
      mockPort.onMessage.addListener.mock.calls[0][0](answer)
    })

    const markdown = await screen.findByTestId('markdown')
    expect(markdown.textContent).toBe(answer.text)
    expect(onAnswer).toHaveBeenCalledWith(answer)
  })

  it('should render error message when an error is received', async () => {
    const onAnswer = vi.fn()
    render(
      <ChatGPTQuery
        question="test"
        activeProvider={ProviderType.ChatGPT}
        onAnswer={onAnswer}
        onOpenSettings={vi.fn()}
      />,
    )
    const error = { error: 'UNAUTHORIZED' }

    await waitFor(() => expect(mockPort.onMessage.addListener).toHaveBeenCalled())

    act(() => {
      mockPort.onMessage.addListener.mock.calls[0][0](error)
    })

    expect(await screen.findByText('ext_error_prefix')).toBeInTheDocument()
    expect(await screen.findByText('UNAUTHORIZED')).toBeInTheDocument()
    expect(onAnswer).toHaveBeenCalledWith(null)
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
    render(
      <ChatGPTQuery
        question="test"
        activeProvider={ProviderType.ChatGPT}
        onAnswer={vi.fn()}
        onOpenSettings={vi.fn()}
      />,
    )
    expect(await screen.findByText(/ext_apikey_not_set/)).toBeInTheDocument()
    expect(await screen.findByText('ext_apikey_link_to_options')).toBeInTheDocument()
  })
})
