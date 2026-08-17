import { useState } from 'react'
import { extractMarkdownPlainText, MarkdownText } from '@deepseek-ai/dsh-client-ui-primitives'
import css from './solution-council.module.css'

export interface MarkdownDisclosureProps {
  title: string
  text: string
  preview?: string
  expandLabel: string
  collapseLabel: string
  defaultOpen?: boolean
  size?: 'compact' | 'large'
}

function plainPreview(text: string, fallback: string): string {
  const value = extractMarkdownPlainText(text, { mode: 'first-paragraph' }).trim()
  return value || fallback
}

/** Structured model output can contain escaped line breaks; Markdown needs real ones. */
function normalizeMarkdown(text: string): string {
  return text.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n').replace(/\\t/g, '\t')
}

/** A bounded Markdown panel: readable preview when closed, scrollable body when open. */
export function MarkdownDisclosure({
  title,
  text,
  preview,
  expandLabel,
  collapseLabel,
  defaultOpen = false,
  size = 'compact',
}: MarkdownDisclosureProps) {
  const [open, setOpen] = useState(defaultOpen)
  const renderedText = normalizeMarkdown(text)
  const renderedPreview = preview === undefined ? undefined : normalizeMarkdown(preview)
  const hasContent = renderedText.trim().length > 0
  const viewportClass = size === 'large'
    ? `${css.markdownViewport} ${css.markdownViewportLarge}`
    : css.markdownViewport

  if (!hasContent) {
    return <div className={css.markdownPending}>{preview}</div>
  }

  return (
    <section className={css.markdownDisclosure} data-open={open || undefined}>
      <button
        type="button"
        className={css.disclosureButton}
        aria-expanded={open}
        onClick={() => { setOpen(value => !value) }}
      >
        <span className={css.disclosureTitle}>{title}</span>
        <span className={css.disclosureAction}>{open ? collapseLabel : expandLabel}</span>
      </button>
      {open ? (
        <div className={viewportClass}>
          <MarkdownText text={renderedText} />
        </div>
      ) : (
        <div className={css.markdownPreview}>{renderedPreview ?? plainPreview(renderedText, title)}</div>
      )}
    </section>
  )
}
