import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import Browser from 'webextension-polyfill'
import { ProviderFactory } from '../../src/background/providers/factory'
import { Provider } from '../../src/background/types'
import { sendMessageFeedback, getChatGPTAccessToken } from '../../src/background/providers/chatgpt'

// Mock dependencies
vi.mock('../../src/config')
vi.mock('../../src/background/providers/factory')
vi.mock('../../src/background/providers/chatgpt')

const mockedProviderFactory = vi.mocked(ProviderFactory)
const mockedSendMessageFeedback = vi.mocked(sendMessageFeedback)
const mockedGetChatGPTAccessToken = vi.mocked(getChatGPTAccessToken)

const mockProvider = {
  generateAnswer: vi.fn().mockResolvedValue({ cleanup: vi.fn() }),
}

describe('background/index', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    // Dynamically import the background script to execute it and attach listeners
    await import('../../src/background/index')
  })

  afterEach(() => {
    vi.resetModules()
  })

  describe('onConnect', () => {
    const mockPort = {
      onMessage: {
        addListener: vi.fn(),
      },
      onDisconnect: {
        addListener: vi.fn(),
      },
      postMessage: vi.fn(),
    }

    beforeEach(async () => {
      // Mock the implementation of addListener to immediately call the listener with the mock port
      ;(Browser.runtime.onConnect.addListener as vi.Mock).mockImplementation((callback) => {
        callback(mockPort)
      })
      // Re-import to re-attach listeners with the new mock implementation
      vi.resetModules()
      await import('../../src/background/index')
      mockedProviderFactory.create.mockResolvedValue(mockProvider as Provider)
    })

    it('should handle connection and generate answer', async () => {
      const onMessageListener = mockPort.onMessage.addListener.mock.calls[0][0]
      const message = { question: 'test question' }
      await onMessageListener(message)

      expect(mockedProviderFactory.create).toHaveBeenCalled()
      expect(mockProvider.generateAnswer).toHaveBeenCalled()

      const onEvent = mockProvider.generateAnswer.mock.calls[0][0].onEvent
      onEvent({ type: 'done' })
      expect(mockPort.postMessage).toHaveBeenCalledWith({ event: 'DONE' })

      const eventData = { data: 'streaming data' }
      onEvent({ type: 'data', data: eventData })
      expect(mockPort.postMessage).toHaveBeenCalledWith(eventData)
    })

    it('should handle errors during answer generation', async () => {
      const onMessageListener = mockPort.onMessage.addListener.mock.calls[0][0]
      const errorMessage = 'Test error'
      mockProvider.generateAnswer.mockRejectedValue(new Error(errorMessage))

      const message = { question: 'test question' }
      await onMessageListener(message)

      expect(mockPort.postMessage).toHaveBeenCalledWith({ error: errorMessage })
    })
  })

  describe('onMessage', () => {
    let onMessageListener

    beforeEach(() => {
      onMessageListener = (Browser.runtime.onMessage.addListener as vi.Mock).mock.calls[0][0]
    })

    it('should handle FEEDBACK message', async () => {
      mockedGetChatGPTAccessToken.mockResolvedValue('test-token')
      const feedbackData = { rating: 'thumbsUp' }
      await onMessageListener({ type: 'FEEDBACK', data: feedbackData })
      expect(mockedGetChatGPTAccessToken).toHaveBeenCalled()
      expect(mockedSendMessageFeedback).toHaveBeenCalledWith('test-token', feedbackData)
    })

    it('should handle OPEN_OPTIONS_PAGE message', async () => {
      await onMessageListener({ type: 'OPEN_OPTIONS_PAGE' })
      expect(Browser.runtime.openOptionsPage).toHaveBeenCalled()
    })

    it('should handle GET_ACCESS_TOKEN message', async () => {
      mockedGetChatGPTAccessToken.mockResolvedValue('test-token-2')
      const token = await onMessageListener({ type: 'GET_ACCESS_TOKEN' })
      expect(mockedGetChatGPTAccessToken).toHaveBeenCalled()
      expect(token).toBe('test-token-2')
    })
  })

  describe('onInstalled', () => {
    let onInstalledListener

    beforeEach(() => {
      onInstalledListener = (Browser.runtime.onInstalled.addListener as vi.Mock).mock.calls[0][0]
    })

    it('should open options page on install', () => {
      onInstalledListener({ reason: 'install' })
      expect(Browser.runtime.openOptionsPage).toHaveBeenCalled()
    })

    it('should not open options page on update', () => {
      onInstalledListener({ reason: 'update' })
      expect(Browser.runtime.openOptionsPage).not.toHaveBeenCalled()
    })
  })
})
