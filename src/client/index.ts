/** Web half: durable tool card + full-screen workbench. */

import type { ClientContext, SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-tool/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import solutionCouncilRemote from '../remote.ts'
import type { SolutionCouncilRemote } from '../remote.ts'
import { CouncilToolRow } from './CouncilToolRow.tsx'
import { CouncilWorkbench } from './CouncilWorkbench.tsx'
import { createCouncilUiController } from './controller.ts'
import { en, zh, type SolutionCouncilKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    solutionCouncil: SolutionCouncilKey
  }
}

const NS = 'solutionCouncil'
export const inject = ['slots', 'remote', 'locale']

export async function apply(ctx: ClientContext): Promise<void> {
  const remote = ctx.remote as ClientContext['remote'] & { solutionCouncil: SolutionCouncilRemote }
  const disposeRemote = await remote.$mount(solutionCouncilRemote)
  const solutionCouncil = ctx.get('remote.solutionCouncil') as SolutionCouncilRemote
  const ui = createCouncilUiController()

  ctx.effect(() => async () => { await disposeRemote() }, 'solution-council.client.remote')
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'solution-council.client.locale')

  ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({
    name: 'tool.call.toolview',
    key: 'solution_council',
    locale: NS,
    inject: (sessionId: SessionId) => ({
      openWorkbench: (callId: string) => { ui.open(sessionId, callId) },
    }),
  }, CouncilToolRow))

  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'solution-council-workbench',
    locale: NS,
    inject: () => ({
      controller: ui,
      get: (sessionId: string, callId: string) => solutionCouncil.get(sessionId, callId),
      cancel: (sessionId: string, callId: string) => solutionCouncil.cancel(sessionId, callId),
    }),
  }, CouncilWorkbench))
}
