import type { SessionId } from '@deepseek-ai/dsh-client-runtime/client'

export interface CouncilOpenState {
  readonly sessionId: SessionId
  readonly callId: string
}

export interface CouncilUiController {
  readonly state: {
    subscribe: (listener: () => void) => () => void
    getSnapshot: () => CouncilOpenState | null
  }
  open(sessionId: SessionId, callId: string): void
  close(): void
}

export function createCouncilUiController(): CouncilUiController {
  let snapshot: CouncilOpenState | null = null
  const listeners = new Set<() => void>()
  const notify = (): void => { for (const listener of listeners) listener() }
  const state = {
    subscribe(listener: () => void): () => void {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
    getSnapshot(): CouncilOpenState | null { return snapshot },
  }
  return {
    state,
    open(sessionId, callId) {
      snapshot = { sessionId, callId }
      notify()
    },
    close() {
      if (snapshot === null) return
      snapshot = null
      notify()
    },
  }
}
