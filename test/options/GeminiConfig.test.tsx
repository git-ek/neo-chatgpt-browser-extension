import { render, screen } from '@testing-library/preact'
import { describe, it, expect, vi } from 'vitest'
import GeminiConfig from '../../src/options/GeminiConfig'

describe('options/GeminiConfig', () => {
  it('should render correctly with initial props', () => {
    const mockProps = {
      apiKeyBindings: {
        value: 'test-api-key',
        onChange: vi.fn(),
      },
      model: 'gemini-pro',
      setModel: vi.fn(),
      dynamicModels: ['gemini-pro', 'gemini-1.5-pro-latest'],
    }

    render(<GeminiConfig {...mockProps} />)

    // Check if input and select have the correct initial values
    expect(screen.getByLabelText('ext_api_key_label')).toHaveValue(mockProps.apiKeyBindings.value)
    expect(screen.getByLabelText('ext_model_placeholder')).toHaveValue(mockProps.model)

    // Check if all models are rendered as options
    for (const model of mockProps.dynamicModels) {
      expect(screen.getByText(model)).toBeInTheDocument()
    }
  })
})
