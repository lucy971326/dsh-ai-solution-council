/** Client Conversation-Node definition that folds council session events. */

import type {
  ConversationLocation,
  ConversationNodeContext,
  ConversationNodeDefinition,
} from '@deepseek-ai/dsh-client-runtime/client'
import type { CouncilRunStartData, CouncilRunUpdateData } from '../council-events.ts'
import type {
  CouncilExplorer,
  CouncilFinalDecision,
  CouncilReport,
  CouncilStage,
  CouncilStatus,
} from '../types.ts'

export interface CouncilRunChatData {
  readonly task: string
  readonly status: CouncilStatus
  readonly stage: CouncilStage
  readonly explorers: readonly CouncilExplorer[]
  readonly completed: number
  readonly total: number
  readonly updatedAt: string
  readonly review?: CouncilReport
  readonly verification?: CouncilReport
  readonly final?: CouncilFinalDecision
}

declare module '@deepseek-ai/dsh-client-ui-conversation/client' {
  interface ChatNodeDataMap {
    'council-run': CouncilRunChatData
  }
}

interface CouncilRunState extends CouncilRunChatData {
  readonly runId: string
  readonly callId: string
  readonly createdAt: string
}

function locationOf(context: ConversationNodeContext): ConversationLocation {
  return context.start?.location ?? context.matches[0]?.location ?? { kind: 'unresolved' }
}

function toChatData(state: CouncilRunState): CouncilRunChatData {
  return {
    task: state.task,
    status: state.status,
    stage: state.stage,
    explorers: state.explorers,
    completed: state.completed,
    total: state.total,
    updatedAt: state.updatedAt,
    ...(state.review === undefined ? {} : { review: state.review }),
    ...(state.verification === undefined ? {} : { verification: state.verification }),
    ...(state.final === undefined ? {} : { final: state.final }),
  }
}

function completedCount(explorers: readonly CouncilExplorer[]): number {
  return explorers.filter(item => item.status === 'completed').length
}

export const councilRunDefinition: ConversationNodeDefinition<CouncilRunState> = {
  kind: 'council-run',
  target: 'chat',
  match: event => {
    if (event.type === 'council/run-start') return { id: event.data.runId, role: 'start' }
    if (event.type === 'council/run-update') return { id: event.data.runId, role: 'update' }
    return null
  },
  start: (_context, match) => {
    if (match.event.type !== 'council/run-start') {
      throw new Error('council-run start requires council/run-start')
    }
    const data: CouncilRunStartData = match.event.data
    const explorers: CouncilExplorer[] = data.explorers.map(item => ({
      id: item.id,
      label: item.label,
      status: 'queued',
      evidence: [],
      concerns: [],
    }))
    return {
      runId: data.runId,
      callId: data.callId,
      task: data.task,
      explorers,
      completed: 0,
      total: explorers.length,
      status: 'queued',
      stage: 'queued',
      createdAt: data.createdAt,
      updatedAt: data.createdAt,
    }
  },
  update: (context, match) => {
    if (match.event.type !== 'council/run-update' || context.state === undefined) return context.state
    const data: CouncilRunUpdateData = match.event.data
    return {
      ...context.state,
      status: data.status,
      stage: data.stage,
      explorers: data.explorers as CouncilExplorer[],
      completed: completedCount(data.explorers),
      total: data.explorers.length,
      updatedAt: data.updatedAt,
      ...(data.review === undefined ? {} : { review: data.review }),
      ...(data.verification === undefined ? {} : { verification: data.verification }),
      ...(data.final === undefined ? {} : { final: data.final }),
    }
  },
  publication: match => (match.event.type === 'council/run-update'
    ? 'animation-frame'
    : 'immediate'),
  buildViewNode: context => {
    if (context.state === undefined) return null
    return {
      key: context.key,
      kind: 'council-run',
      id: context.id,
      target: 'chat',
      anchorSeq: context.start?.event.seq ?? context.matches[0]?.event.seq ?? 0,
      location: locationOf(context),
      visibility: 'visible',
      data: toChatData(context.state),
    }
  },
}
