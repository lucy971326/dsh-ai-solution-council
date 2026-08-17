/** Web half: a live council-run conversation card assembled from session events. */

import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-slots'
import { councilRunDefinition } from './council-node.ts'
import { CouncilRunCard } from './CouncilRunCard.tsx'
import { CouncilWorkbenchPage } from './CouncilWorkbenchPage.tsx'
import { en, zh, type SolutionCouncilKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    solutionCouncil: SolutionCouncilKey
  }
}

const NS = 'solutionCouncil'
export const inject = ['conversationEvents', 'slots', 'locale']

export function apply(ctx: ClientContext): void {
  ctx.conversationEvents.register(councilRunDefinition)
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'solution-council.client.locale')
  ctx.slots.inject('conversation.chat.node', () => ctx.slots.register({
    name: 'conversation.chat.node',
    key: 'council-run',
    locale: NS,
  }, CouncilRunCard))
  ctx.slots.inject('conversation.view', () => ctx.slots.register({
    name: 'conversation.view',
    id: 'council',
    order: 20,
    locale: NS,
    label: () => '方案团',
    inject: () => ({}),
  }, CouncilWorkbenchPage))
}
