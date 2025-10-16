import { render, screen, fireEvent, waitFor } from '@testing-library/preact'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ProviderSelect from '../../src/options/ProviderSelect'
import useSWR from 'swr'
import {
  getProviderConfigs,
  saveProviderConfigs,
  ProviderType,
  ChatGPTMode,
  ProviderConfigs,
} from '../../src/config'

// --- Mocks ---
vi.mock('swr')
vi.mock('../../src/config')
vi.mock('../../src/options/OpenAIConfig', () => ({
  // Mock the component to check if it receives props correctly
  default: (props: { apiKeyBindings: { value: string; onChange: (e: any) => void } }) => (
    <div data-testid="openai-config">
      <input
        data-testid="openai-key-input"
        value={props.apiKeyBindings.value}
        onChange={props.apiKeyBindings.onChange}
      />
    </div>
  ),
}))
vi.mock('../../src/options/GeminiConfig', () => ({
  default: () => <div data-testid="gemini-config" />,
}))

const mockedUseSWR = vi.mocked(useSWR)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockedGetProviderConfigs = vi.mocked(getProviderConfigs)
const mockedSaveProviderConfigs = vi.mocked(saveProviderConfigs)

describe('options/ProviderSelect', () => {
  const mockConfig: ProviderConfigs = {
    provider: ProviderType.ChatGPT,
    configs: {
      chatgpt: { mode: ChatGPTMode.Webapp, model: 'gpt-4', apiKey: '' },
      gemini: { model: 'gemini-pro', apiKey: '' },
    },
  }
  const mockModels = ['gpt-4', 'gpt-3.5-turbo']

  beforeEach(() => {
    vi.clearAllMocks()
    // Set a default successful return value for SWR
    mockedUseSWR.mockReturnValue({
      data: { config: mockConfig, models: mockModels },
      error: undefined,
    })
    mockedSaveProviderConfigs.mockResolvedValue()
  })

  it('should display a loading message initially', () => {
    mockedUseSWR.mockReturnValue({ data: undefined, error: undefined })
    render(<ProviderSelect />)
    expect(screen.getByRole('status')).toHaveTextContent('Loading...')
  })

  it('should display an error message if fetching fails', () => {
    mockedUseSWR.mockReturnValue({ data: undefined, error: new Error('Failed to load') })
    render(<ProviderSelect />)
    expect(screen.getByText(/ext_toast_failed_to_load_configs/)).toBeInTheDocument()
    expect(screen.getByText(/Failed to load/)).toBeInTheDocument()
  })

  it('should render OpenAIConfig when API mode is selected', async () => {
    render(<ProviderSelect />)
    // OpenAIConfig is not visible in default 'Webapp' mode
    expect(screen.queryByTestId('openai-config')).not.toBeInTheDocument()

    // Switch to API mode
    const apiRadio = screen.getByLabelText('ext_chatgpt_mode_api')
    fireEvent.click(apiRadio)

    await waitFor(() => {
      expect(screen.getByTestId('openai-config')).toBeInTheDocument()
    })
  })

  it('should switch tabs and show the correct config panel', async () => {
    render(<ProviderSelect />)

    // Initially in Webapp mode, OpenAIConfig is not visible
    expect(screen.queryByTestId('openai-config')).not.toBeInTheDocument()

    // Click Gemini tab
    fireEvent.click(screen.getByText('Gemini'))

    // Should now show Gemini config
    await waitFor(() => {
      expect(screen.queryByTestId('openai-config')).not.toBeInTheDocument()
      expect(screen.getByTestId('gemini-config')).toBeInTheDocument()
    })

    // Switch back to ChatGPT
    fireEvent.click(screen.getByText('ChatGPT'))
    await waitFor(() => {
      expect(screen.queryByTestId('gemini-config')).not.toBeInTheDocument()
    })
  })

  it('should save updated API key when changed and saved', async () => {
    render(<ProviderSelect />)

    // Switch to API mode to make the input visible
    const apiRadio = screen.getByLabelText('ext_chatgpt_mode_api')
    fireEvent.click(apiRadio)

    // Find the input and change its value
    const apiKeyInput = await screen.findByTestId('openai-key-input')
    fireEvent.change(apiKeyInput, { target: { value: 'new-api-key' } })

    // Click save
    fireEvent.click(screen.getByText('ext_save_button'))

    await waitFor(() => {
      expect(mockedSaveProviderConfigs).toHaveBeenCalledTimes(1)
      const savedConfig = mockedSaveProviderConfigs.mock.calls[0][0]
      expect(savedConfig.configs.chatgpt.apiKey).toBe('new-api-key')
      expect(screen.getByText('ext_toast_changes_saved')).toBeInTheDocument()
    })
  })

  it('should show an error toast if API key is missing on save', async () => {
    render(<ProviderSelect />)

    // Switch to API mode
    const apiRadio = screen.getByLabelText('ext_chatgpt_mode_api')
    fireEvent.click(apiRadio)

    // Ensure input is empty
    const apiKeyInput = await screen.findByTestId('openai-key-input')
    fireEvent.change(apiKeyInput, { target: { value: '' } })

    // Click save button
    fireEvent.click(screen.getByText('ext_save_button'))

    await waitFor(() => {
      expect(mockedSaveProviderConfigs).not.toHaveBeenCalled()
      expect(screen.getByText('ext_toast_enter_openai_key')).toBeInTheDocument()
    })
  })
})
