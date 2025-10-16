import { describe, it, expect, vi } from 'vitest'
import { detectSystemColorScheme, getExtensionVersion } from '../src/utils'
import { Theme } from '../src/config'
import Browser from 'webextension-polyfill'

describe('utils', () => {
  describe('detectSystemColorScheme', () => {
    it('should return dark mode when media matches', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: true,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })
      expect(detectSystemColorScheme()).toBe(Theme.Dark)
    })

    it('should return light mode when media does not match', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })
      expect(detectSystemColorScheme()).toBe(Theme.Light)
    })
  })

  describe('getExtensionVersion', () => {
    it('should return the extension version from manifest', () => {
      const manifest = {
        manifest_version: 3,
        name: 'test',
        version: '0.1.0',
      }
      vi.spyOn(Browser.runtime, 'getManifest').mockReturnValue(manifest)
      expect(getExtensionVersion()).toBe('0.1.0')
    })
  })
})
