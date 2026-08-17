/** Compact conversation card for the durable solution_council tool call. */

import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { ToolCallViewProps } from '@deepseek-ai/dsh-client-ui-tool/client'
import type { ToolCallBlock } from '@deepseek-ai/dsh-client-runtime/client'
import css from './solution-council.module.css'

export interface CouncilToolRowActions {
  openWorkbench: (callId: string) => void
}

export type CouncilToolRowProps = ToolCallViewProps & PropsLocale<'solutionCouncil'> & CouncilToolRowActions

function argsRaw(block: ToolCallBlock): string {
  return block.kind === 'tool-result' ? block.call?.argsRaw ?? '' : block.argsRaw
}

function taskFrom(block: ToolCallBlock): string {
  try {
    const value: unknown = JSON.parse(argsRaw(block))
    if (typeof value === 'object' && value !== null && typeof (value as { task?: unknown }).task === 'string') {
      return (value as { task: string }).task
    }
  } catch {
    // Streaming JSON is expected to be incomplete for a short time.
  }
  return ''
}

function stateText(block: ToolCallBlock, t: CouncilToolRowProps['t']): string {
  if (block.kind === 'tool-result') return block.isError ? t('failed') : t('completed')
  return t('running')
}

export function CouncilToolRow({ callId, block, openWorkbench, t }: CouncilToolRowProps) {
  const task = taskFrom(block)
  return (
    <div className={css.toolRoot} data-tool="solution_council" data-state={block.kind === 'tool-result' ? (block.isError ? 'error' : 'completed') : 'running'}>
      <button type="button" className={css.toolButton} onClick={() => { openWorkbench(callId) }}>
        <span className={css.toolMark} aria-hidden>SC</span>
        <span className={css.toolTitle}>{t('title')}</span>
        <span className={css.toolSeparator} aria-hidden>·</span>
        <span className={css.toolSummary}>{task || t('explorerSummary')}</span>
        <span className={css.toolStatus}>{stateText(block, t)}</span>
      </button>
    </div>
  )
}
