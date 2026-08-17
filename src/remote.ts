/** Host-for-Client Remote contribution for the Solution Council. */

import { z } from 'zod'
import type { RemoteResult, TypertRemoteContribution } from '@deepseek-ai/dsh-typert-protocol'
import type {
  CouncilCancelResult,
  CouncilGetResult,
  CouncilListResult,
} from './types.ts'

export interface SolutionCouncilRemote {
  list: (sessionId: string) => Promise<RemoteResult<CouncilListResult>>
  get: (sessionId: string, callId: string) => Promise<RemoteResult<CouncilGetResult>>
  cancel: (sessionId: string, callId: string) => Promise<RemoteResult<CouncilCancelResult>>
}

const sessionIdSchema = z.string().min(1)
const reportSchema = z.object({
  summary: z.string(),
  evidence: z.array(z.string()).readonly(),
  concerns: z.array(z.string()).readonly(),
  recommendation: z.string().optional(),
}).readonly()
const explorerSchema = z.object({
  id: z.string(),
  label: z.string(),
  status: z.enum(['queued', 'running', 'completed', 'failed']),
  summary: z.string().optional(),
  evidence: z.array(z.string()).readonly(),
  concerns: z.array(z.string()).readonly(),
  childSessionId: z.string().optional(),
  error: z.string().optional(),
}).readonly()
const finalSchema = z.object({
  recommendation: z.string(),
  rationale: z.string(),
  unresolvedConcerns: z.array(z.string()).readonly(),
}).readonly()
const runSchema = z.object({
  runId: z.string(),
  callId: z.string(),
  sessionId: z.string(),
  task: z.string(),
  status: z.enum(['queued', 'running', 'completed', 'failed', 'cancelled']),
  stage: z.enum(['queued', 'exploring', 'reviewing', 'verifying', 'synthesizing', 'completed', 'failed', 'cancelled']),
  explorers: z.array(explorerSchema).readonly(),
  review: reportSchema.optional(),
  verification: reportSchema.optional(),
  final: finalSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
}).readonly()
const listResultSchema = z.object({ runs: z.array(runSchema).readonly() }).readonly()
const getResultSchema = z.object({ run: runSchema.nullable() }).readonly()
const cancelResultSchema = z.object({ runId: z.string(), cancelled: z.boolean() }).readonly()

const TYPERT_REMOTE: TypertRemoteContribution = {
  package: 'dsh-ai-solution-council',
  descriptors: [
    {
      id: 'dsh-ai-solution-council#solutionCouncil/list',
      service: 'solutionCouncil',
      namespace: 'solutionCouncil',
      method: 'list',
      implementation: 'remoteList',
      invocation: { kind: 'direct' },
      scope: { context: 'agent', wire: 'agentId' },
      parameters: [{
        name: 'agent',
        wire: 'agentId',
        source: 'lookup',
        lookup: 'agent',
        codec: { mode: 'strict', typeSymbol: '@deepseek-ai/dsh-session/types#SessionId', schema: sessionIdSchema },
      }],
      result: { mode: 'strict', typeSymbol: 'dsh-ai-solution-council#CouncilListResult', schema: listResultSchema },
    },
    {
      id: 'dsh-ai-solution-council#solutionCouncil/get',
      service: 'solutionCouncil',
      namespace: 'solutionCouncil',
      method: 'get',
      implementation: 'remoteGet',
      invocation: { kind: 'direct' },
      scope: { context: 'agent', wire: 'agentId' },
      parameters: [
        {
          name: 'agent',
          wire: 'agentId',
          source: 'lookup',
          lookup: 'agent',
          codec: { mode: 'strict', typeSymbol: '@deepseek-ai/dsh-session/types#SessionId', schema: sessionIdSchema },
        },
        {
          name: 'callId',
          wire: 'callId',
          source: 'json',
          codec: { mode: 'strict', typeSymbol: 'dsh-ai-solution-council#string', schema: z.string().min(1) },
        },
      ],
      result: { mode: 'strict', typeSymbol: 'dsh-ai-solution-council#CouncilGetResult', schema: getResultSchema },
    },
    {
      id: 'dsh-ai-solution-council#solutionCouncil/cancel',
      service: 'solutionCouncil',
      namespace: 'solutionCouncil',
      method: 'cancel',
      implementation: 'remoteCancel',
      invocation: { kind: 'direct' },
      scope: { context: 'agent', wire: 'agentId' },
      parameters: [
        {
          name: 'agent',
          wire: 'agentId',
          source: 'lookup',
          lookup: 'agent',
          codec: { mode: 'strict', typeSymbol: '@deepseek-ai/dsh-session/types#SessionId', schema: sessionIdSchema },
        },
        {
          name: 'callId',
          wire: 'callId',
          source: 'json',
          codec: { mode: 'strict', typeSymbol: 'dsh-ai-solution-council#string', schema: z.string().min(1) },
        },
      ],
      result: { mode: 'strict', typeSymbol: 'dsh-ai-solution-council#CouncilCancelResult', schema: cancelResultSchema },
    },
  ],
}

export default TYPERT_REMOTE
