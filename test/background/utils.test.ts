import { describe, it, expect, vi } from 'vitest'
import { handleProviderError } from '../../src/background/utils'

describe('background/utils', () => {
  describe('handleProviderError', () => {
    it('should call onEvent with error message from Error object', () => {
      const onEvent = vi.fn()
      const error = new Error('Test error message')
      handleProviderError(onEvent, error)
      expect(onEvent).toHaveBeenCalledWith({
        type: 'error',
        data: { error: 'Test error message' },
      })
    })

    it('should call onEvent with error message from string', () => {
      const onEvent = vi.fn()
      const error = 'A simple string error'
      handleProviderError(onEvent, error)
      expect(onEvent).toHaveBeenCalledWith({
        type: 'error',
        data: { error: 'A simple string error' },
      })
    })

    it('should call onEvent with error message from an object', () => {
      const onEvent = vi.fn()
      const error = { info: 'Some error info' }
      handleProviderError(onEvent, error)
      expect(onEvent).toHaveBeenCalledWith({
        type: 'error',
        data: { error: '[object Object]' },
      })
    })
  })
})
