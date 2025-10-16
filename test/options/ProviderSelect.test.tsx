import { render, screen } from '@testing-library/preact'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SWRResponse } from 'swr'
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
vi.mock('../../src/options/components/ConfigPanel')

const mockedUseSWR = vi.mocked(useSWR)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockedGetProviderConfigs = vi.mocked(getProviderConfigs)
const mockedSaveProviderConfigs = vi.mocked(saveProviderConfigs)

describe('options/ProviderSelect', () => {
  const mockProviderConfig: ProviderConfigs = {
    provider: ProviderType.ChatGPT,
    configs: {
      chatgpt: { mode: ChatGPTMode.Webapp, model: 'gpt-4', apiKey: '' },
      gemini: { model: 'gemini-pro', apiKey: '' },
    },
  }
  const mockModels = ['gpt-4', 'gpt-3.5-turbo']

  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseSWR.mockImplementation((key) => {
      if (key === 'provider-configs') {
        return { data: mockProviderConfig, error: undefined } as SWRResponse<ProviderConfigs>
      }
      if (Array.isArray(key) && key[0] === 'models') {
        return { data: mockModels, error: undefined } as SWRResponse<string[]>
      }
      return { data: undefined, error: undefined } as SWRResponse
    })
    mockedSaveProviderConfigs.mockResolvedValue()
  })

  it('should display a loading message initially', () => {
    mockedUseSWR.mockReturnValue({ data: undefined, error: undefined })
    render(<ProviderSelect />)
    expect(screen.getByRole('status')).toHaveTextContent('ext_waiting_for_response')
  })

  it('should display an error message if fetching fails', () => {
    mockedUseSWR.mockReturnValue({ data: undefined, error: new Error('Failed to load') })
    render(<ProviderSelect />)
    expect(screen.getByText(/ext_toast_failed_to_load_configs/)).toBeInTheDocument()
    expect(screen.getByText(/Failed to load/)).toBeInTheDocument()
  })
})
