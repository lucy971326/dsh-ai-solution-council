export type CouncilStage = 'queued' | 'exploring' | 'reviewing' | 'verifying' | 'synthesizing' | 'completed' | 'failed' | 'cancelled'
export type CouncilStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'
export type ExplorerStatus = 'queued' | 'running' | 'completed' | 'failed'

export interface CouncilExplorer {
  readonly id: string
  readonly label: string
  readonly status: ExplorerStatus
  readonly summary?: string
  readonly evidence: readonly string[]
  readonly concerns: readonly string[]
  readonly childSessionId?: string
  readonly error?: string
}

export interface CouncilReport {
  readonly summary: string
  readonly evidence: readonly string[]
  readonly concerns: readonly string[]
  readonly recommendation?: string
}

export interface CouncilFinalDecision {
  readonly recommendation: string
  readonly rationale: string
  readonly unresolvedConcerns: readonly string[]
}

export interface CouncilRun {
  readonly runId: string
  readonly callId: string
  readonly sessionId: string
  readonly task: string
  readonly status: CouncilStatus
  readonly stage: CouncilStage
  readonly explorers: readonly CouncilExplorer[]
  readonly review?: CouncilReport
  readonly verification?: CouncilReport
  readonly final?: CouncilFinalDecision
  readonly createdAt: string
  readonly updatedAt: string
}

export interface CouncilListResult { readonly runs: readonly CouncilRun[] }
export interface CouncilGetResult { readonly run: CouncilRun | null }
export interface CouncilCancelResult { readonly runId: string; readonly cancelled: boolean }
export interface CouncilToolResult {
  readonly runId: string
  readonly status: CouncilStatus
  readonly task: string
  readonly recommendation: string
  readonly explorerCount: number
}
