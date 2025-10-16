import { render, screen } from '@testing-library/preact'
import { describe, it, expect, vi } from 'vitest'
import OpenAIConfig from '../../src/options/OpenAIConfig'

describe('options/OpenAIConfig', () => {
  it('should render correctly with initial props', () => {
    const mockProps = {
      apiKeyBindings: {
        value: 'test-api-key',
        onChange: vi.fn(),
      },
      model: 'gpt-4',
      setModel: vi.fn(),
      dynamicModels: ['gpt-4', 'gpt-3.5-turbo'],
    }

    render(<OpenAIConfig {...mockProps} />)

    expect(screen.getByLabelText('ext_api_key_label')).toHaveValue(mockProps.apiKeyBindings.value)
    expect(screen.getByLabelText('ext_model_placeholder')).toHaveValue(mockProps.model)

    for (const model of mockProps.dynamicModels) {
      expect(screen.getByText(model)).toBeInTheDocument()
    }
  })
})
