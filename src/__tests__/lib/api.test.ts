/**
 * Tests for the MockApiClient.
 *
 * These tests verify that the mock implementation correctly implements
 * the IApiClient interface and can be used for testing.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { MockApiClient } from '../mocks/MockApiClient'
import type { Conversation } from '@/types'
import type { JourneyDetail } from '@/types/journey'

describe('MockApiClient', () => {
  let api: MockApiClient

  beforeEach(() => {
    api = new MockApiClient()
  })

  describe('API Key Management', () => {
    it('should start with no API key', () => {
      expect(api.getApiKey()).toBeNull()
    })

    it('should set and get API key', () => {
      api.setApiKey('test-key-123')
      expect(api.getApiKey()).toBe('test-key-123')
    })

    it('should clear API key', () => {
      api.setApiKey('test-key-123')
      api.clearApiKey()
      expect(api.getApiKey()).toBeNull()
    })

    it('should record setApiKey calls', () => {
      api.setApiKey('test-key')
      const calls = api.getCallHistory('setApiKey')
      expect(calls).toHaveLength(1)
      expect(calls[0].args).toEqual(['test-key'])
    })
  })

  describe('Chat', () => {
    it('should return mock chat response', async () => {
      const response = await api.sendMessage({
        message: 'What is BPC-157?',
      })

      expect(response).toHaveProperty('conversation_id')
      expect(response).toHaveProperty('message')
      expect(response.conversation_id).toBe('mock-conv-id')
    })

    it('should record sendMessage calls', async () => {
      await api.sendMessage({ message: 'Test message' })

      const calls = api.getCallHistory('sendMessage')
      expect(calls).toHaveLength(1)
      expect(calls[0].args[0]).toEqual({ message: 'Test message' })
    })

    it('should allow custom chat responses', async () => {
      api.setMockChatResponse({
        conversation_id: 'custom-id',
        message: 'Custom response',
        sources: [],
        disclaimers: [],
        follow_up_questions: [],
        metadata: { model: 'test', context_chunks: 0, elapsed_ms: 50 },
      })

      const response = await api.sendMessage({ message: 'test' })
      expect(response.conversation_id).toBe('custom-id')
      expect(response.message).toBe('Custom response')
    })

    it('should stream messages', async () => {
      const chunks: unknown[] = []
      await api.streamMessage({ message: 'test' }, (chunk) => {
        chunks.push(chunk)
      })

      expect(chunks.length).toBeGreaterThan(0)
      expect(chunks[0]).toHaveProperty('type')
    })
  })

  describe('Conversations', () => {
    const mockConversation: Conversation = {
      conversation_id: 'conv-1',
      title: 'Test Conversation',
      messages: [
        { role: 'user', content: 'Hello', timestamp: '2024-01-01T00:00:00Z' },
        { role: 'assistant', content: 'Hi there!', timestamp: '2024-01-01T00:01:00Z' },
      ],
      preview: 'Hello',
      message_count: 2,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    beforeEach(() => {
      api.setMockConversations([mockConversation])
    })

    it('should get conversations list', async () => {
      const conversations = await api.getConversations()

      expect(conversations).toHaveLength(1)
      expect(conversations[0].conversation_id).toBe('conv-1')
      expect(conversations[0].title).toBe('Test Conversation')
    })

    it('should get single conversation', async () => {
      const conversation = await api.getConversation('conv-1')

      expect(conversation.conversation_id).toBe('conv-1')
      expect(conversation.messages).toHaveLength(2)
    })

    it('should throw for non-existent conversation', async () => {
      await expect(api.getConversation('nonexistent')).rejects.toThrow()
    })

    it('should delete conversation', async () => {
      await api.deleteConversation('conv-1')

      const calls = api.getCallHistory('deleteConversation')
      expect(calls).toHaveLength(1)

      // Should be removed
      await expect(api.getConversation('conv-1')).rejects.toThrow()
    })

    it('should update conversation title', async () => {
      await api.updateConversation('conv-1', { title: 'New Title' })

      const conversation = await api.getConversation('conv-1')
      expect(conversation.title).toBe('New Title')
    })

    it('should delete all conversations', async () => {
      const result = await api.deleteAllConversations()

      expect(result.deleted).toBe(1)

      const conversations = await api.getConversations()
      expect(conversations).toHaveLength(0)
    })
  })

  describe('Journeys', () => {
    const mockJourney: JourneyDetail = {
      journey_id: 'journey-1',
      title: 'BPC-157 Journey',
      primary_peptide: 'BPC-157',
      secondary_peptides: [],
      status: 'active',
      goals: [],
      administration_route: 'subcutaneous',
      planned_protocol: 'BPC-157 250mcg twice daily',
      planned_duration_weeks: 4,
      dose_logs: [],
      symptom_logs: [],
      milestones: [],
      notes: [],
      dose_count: 5,
      created_at: '2024-01-01T00:00:00Z',
    }

    beforeEach(() => {
      api.setMockJourneys([mockJourney])
    })

    it('should get journeys list', async () => {
      const journeys = await api.getJourneys()

      expect(journeys).toHaveLength(1)
      expect(journeys[0].journey_id).toBe('journey-1')
      expect(journeys[0].dose_count).toBe(5)
    })

    it('should filter journeys by status', async () => {
      const activeJourneys = await api.getJourneys('active')
      expect(activeJourneys).toHaveLength(1)

      const pausedJourneys = await api.getJourneys('paused')
      expect(pausedJourneys).toHaveLength(0)
    })

    it('should get single journey', async () => {
      const journey = await api.getJourney('journey-1')

      expect(journey.journey_id).toBe('journey-1')
      expect(journey.primary_peptide).toBe('BPC-157')
    })

    it('should create journey', async () => {
      const result = await api.createJourney({
        title: 'New Journey',
        primary_peptide: 'TB-500',
        goals: [],
        planned_protocol: 'TB-500 500mcg daily',
        planned_duration_weeks: 6,
        administration_route: 'subcutaneous',
      })

      expect(result).toHaveProperty('journey_id')
      expect(result.status).toBe('planning')
    })

    it('should log dose', async () => {
      const result = await api.logDose('journey-1', {
        peptide: 'BPC-157',
        dose_amount: 250,
        dose_unit: 'mcg',
        route: 'subcutaneous',
      })

      expect(result).toHaveProperty('log_id')
    })
  })

  describe('Share Functionality', () => {
    it('should create share link', async () => {
      const result = await api.createShareLink('conv-1')

      expect(result).toHaveProperty('share_id')
      expect(result).toHaveProperty('share_url')
    })

    it('should get shared conversation', async () => {
      const shared = await api.getSharedConversation('share-123')

      expect(shared).toHaveProperty('share_id')
      expect(shared).toHaveProperty('title')
      expect(shared).toHaveProperty('messages')
    })
  })

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const result = await api.healthCheck()
      expect(result.status).toBe('healthy')
    })
  })

  describe('Call History', () => {
    it('should track all calls', async () => {
      await api.sendMessage({ message: 'test' })
      await api.getConversations()
      await api.healthCheck()

      const allCalls = api.getCallHistory()
      expect(allCalls.length).toBe(3)
    })

    it('should clear call history', async () => {
      await api.sendMessage({ message: 'test' })
      api.clearCallHistory()

      const calls = api.getCallHistory()
      expect(calls).toHaveLength(0)
    })

    it('should reset all state', () => {
      api.setApiKey('test')
      api.reset()

      // Note: getApiKey() also records a call, so we check the value first
      const key = api.getApiKey()
      expect(key).toBeNull()
      // After reset, only the getApiKey call should be recorded
      expect(api.getCallHistory()).toHaveLength(1)
      expect(api.getCallHistory()[0].method).toBe('getApiKey')
    })
  })
})
