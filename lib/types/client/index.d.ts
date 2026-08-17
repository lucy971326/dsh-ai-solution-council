import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'

export declare const inject: readonly ['slots', 'remote', 'locale']
export declare function apply(ctx: ClientContext): Promise<void>
