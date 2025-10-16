import { render, screen } from '@testing-library/preact'
import { describe, it, expect, vi } from 'vitest'
import ChatGPTCard from '../../src/content-script/ChatGPTCard'
import { TriggerMode } from '../../src/config'

// Mock the child component to isolate the parent
vi.mock('../../src/content-script/ChatGPTQuery', () => ({
  default: vi.fn((props) => (
    <div data-testid="chat-gpt-query">
      {props.question}-{props.triggerMode}
    </div>
  )),
}))

// Mock the logo import
vi.mock('../../src/logo.png', () => ({
  default: 'logo.png',
}))

describe('ChatGPTCard', () => {
  it('should render the card with title, logo, and the query component', () => {
    const question = 'What is React?'
    const triggerMode = TriggerMode.Always

    render(<ChatGPTCard question={question} triggerMode={triggerMode} />)

    // Check for the title
    expect(screen.getByText('ext_chatgpt_answer')).toBeInTheDocument()

    // Check for the logo
    const logo = screen.getByAltText('ChatGPT')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('src', 'logo.png')

    // Check that the mocked child component is rendered with correct props
    const queryComponent = screen.getByTestId('chat-gpt-query')
    expect(queryComponent).toBeInTheDocument()
    expect(queryComponent.textContent).toBe('What is React?-always')
  })
})
