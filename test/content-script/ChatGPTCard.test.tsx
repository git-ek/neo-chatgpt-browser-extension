import { render, screen, fireEvent, waitFor } from '@testing-library/preact'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ChatGPTCard from '../../src/content-script/ChatGPTCard'
import useSWR, { SWRResponse } from 'swr'
import { ProviderConfigs, ProviderType, UserConfig } from '../../src/config'

// Mock useSWR
vi.mock('swr')
const mockedUseSWR = vi.mocked(useSWR)

// Mock the child component to isolate the parent
vi.mock('../../src/content-script/ChatGPTQuery', () => ({
  default: () => <div data-testid="ChatGPTQuery" />,
}))
vi.mock('../options/components/ConfigPanel', () => ({
  ConfigPanel: () => <div data-testid="ConfigPanel" />,
}))
vi.mock('../../src/content-script/ChatGPTFeedback', () => ({
  default: () => <div data-testid="ChatGPTFeedback" />,
}))

vi.mock('@primer/octicons-react', () => ({
  GearIcon: () => <div data-testid="gear-icon" />,
}))

// Mock the logo import
vi.mock('../../src/logo.png', () => ({
  default: 'logo.png',
}))

// Mock ResizeObserver
const mockResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
vi.stubGlobal('ResizeObserver', mockResizeObserver)

describe('ChatGPTCard', () => {
  const mockProviderConfigs: ProviderConfigs = {
    provider: ProviderType.ChatGPT,
    configs: {
      chatgpt: { mode: 'API', apiKey: 'test-key', model: 'gpt-4' },
      gemini: { apiKey: 'gemini-key', model: 'gemini-pro' },
    },
    userConfig: { cardWidth: 500 },
  }
  const mockUserConfig: UserConfig = {
    theme: 'light',
    language: 'en',
    triggerMode: 'always',
    cardWidth: 500,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseSWR.mockImplementation((key) => {
      if (key === 'provider-configs') {
        return { data: mockProviderConfigs, error: undefined } as SWRResponse<ProviderConfigs>
      }
      if (key === 'user-config') {
        return { data: mockUserConfig, error: undefined } as SWRResponse<UserConfig>
      }
      if (Array.isArray(key) && key[0] === 'models') {
        // This hook depends on providerConfigs. If the key is generated (i.e., not null),
        // it means providerConfigs is available, so we should return model data.
        const models = key[1] === ProviderType.ChatGPT ? ['gpt-4', 'gpt-3.5-turbo'] : ['gemini-pro']
        return { data: models, error: undefined } as SWRResponse<string[]>
      }
      return { data: undefined, error: undefined } as SWRResponse
    })
  })

  it('should render the card with settings, tabs, and the query component', async () => {
    const question = 'What is React?'

    render(<ChatGPTCard question={question} />)

    // Check for the tabs
    const chatGPTTab = screen.getByText('ChatGPT')
    const geminiTab = screen.getByText('Gemini')
    expect(chatGPTTab).toBeInTheDocument()
    expect(geminiTab).toBeInTheDocument()

    // Check for the settings icon
    const gearIcon = screen.getByTestId('gear-icon')
    expect(gearIcon).toBeInTheDocument()

    // Check that ChatGPTQuery is rendered by default
    await waitFor(() => {
      expect(screen.getByTestId('ChatGPTQuery')).toBeInTheDocument()
    })

    // Click settings icon and check that ConfigPanel is rendered
    fireEvent.click(gearIcon.parentElement!)

    await waitFor(() => {
      expect(screen.queryByTestId('ChatGPTQuery')).not.toBeInTheDocument()
      expect(screen.getByTestId('ConfigPanel')).toBeInTheDocument()
    })
  })
})
