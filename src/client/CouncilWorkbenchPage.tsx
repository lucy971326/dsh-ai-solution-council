/** Full-screen conversation view tab for the council workbench. */

import type { ConvViewProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { ChatNode } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {
  CouncilExplorer,
  CouncilFinalDecision,
  CouncilReport,
  CouncilRun,
} from '../types.ts'
import type { CouncilRunChatData } from './council-node.ts'
import { MarkdownDisclosure } from './MarkdownDisclosure.tsx'
import css from './solution-council.module.css'

function statusLabel(status: CouncilRun['status']): string {
  switch (status) {
    case 'running': return '进行中'
    case 'completed': return '已完成'
    case 'failed': return '未完成'
    case 'cancelled': return '已取消'
    default: return '排队中'
  }
}

function stageLabel(stage: CouncilRun['stage']): string {
  switch (stage) {
    case 'exploring': return '并行探索'
    case 'reviewing': return '交叉评审'
    case 'verifying': return '证据核验'
    case 'synthesizing': return '最终方案'
    case 'completed': return '已完成'
    case 'failed': return '未完成'
    case 'cancelled': return '已取消'
    default: return '排队中'
  }
}

function listMarkdown(title: string, items: readonly string[]): string {
  return items.length === 0 ? '' : `### ${title}\n\n${items.map(item => `- ${item}`).join('\n')}`
}

function reportMarkdown(report: CouncilReport): string {
  return [
    report.summary,
    listMarkdown('证据', report.evidence),
    listMarkdown('待确认', report.concerns),
  ].filter(Boolean).join('\n\n')
}

function explorerMarkdown(explorer: CouncilExplorer): string {
  return [
    explorer.summary ?? '',
    listMarkdown('证据', explorer.evidence),
    listMarkdown('待确认', explorer.concerns),
  ].filter(Boolean).join('\n\n')
}

function finalMarkdown(final: CouncilFinalDecision): string {
  return [
    `## ${final.recommendation}`,
    `### 判断依据\n\n${final.rationale}`,
    listMarkdown('待确认', final.unresolvedConcerns),
  ].filter(Boolean).join('\n\n')
}

function reportSection(
  report: CouncilReport | undefined,
  title: string,
  empty: string,
) {
  if (report === undefined) {
    return <section className={css.reportSection}><h3>{title}</h3><p className={css.muted}>{empty}</p></section>
  }
  return (
    <section className={css.reportSection}>
      <h3>{title}</h3>
      <MarkdownDisclosure
        title="报告内容"
        text={reportMarkdown(report)}
        preview={report.summary}
        expandLabel="展开"
        collapseLabel="收起"
        size="large"
      />
    </section>
  )
}

export function CouncilWorkbenchPage({ useSession }: ConvViewProps) {
  const nodes = useSession(state => state.chat.nodes)
  const runs = [...nodes.values()].filter((node): node is ChatNode<'council-run'> => node.kind === 'council-run')
  const latest = runs[runs.length - 1]
  const data = latest?.data as CouncilRunChatData | undefined
  const active = data?.status === 'running' || data?.status === 'queued'
  const phases = [
    ['exploring', '并行探索'],
    ['reviewing', '交叉评审'],
    ['verifying', '证据核验'],
    ['synthesizing', '最终方案'],
  ] as const

  if (data === undefined) {
    return (
      <div className={css.workbench}>
        <div className={css.workbenchBody}>
          <div className={css.loading}>暂无方案团数据。运行一次方案团后，这里会展示完整工作台。</div>
        </div>
      </div>
    )
  }

  return (
    <div className={css.workbench} data-council-workbench data-status={data.status}>
      <header className={css.workbenchHeader}>
        <div className={css.headerTitle}>
          <span className={css.eyebrow}>AI 方案团 · 工作台</span>
          <h1>{data.task}</h1>
        </div>
        <div className={css.headerActions}>
          <span className={css.headerStatus} data-status={data.status}>{stageLabel(data.stage)}</span>
          <span className={css.meta}>{data.completed} / {data.total} · {statusLabel(data.status)}</span>
        </div>
      </header>

      <main className={css.workbenchBody}>
        <section className={css.taskBlock}>
          <span className={css.eyebrow}>调查问题</span>
          <h2>{data.task}</h2>
          <div className={css.meta}>{data.updatedAt}</div>
        </section>

        <section className={css.phaseBar} aria-label="方案团阶段">
          {phases.map(([key, label], index) => (
            <div
              className={css.phase}
              data-active={data.stage === key || (data.stage === 'completed' && index === 3) || undefined}
              data-done={data.stage === 'completed'
                || (index < phases.findIndex(p => p[0] === data.stage)) || undefined}
              key={key}
            >
              <span className={css.phaseIndex}>{index + 1}</span>
              <span>{label}</span>
            </div>
          ))}
        </section>

        <div className={css.columns}>
          <section className={css.mainColumn}>
            <div className={css.sectionHeading}>
              <h2>并行探索</h2>
              <span>{data.completed} / {data.total} 完成</span>
            </div>
            <div className={css.explorerGrid}>
              {data.explorers.map(explorer => (
                <article className={css.explorerCard} data-state={explorer.status} key={explorer.id}>
                  <div className={css.explorerTop}>
                    <strong>{explorer.id}</strong>
                    <span>{statusLabel(explorer.status)}</span>
                  </div>
                  <div className={css.explorerLabel}>{explorer.label}</div>
                  <div className={css.explorerMetrics} aria-label="报告内容">
                    <span><strong>{explorer.evidence.length}</strong> 证据</span>
                    <span><strong>{explorer.concerns.length}</strong> 待确认</span>
                  </div>
                  <MarkdownDisclosure
                    title="报告内容"
                    text={explorerMarkdown(explorer)}
                    preview={explorer.error ?? explorer.summary ?? '等待探索结果'}
                    expandLabel="展开"
                    collapseLabel="收起"
                  />
                  {explorer.error !== undefined && <div className={css.errorLine}>{explorer.error}</div>}
                </article>
              ))}
            </div>
            {reportSection(data.review, '交叉评审', active ? '评审进行中…' : '暂无交叉评审。')}
            {reportSection(data.verification, '证据核验', active ? '核验进行中…' : '暂无证据核验。')}
          </section>

          <aside className={css.sideColumn}>
            <section className={css.finalCard}>
              <div className={css.eyebrow}>最终方案</div>
              {data.final === undefined ? (
                <>
                  <h2>尚未形成最终建议</h2>
                  <p>{active ? '方案团仍在运行。' : '暂无最终方案。'}</p>
                </>
              ) : (
                <MarkdownDisclosure
                  title="报告内容"
                  text={finalMarkdown(data.final)}
                  preview={data.final.recommendation}
                  expandLabel="展开"
                  collapseLabel="收起"
                  defaultOpen
                  size="large"
                />
              )}
            </section>
          </aside>
        </div>
      </main>
    </div>
  )
}
