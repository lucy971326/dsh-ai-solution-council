import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol'
import type { CouncilCancelResult, CouncilGetResult, CouncilListResult } from './types.js'

export interface SolutionCouncilRemote {
  list: (sessionId: string) => Promise<RemoteResult<CouncilListResult>>
  get: (sessionId: string, callId: string) => Promise<RemoteResult<CouncilGetResult>>
  cancel: (sessionId: string, callId: string) => Promise<RemoteResult<CouncilCancelResult>>
}

declare const contribution: unknown
export default contribution
