import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Settings } from '../pages/Settings'
import { SettingsProvider } from '../hooks/useSettings'

const renderWithProvider = (component: React.ReactNode) => {
  return render(<SettingsProvider>{component}</SettingsProvider>)
}

describe('Settings Page', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders settings page title', () => {
    renderWithProvider(<Settings />)
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
  })

  it('displays AI Provider section', () => {
    renderWithProvider(<Settings />)
    expect(screen.getByText('AI Provider')).toBeInTheDocument()
  })

  it('renders provider cards', () => {
    renderWithProvider(<Settings />)
    expect(screen.getByText('Groq')).toBeInTheDocument()
    expect(screen.getByText('Gemini')).toBeInTheDocument()
    expect(screen.getByText('OpenRouter')).toBeInTheDocument()
    expect(screen.getByText('DeepSeek')).toBeInTheDocument()
  })

  it('renders API configuration form', () => {
    renderWithProvider(<Settings />)
    expect(screen.getByLabelText('API Key')).toBeInTheDocument()
    expect(screen.getByLabelText('Model Name')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Save Settings/i })).toBeInTheDocument()
  })

  it('displays BYOK info section', () => {
    renderWithProvider(<Settings />)
    expect(screen.getByText(/Bring Your Own Model/i)).toBeInTheDocument()
  })
})
