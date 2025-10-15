import '@testing-library/jest-dom'
import { vi } from 'vitest'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const messagesPath = path.resolve(__dirname, '../src/_locales/en/messages.json')
const messages = JSON.parse(fs.readFileSync(messagesPath, 'utf-8'))

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
        getMessage: vi.fn((key) => messages[key]?.message || key),
      },
      tabs: {
        query: vi.fn(() => Promise.resolve([])),
        create: vi.fn(() => Promise.resolve({})),
      },
    },
  }
})
