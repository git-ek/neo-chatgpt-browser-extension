import { describe, it, expect, beforeEach } from 'vitest'
import {
  getPossibleElementByQuerySelector,
  endsWithQuestionMark,
  isBraveBrowser,
  getErrorMessageKey,
} from '../../src/content-script/utils'

describe('content-script/utils', () => {
  describe('getPossibleElementByQuerySelector', () => {
    beforeEach(() => {
      document.body.innerHTML = ''
    })

    it('should return the first element that matches a query', () => {
      const div = document.createElement('div')
      div.id = 'findme'
      document.body.appendChild(div)
      const result = getPossibleElementByQuerySelector<HTMLDivElement>(['.not-me', '#findme'])
      expect(result).toBe(div)
    })

    it('should return undefined if no element matches', () => {
      const result = getPossibleElementByQuerySelector(['.not-me', '#also-not-me'])
      expect(result).toBeUndefined()
    })
  })

  describe('endsWithQuestionMark', () => {
    it('should return true for various question marks', () => {
      expect(endsWithQuestionMark('Hello?')).toBe(true)
      expect(endsWithQuestionMark('你好？')).toBe(true)
      expect(endsWithQuestionMark('مرحبا؟')).toBe(true)
      expect(endsWithQuestionMark('Hello⸮')).toBe(true)
    })

    it('should return false for strings not ending with a question mark', () => {
      expect(endsWithQuestionMark('Hello')).toBe(false)
      expect(endsWithQuestionMark('Hello!')).toBe(false)
    })
  })

  describe('isBraveBrowser', () => {
    it('should return true if navigator.brave.isBrave returns true', async () => {
      Object.defineProperty(navigator, 'brave', {
        value: { isBrave: () => Promise.resolve(true) },
        writable: true,
      })
      expect(await isBraveBrowser()).toBe(true)
    })

    it('should return undefined if navigator.brave is not defined', async () => {
      Object.defineProperty(navigator, 'brave', { value: undefined, writable: true })
      expect(await isBraveBrowser()).toBe(undefined)
    })
  })

  describe('getErrorMessageKey', () => {
    it('should return network error key', () => {
      expect(getErrorMessageKey('a network error occurred')).toBe('ext_error_network')
      expect(getErrorMessageKey('Failed to fetch')).toBe('ext_error_network')
    })

    it('should return model error key', () => {
      expect(getErrorMessageKey('invalid model')).toBe('ext_error_model')
    })

    it('should return apikey error key', () => {
      expect(getErrorMessageKey('Invalid API key')).toBe('ext_error_apikey')
      expect(getErrorMessageKey('you are unauthorized')).toBe('ext_error_apikey')
    })

    it('should return generic error key for other errors', () => {
      expect(getErrorMessageKey('some other error')).toBe('ext_error_generic')
    })
  })
})
