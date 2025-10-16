import 'preact/compat'
import 'preact'
import 'preact/hooks'
import 'preact/debug'
import { vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

vi.mock('webextension-polyfill', () => {
  return {
    default: {
      runtime: {
        getURL: (path: string) => path,
        getManifest: () => ({ manifest_version: 3 }),
        onMessage: {
          addListener: vi.fn(),
          removeListener: vi.fn(),
          hasListener: vi.fn(() => true),
        },
        sendMessage: vi.fn(() => Promise.resolve()),
        connect: vi.fn(),
        onConnect: {
          addListener: vi.fn(),
        },
        onInstalled: {
          addListener: vi.fn(),
        },
        openOptionsPage: vi.fn(),
      },
      storage: {
        local: {
          get: vi.fn(() => Promise.resolve({})),
          set: vi.fn(() => Promise.resolve()),
          remove: vi.fn(() => Promise.resolve()),
          onChanged: {
            addListener: vi.fn(),
            removeListener: vi.fn(),
            hasListener: vi.fn(() => true),
          },
        },
      },
      i18n: {
        getMessage: vi.fn((key) => key),
      },
      tabs: {
        query: vi.fn(() => Promise.resolve([])),
        create: vi.fn(() => Promise.resolve({})),
      },
    },
  }
})
