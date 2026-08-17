/** Public JSON-compatible data shared by Host, Remote, and Web UI. */

export type CouncilStage = 'queued' | 'exploring' | 'reviewing' | 'verifying' | 'synthesizing' | 'completed' | 'failed' | 'cancelled'
export type CouncilStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'
export type ExplorerStatus = 'queued' | 'running' | 'completed' | 'failed'

export interface CouncilExplorer {
  id: string
  label: string
  status: ExplorerStatus
  summary?: string
  evidence: string[]
  concerns: string[]
  childSessionId?: string
  error?: string
}

export interface CouncilReport {
  summary: string
  evidence: string[]
  concerns: string[]
  recommendation?: string
}

export interface CouncilFinalDecision {
  recommendation: string
  rationale: string
  unresolvedConcerns: string[]
}

export interface CouncilRun {
  runId: string
  callId: string
  sessionId: string
  task: string
  status: CouncilStatus
  stage: CouncilStage
  explorers: CouncilExplorer[]
  review?: CouncilReport
  verification?: CouncilReport
  final?: CouncilFinalDecision
  createdAt: string
  updatedAt: string
}

export interface CouncilListResult {
  runs: CouncilRun[]
}

export interface CouncilGetResult {
  run: CouncilRun | null
}

export interface CouncilCancelResult {
  runId: string
  cancelled: boolean
}

export interface CouncilToolResult {
  runId: string
  status: CouncilStatus
  task: string
  recommendation: string
  explorerCount: number
}
