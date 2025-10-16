import { render, screen, fireEvent } from '@testing-library/preact'
import { describe, it, expect, vi } from 'vitest'
import OpenAIConfig from '../../src/options/OpenAIConfig'

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
    Input: (props) => <input data-testid="input" {...props} />,
  }
})

describe('options/OpenAIConfig', () => {
  const mockApiKeyBindings = {
    value: 'test-api-key',
    onChange: vi.fn(),
  }
  const mockSetModel = vi.fn()
  const mockDynamicModels = ['gpt-4', 'gpt-3.5-turbo']

  const mockProps = {
    apiKeyBindings: mockApiKeyBindings,
    model: 'gpt-4',
    setModel: mockSetModel,
    dynamicModels: mockDynamicModels,
  }

  it('should render correctly with initial props', () => {
    render(<OpenAIConfig {...mockProps} />)

    expect(screen.getByTestId('input')).toHaveValue(mockProps.apiKeyBindings.value)
    expect(screen.getByTestId('select')).toHaveValue(mockProps.model)

    for (const model of mockDynamicModels) {
      expect(screen.getByText(model)).toBeInTheDocument()
    }
  })

  it('should call setModel when a new model is selected', () => {
    render(<OpenAIConfig {...mockProps} />)
    const select = screen.getByTestId('select')

    fireEvent.change(select, { target: { value: 'gpt-3.5-turbo' } })

    expect(mockSetModel).toHaveBeenCalledWith('gpt-3.5-turbo')
  })

  it.skip('should call onChange when the api key input is changed', () => {
    render(<OpenAIConfig {...mockProps} />)
    const input = screen.getByTestId('input')

    fireEvent.change(input, { target: { value: 'new-key' } })

    expect(mockApiKeyBindings.onChange).toHaveBeenCalled()
  })
})
