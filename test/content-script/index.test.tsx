import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { waitFor } from '@testing-library/preact'
import { getUserConfig, Theme } from '../../src/config'
import ChatGPTCard from '../../src/content-script/ChatGPTCard'

// Mock dependencies
vi.mock('../../src/config')
vi.mock('../../src/utils', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../src/utils')>()
  return {
    ...original,
    detectSystemColorScheme: () => Theme.Light,
  }
})
vi.mock('../../src/content-script/ChatGPTCard', () => ({
  default: vi.fn(() => <div data-testid="chat-gpt-card" />),
}))

const mockedGetUserConfig = vi.mocked(getUserConfig)
const mockedChatGPTCard = vi.mocked(ChatGPTCard)

describe('content-script/index', () => {
  beforeEach(() => {
    // Reset mocks and DOM before each test
    vi.clearAllMocks()
    document.body.innerHTML = ''
    document.head.innerHTML = ''

    // Mock user config
    mockedGetUserConfig.mockResolvedValue({
      theme: Theme.Light,
      language: 'en',
      triggerMode: 'always',
    })

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    })
  })

  afterEach(() => {
    // Reset modules to allow fresh import in each test
    vi.resetModules()
  })

  it('should mount the card on Google search page', async () => {
    // Set up the environment for Google
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { hostname: 'www.google.com' },
    })

    const input = document.createElement('input')
    input.name = 'q'
    input.value = 'test query'
    document.body.appendChild(input)

    const rcnt = document.createElement('div')
    rcnt.id = 'rcnt'
    document.body.appendChild(rcnt)

    // Dynamically import the script to execute it
    await import('../../src/content-script/index')

    // Assertions
    await waitFor(() => {
      expect(document.querySelector('.chat-gpt-container')).toBeInTheDocument()
      expect(mockedChatGPTCard).toHaveBeenCalled()
      const props = mockedChatGPTCard.mock.calls[0][0]
      expect(props.question).toBe('test query')
    })
  })

  it('should handle sidebar injection if sidebar container exists', async () => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { hostname: 'www.google.com' },
    })

    const input = document.createElement('input')
    input.name = 'q'
    input.value = 'test query'
    document.body.appendChild(input)

    const rhs = document.createElement('div')
    rhs.id = 'rhs'
    document.body.appendChild(rhs)

    await import('../../src/content-script/index')

    await waitFor(() => {
      expect(rhs.querySelector('.chat-gpt-container')).toBeInTheDocument()
    })
  })
})
