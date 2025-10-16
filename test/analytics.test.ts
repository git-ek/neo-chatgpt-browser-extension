import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { captureEvent } from '../src/analytics'

describe('Analytics', () => {
  let consoleLogSpy: vi.SpyInstance

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    // Mock window.dataLayer
    global.window = Object.create(window)
    Object.defineProperty(window, 'dataLayer', {
      value: [],
      writable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should log event to console', () => {
    captureEvent('test_event', { foo: 'bar' })
    expect(consoleLogSpy).toHaveBeenCalledWith('[Analytics]', 'test_event', { foo: 'bar' })
  })

  it('should push event to dataLayer if it exists', () => {
    const pushSpy = vi.spyOn(window.dataLayer, 'push')
    captureEvent('test_event_2', { baz: 'qux' })
    expect(pushSpy).toHaveBeenCalledWith({ event: 'test_event_2', baz: 'qux' })
  })

  it('should not throw if dataLayer does not exist', () => {
    Object.defineProperty(window, 'dataLayer', {
      value: undefined,
      writable: true,
    })
    captureEvent('test_event_3')
    expect(consoleLogSpy).toHaveBeenCalledWith('[Analytics]', 'test_event_3', undefined)
  })
})
