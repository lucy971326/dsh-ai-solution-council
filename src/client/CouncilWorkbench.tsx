/** Full-screen, token-styled progress surface opened from the conversation card. */

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol'
import type { CouncilGetResult, CouncilReport, CouncilRun } from '../types.ts'
import type { SolutionCouncilRemote } from '../remote.ts'
import type { CouncilUiController } from './controller.ts'
import { MarkdownDisclosure } from './MarkdownDisclosure.tsx'
import css from './solution-council.module.css'

export interface CouncilWorkbenchActions {
  controller: CouncilUiController
  get: SolutionCouncilRemote['get']
  cancel: SolutionCouncilRemote['cancel']
}

export type CouncilWorkbenchProps = CouncilWorkbenchActions & PropsLocale<'solutionCouncil'>

function resultError<T>(result: RemoteResult<T>): string | null {
  return result.ok ? null : `${result.error.message} (${result.error.code})`
}

function stageLabel(stage: CouncilRun['stage'], t: CouncilWorkbenchProps['t']): string {
  switch (stage) {
    case 'exploring': return t('explorers')
    case 'reviewing': return t('review')
    case 'verifying': return t('verification')
    case 'synthesizing': return t('synthesis')
    case 'completed': return t('completed')
    case 'failed': return t('failed')
    case 'cancelled': return t('failed')
    default: return t('queued')
  }
}

function listMarkdown(title: string, items: readonly string[]): string {
  return items.length === 0 ? '' : `### ${title}\n\n${items.map(item => `- ${item}`).join('\n')}`
}

function reportMarkdown(report: CouncilReport, t: CouncilWorkbenchProps['t']): string {
  return [
    report.summary,
    listMarkdown(t('evidence'), report.evidence),
    listMarkdown(t('concerns'), report.concerns),
  ].filter(Boolean).join('\n\n')
}

function explorerMarkdown(explorer: CouncilRun['explorers'][number], t: CouncilWorkbenchProps['t']): string {
  return [
    explorer.summary ?? '',
    listMarkdown(t('evidence'), explorer.evidence),
    listMarkdown(t('concerns'), explorer.concerns),
  ].filter(Boolean).join('\n\n')
}

function finalMarkdown(final: NonNullable<CouncilRun['final']>, t: CouncilWorkbenchProps['t']): string {
  return [
    `## ${final.recommendation}`,
    `### ${t('rationale')}\n\n${final.rationale}`,
    listMarkdown(t('concerns'), final.unresolvedConcerns),
  ].filter(Boolean).join('\n\n')
}

function reportSection(
  report: CouncilReport | undefined,
  title: string,
  empty: string,
  t: CouncilWorkbenchProps['t'],
) {
  if (report === undefined) return <section className={css.reportSection}><h3>{title}</h3><p className={css.muted}>{empty}</p></section>
  return (
    <section className={css.reportSection}>
      <h3>{title}</h3>
      <MarkdownDisclosure
        title={t('details')}
        text={reportMarkdown(report, t)}
        preview={report.summary}
        expandLabel={t('expand')}
        collapseLabel={t('collapse')}
        size="large"
      />
    </section>
  )
}

export function CouncilWorkbench({ controller, get, cancel, t }: CouncilWorkbenchProps) {
  const open = useSyncExternalStore(controller.state.subscribe, controller.state.getSnapshot)
  const [run, setRun] = useState<CouncilRun | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const sequence = useRef(0)

  const load = useCallback(async (sessionId: string, callId: string, initial: boolean) => {
    const current = ++sequence.current
    if (initial) setLoading(true)
    try {
      const result = await get(sessionId, callId)
      if (current !== sequence.current) return
      const failure = resultError(result)
      if (failure !== null) {
        setError(failure)
        if (initial) setLoading(false)
        return
      }
      setRun((result as Extract<RemoteResult<CouncilGetResult>, { ok: true }>).value.run)
      setError(null)
    } catch (cause) {
      if (current !== sequence.current) return
      setError(cause instanceof Error ? cause.message : t('error'))
    } finally {
      if (initial && current === sequence.current) setLoading(false)
    }
  }, [get, t])

  useEffect(() => {
    if (open === null) {
      sequence.current += 1
      setRun(null)
      setError(null)
      setLoading(false)
      return
    }
    sequence.current += 1
    setRun(null)
    setError(null)
    void load(String(open.sessionId), open.callId, true)
    return () => { sequence.current += 1 }
  }, [load, open])

  useEffect(() => {
    if (open === null || run === null || (run.status !== 'running' && run.status !== 'queued')) return
    const timer = window.setTimeout(() => {
      void load(String(open.sessionId), open.callId, false)
    }, 1500)
    return () => { window.clearTimeout(timer) }
  }, [load, open, run])

  if (open === null) return null

  const done = run?.explorers.filter(item => item.status === 'completed').length ?? 0
  const total = run?.explorers.length ?? 0
  const active = run?.status === 'running' || run?.status === 'queued'

  const stop = async () => {
    if (cancelling) return
    setCancelling(true)
    try {
      await cancel(String(open.sessionId), open.callId)
      await load(String(open.sessionId), open.callId, false)
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className={css.overlay} role="dialog" aria-modal="true" aria-label={t('title')}>
      <div className={css.workbench}>
        <header className={css.workbenchHeader}>
          <button type="button" className={css.backButton} onClick={controller.close}>{t('back')}</button>
          <div className={css.headerTitle}><span className={css.eyebrow}>DSH</span><h1>{t('title')}</h1></div>
          <div className={css.headerActions}>
            <span className={css.headerStatus} data-status={run?.status ?? 'queued'}>{run === null ? t('loading') : stageLabel(run.stage, t)}</span>
            {active && <button type="button" className={css.stopButton} onClick={() => { void stop() }} disabled={cancelling}>{cancelling ? t('cancelling') : t('cancel')}</button>}
          </div>
        </header>

        <main className={css.workbenchBody}>
          {loading && <div className={css.loading}>{t('loading')}</div>}
          {error !== null && <div className={css.error} role="alert">{error}</div>}
          {run === null && !loading && error === null && <div className={css.loading}>{t('empty')}</div>}
          {run !== null && (
            <>
              <section className={css.taskBlock}>
                <div className={css.eyebrow}>{t('task')}</div>
                <h2>{run.task}</h2>
                <div className={css.meta}>{run.updatedAt}</div>
              </section>

              <section className={css.phaseBar} aria-label={t('title')}>
                {[['exploring', t('explorers')], ['reviewing', t('review')], ['verifying', t('verification')], ['synthesizing', t('synthesis')]].map(([key, label], index) => (
                  <div className={css.phase} data-active={run.stage === key || (run.stage === 'completed' && index === 3) || undefined} data-done={run.stage === 'completed' || (index < ['exploring', 'reviewing', 'verifying', 'synthesizing'].indexOf(run.stage)) || undefined} key={key}>
                    <span className={css.phaseIndex}>{index + 1}</span><span>{label}</span>
                  </div>
                ))}
              </section>

              <div className={css.columns}>
                <section className={css.mainColumn}>
                  <div className={css.sectionHeading}><h2>{t('explorers')}</h2><span>{t('completedCount', { done, total })}</span></div>
                  <div className={css.explorerGrid}>
                    {run.explorers.map(explorer => (
                      <article className={css.explorerCard} data-state={explorer.status} key={explorer.id}>
                        <div className={css.explorerTop}><strong>{explorer.id}</strong><span>{explorer.status === 'completed' ? t('completed') : explorer.status === 'failed' ? t('failed') : explorer.status === 'running' ? t('running') : t('queued')}</span></div>
                        <div className={css.explorerLabel}>{explorer.label}</div>
                        <div className={css.explorerMetrics} aria-label={t('details')}>
                          <span><strong>{explorer.evidence.length}</strong> {t('evidence')}</span>
                          <span><strong>{explorer.concerns.length}</strong> {t('concerns')}</span>
                        </div>
                        <MarkdownDisclosure
                          title={t('details')}
                          text={explorerMarkdown(explorer, t)}
                          preview={explorer.error ?? explorer.summary ?? t('loading')}
                          expandLabel={t('expand')}
                          collapseLabel={t('collapse')}
                        />
                        {explorer.error !== undefined && <div className={css.errorLine}>{explorer.error}</div>}
                      </article>
                    ))}
                  </div>
                  {reportSection(run.review, t('review'), t('loading'), t)}
                  {reportSection(run.verification, t('verification'), t('loading'), t)}
                </section>

                <aside className={css.sideColumn}>
                  <section className={css.finalCard}>
                    <div className={css.eyebrow}>{t('synthesis')}</div>
                    {run.final === undefined ? (
                      <>
                        <h2>{t('noRecommendation')}</h2>
                        <p>{t('loading')}</p>
                      </>
                    ) : (
                      <MarkdownDisclosure
                        title={t('details')}
                        text={finalMarkdown(run.final, t)}
                        preview={run.final.recommendation}
                        expandLabel={t('expand')}
                        collapseLabel={t('collapse')}
                        defaultOpen
                        size="large"
                      />
                    )}
                  </section>
                </aside>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
