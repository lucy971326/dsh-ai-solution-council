import { describe, expect, it } from 'vitest'
import type { ConversationNodeContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { CouncilRunStartData, CouncilRunUpdateData } from '../src/council-events.ts'
import { councilRunDefinition } from '../src/client/council-node.ts'

const startEvent = {
  type: 'council/run-start',
  seq: 0,
  time: 0,
  data: {
    runId: 'run-1',
    callId: 'call-1',
    task: '设计一个发布流程',
    explorers: [{ id: 'A1', label: '独立调查 1' }, { id: 'A2', label: '独立调查 2' }],
    createdAt: '2026-08-17 09:00:00 UTC',
  } satisfies CouncilRunStartData,
} as const

const updateEvent = {
  type: 'council/run-update',
  seq: 1,
  time: 1,
  data: {
    runId: 'run-1',
    status: 'completed',
    stage: 'completed',
    explorers: [
      {
        id: 'A1', label: '独立调查 1', status: 'completed',
        evidence: ['src/release.ts'], concerns: [],
      },
      {
        id: 'A2', label: '独立调查 2', status: 'completed',
        evidence: ['docs/publish.md'], concerns: ['需要人工复核'],
      },
    ],
    final: {
      recommendation: '拆分发布脚本并加校验',
      rationale: '证据支持',
      unresolvedConcerns: [],
    },
    updatedAt: '2026-08-17 09:02:00 UTC',
  } satisfies CouncilRunUpdateData,
} as const

function fakeContext(state: unknown): ConversationNodeContext {
  return {
    key: 'council-run:0',
    id: 'run-1',
    matches: [],
    state,
  } as unknown as ConversationNodeContext
}

describe('council-run conversation node fold', () => {
  it('matches the run-start as the start role', () => {
    const match = councilRunDefinition.match(startEvent as never)
    expect(match).toEqual({ id: 'run-1', role: 'start' })
  })

  it('starts in queued state with zero completed explorers', () => {
    const match = councilRunDefinition.match(startEvent as never)
    const state = councilRunDefinition.start(fakeContext(undefined), { ...match, event: startEvent } as never)
    expect(state.status).toBe('queued')
    expect(state.total).toBe(2)
    expect(state.completed).toBe(0)
  })

  it('folds the checkpoint into a completed view node', () => {
    const startMatch = councilRunDefinition.match(startEvent as never)
    const initialState = councilRunDefinition.start(
      fakeContext(undefined),
      { ...startMatch, event: startEvent } as never,
    )
    const updateMatch = councilRunDefinition.match(updateEvent as never)
    const context = fakeContext(initialState)
    const nextState = councilRunDefinition.update(context, { ...updateMatch, event: updateEvent } as never)
    const node = councilRunDefinition.buildViewNode(fakeContext(nextState))
    expect(nextState.status).toBe('completed')
    expect(nextState.completed).toBe(2)
    expect(node).not.toBeNull()
    expect(node?.kind).toBe('council-run')
    expect((node?.data as { total: number }).total).toBe(2)
  })
})
