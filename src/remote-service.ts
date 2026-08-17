/** Protocol adapter that exposes the shared council service to the Web half. */

import type { Agent } from '@deepseek-ai/dsh-agent'
import { Remote } from '@deepseek-ai/dsh-typert-protocol'
import {
  SolutionCouncilService,
  type CouncilCancelResult,
  type CouncilGetResult,
  type CouncilListResult,
} from './solution-council.ts'

type RemoteInitializer = (this: object) => void
const remoteInitializers: RemoteInitializer[] = []

function installRemote<This extends object, Args extends unknown[], Result>(
  method: (this: This, ...args: Args) => Result,
  methodName: string,
  exportName: string,
): void {
  const decorator = Remote(exportName)
  decorator(method, {
    kind: 'method',
    name: methodName,
    static: false,
    private: false,
    access: { has: () => true, get: () => method },
    metadata: undefined,
    addInitializer(initializer: (this: This) => void) {
      remoteInitializers.push(function (this: object): void { initializer.call(this as This) })
    },
  } as unknown as ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Result>)
}

export class SolutionCouncilRemoteService extends SolutionCouncilService {
  constructor(...args: ConstructorParameters<typeof SolutionCouncilService>) {
    super(...args)
    for (const initializer of remoteInitializers) initializer.call(this)
  }

  remoteList(agent: Agent): Promise<CouncilListResult> {
    return this.list(agent)
  }

  remoteGet(agent: Agent, callId: string): Promise<CouncilGetResult> {
    return this.getByCall(agent, callId)
  }

  remoteCancel(agent: Agent, callId: string): Promise<CouncilCancelResult> {
    return this.cancel(agent, callId)
  }
}

installRemote(SolutionCouncilRemoteService.prototype.remoteList, 'remoteList', 'list')
installRemote(SolutionCouncilRemoteService.prototype.remoteGet, 'remoteGet', 'get')
installRemote(SolutionCouncilRemoteService.prototype.remoteCancel, 'remoteCancel', 'cancel')

export default SolutionCouncilRemoteService
