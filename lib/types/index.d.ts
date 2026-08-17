import type { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type { CouncilCancelResult, CouncilGetResult, CouncilListResult, CouncilToolResult } from './types.js'

export * from './types.js'

export interface Config {
  readonly explorerCount: number
  readonly providerName: string
  readonly maxTaskBytes: number
  readonly maxRunsPerSession: number
}

export declare const Config: unknown
export declare const name: 'solution-council'
export declare const inject: readonly ['tools', 'storageDomain', 'subagents']

export declare class SolutionCouncilService {
  constructor(ctx: Context, config?: Config)
  list(agent: Agent): Promise<CouncilListResult>
  getByCall(agent: Agent, callId: string): Promise<CouncilGetResult>
  cancel(agent: Agent, callId: string): Promise<CouncilCancelResult>
  runCouncil(agent: Agent, task: string, callId: string, signal: AbortSignal): Promise<CouncilToolResult>
}

export default SolutionCouncilService
