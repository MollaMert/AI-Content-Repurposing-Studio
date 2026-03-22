import { describe, it, expect, vi } from 'vitest'
import { analyzeContent } from '../agents/analyst'
import { critiqueContent } from '../agents/critic'
import { generatePlatformContent } from '../agents/tailor'
import type { AIClient } from '../lib/ai-client'
import type { AnalysisResult } from '../agents/analyst'

const createMockClient = (response: string): AIClient => ({
  chat: vi.fn().mockResolvedValue(response),
  listModels: vi.fn(),
  generateImage: vi.fn()
})

const createMockAnalysis = (): AnalysisResult => ({
  hook: 'Test hook',
  keywords: ['kw1', 'kw2', 'kw3', 'kw4', 'kw5'],
  coreMessage: 'Test core message',
  targetAudience: 'Developers',
  useCases: ['Web dev', 'Testing']
})

describe('Agent Exports', () => {
  it('analyst exports analyzeContent function', async () => {
    const mockClient = createMockClient(JSON.stringify(createMockAnalysis()))

    const result = await analyzeContent('test content', mockClient)
    expect(result).toHaveProperty('hook')
    expect(result).toHaveProperty('keywords')
    expect(result).toHaveProperty('coreMessage')
  })

  it('critic exports critiqueContent function', async () => {
    const mockClient = createMockClient(JSON.stringify({
      gaps: ['Gap1', 'Gap2', 'Gap3'],
      questions: ['Question1', 'Question2']
    }))

    const analysis = createMockAnalysis()

    const result = await critiqueContent('content', analysis, mockClient)
    expect(result).toHaveProperty('gaps')
    expect(result).toHaveProperty('questions')
  })

  it('tailor exports generatePlatformContent function', async () => {
    const mockClient = createMockClient('Generated content')

    const analysis = createMockAnalysis()

    const result = await generatePlatformContent('twitter', 'content', analysis, mockClient)
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })
})
