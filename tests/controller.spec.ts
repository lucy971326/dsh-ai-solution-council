import { describe, expect, it } from 'vitest'
import { createCouncilUiController } from '../src/client/controller.ts'

describe('solution council UI controller', () => {
  it('keeps one stable open target and notifies subscribers only on changes', () => {
    const controller = createCouncilUiController()
    let notifications = 0
    const dispose = controller.state.subscribe(() => { notifications += 1 })

    controller.open('session-a', 'call-1')
    expect(controller.state.getSnapshot()).toEqual({ sessionId: 'session-a', callId: 'call-1' })
    controller.open('session-a', 'call-2')
    expect(controller.state.getSnapshot()).toEqual({ sessionId: 'session-a', callId: 'call-2' })
    controller.close()
    controller.close()

    expect(notifications).toBe(3)
    expect(controller.state.getSnapshot()).toBeNull()
    dispose()
  })

  it('does not leak a previous session into the next workbench target', () => {
    const controller = createCouncilUiController()
    controller.open('session-a', 'call-a')
    controller.open('session-b', 'call-b')

    expect(controller.state.getSnapshot()).toEqual({ sessionId: 'session-b', callId: 'call-b' })
  })
})
