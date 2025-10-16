import { describe, it, expect, vi, afterEach } from 'vitest'
import { config } from '../../src/content-script/search-engine-configs'

describe('search-engine-configs', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('should have valid config structure for all search engines', () => {
    const searchEngines = Object.keys(config)
    expect(searchEngines.length).toBeGreaterThan(0)

    for (const engine of searchEngines) {
      const engineConfig = config[engine]
      expect(engineConfig).toBeDefined()
      expect(Array.isArray(engineConfig.inputQuery)).toBe(true)
      expect(Array.isArray(engineConfig.sidebarContainerQuery)).toBe(true)
      expect(Array.isArray(engineConfig.appendContainerQuery)).toBe(true)
    }
  })

  describe('baidu watchRouteChange', () => {
    it('should call callback when container is added to the DOM', () => {
      return new Promise((resolve) => {
        const wrapper = document.createElement('div')
        wrapper.id = 'wrapper_wrapper'
        document.body.appendChild(wrapper)

        const callback = vi.fn(() => {
          expect(callback).toHaveBeenCalled()
          resolve()
        })

        config.baidu.watchRouteChange(callback)

        // Simulate the DOM change that the observer is waiting for
        const container = document.createElement('div')
        container.id = 'container'
        wrapper.appendChild(container)
      })
    })
  })
})
