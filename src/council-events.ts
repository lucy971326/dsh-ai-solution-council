/** Session event vocabulary shared by the Host tool and the Web client. */

import type {} from '@deepseek-ai/dsh-session/types'
import type {
  CouncilExplorer,
  CouncilFinalDecision,
  CouncilReport,
  CouncilStage,
  CouncilStatus,
} from './types.ts'

/** Whole-run initial state, appended once when a council run is created. */
export interface CouncilRunStartData {
  readonly runId: string
  readonly callId: string
  readonly task: string
  readonly explorers: readonly { readonly id: string; readonly label: string }[]
  readonly createdAt: string
}

/** Whole-value checkpoint appended after every durable run mutation. */
export interface CouncilRunUpdateData {
  readonly runId: string
  readonly status: CouncilStatus
  readonly stage: CouncilStage
  readonly explorers: readonly CouncilExplorer[]
  readonly review?: CouncilReport
  readonly verification?: CouncilReport
  readonly final?: CouncilFinalDecision
  readonly updatedAt: string
}

declare module '@deepseek-ai/dsh-session/types' {
  interface SessionEventMap {
    /** Opens one council run owned by the producing agent. */
    'council/run-start': CouncilRunStartData
    /** Replayable checkpoint for the same run. */
    'council/run-update': CouncilRunUpdateData
  }
}
