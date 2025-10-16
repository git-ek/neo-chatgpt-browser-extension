import { render, screen } from '@testing-library/preact'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GeistProvider, CssBaseline } from '@geist-ui/core'
import ProviderSelect from '../../src/options/ProviderSelect'
import useSWR from 'swr'

// Mock dependencies
vi.mock('swr')
vi.mock('../../src/config')
vi.mock('@geist-ui/core', async (importOriginal) => {
  const original = await importOriginal<typeof import('@geist-ui/core')>()
  return {
    ...original,
    useToasts: () => ({ setToast: vi.fn() }),
    Spinner: () => <div role="status">Loading...</div>,
  }
})

const mockedUseSWR = vi.mocked(useSWR)

describe('ProviderSelect', () => {
  beforeEach(() => {
    mockedUseSWR.mockClear()
  })

  it.skip('should display an error message if fetching fails', () => {
    mockedUseSWR.mockReturnValue({
      data: undefined,
      error: new Error('Failed to load'),
    })

    render(
      <GeistProvider>
        <CssBaseline />
        <ProviderSelect />
      </GeistProvider>,
    )

    expect(screen.getByText(/ext_toast_failed_to_load_configs/)).toBeInTheDocument()
    expect(screen.getByText(/Failed to load/)).toBeInTheDocument()
  })

  it.skip('should display a spinner while loading', () => {
    mockedUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
    })

    render(
      <GeistProvider>
        <CssBaseline />
        <ProviderSelect />
      </GeistProvider>,
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText(/Loading.../)).toBeInTheDocument()
  })
})
