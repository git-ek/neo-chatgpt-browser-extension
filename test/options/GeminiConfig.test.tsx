import { render, screen, fireEvent } from '@testing-library/preact'
import { describe, it, expect, vi } from 'vitest'
import GeminiConfig from '../../src/options/GeminiConfig'

vi.mock('@geist-ui/core', async (importOriginal) => {
  const original = await importOriginal<typeof import('@geist-ui/core')>()
  const MockSelect = (props) => (
    <select
      data-testid="select"
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
    >
      {props.children}
    </select>
  )
  MockSelect.Option = (props) => <option value={props.value}>{props.children}</option>
  return {
    ...original,
    Select: MockSelect,
    Input: (props) => <input data-testid="input" value={props.value} onChange={props.onChange} />,
  }
})

describe('options/GeminiConfig', () => {
  const mockApiKeyBindings = {
    value: 'test-api-key',
    onChange: vi.fn(),
  }
  const mockSetModel = vi.fn()
  const mockDynamicModels = ['gemini-pro', 'gemini-1.5-pro-latest']

  const mockProps = {
    apiKeyBindings: mockApiKeyBindings,
    model: 'gemini-pro',
    setModel: mockSetModel,
    dynamicModels: mockDynamicModels,
  }

  it('should render correctly with initial props', () => {
    render(<GeminiConfig {...mockProps} />)

    // Check if input and select have the correct initial values
    expect(screen.getByTestId('input')).toHaveValue(mockProps.apiKeyBindings.value)
    expect(screen.getByTestId('select')).toHaveValue(mockProps.model)

    // Check if all models are rendered as options
    for (const model of mockDynamicModels) {
      expect(screen.getByText(model)).toBeInTheDocument()
    }
  })

  it('should call setModel when a new model is selected', () => {
    render(<GeminiConfig {...mockProps} />)
    const select = screen.getByTestId('select')

    fireEvent.change(select, { target: { value: 'gemini-1.5-pro-latest' } })

    expect(mockSetModel).toHaveBeenCalledWith('gemini-1.5-pro-latest')
  })

  it.skip('should call onChange when the api key input is changed', () => {
    render(<GeminiConfig {...mockProps} />)
    const input = screen.getByTestId('input')

    fireEvent.change(input, { target: { value: 'new-key' } })

    expect(mockApiKeyBindings.onChange).toHaveBeenCalled()
  })
})
