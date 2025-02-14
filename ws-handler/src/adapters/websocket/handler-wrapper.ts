import { AsyncResource } from 'node:async_hooks'
import { type WebSocket } from 'ws'
import { logger } from '../../app/logger'

// wrap handler for two purposes:
// - provide sensible default to error handling
// - make sure it runs in the caller's ALS context
export function wrapWithDefaults<T extends any[]>(
  ws: WebSocket,
  handler: (...args: T) => Promise<void>,
) {
  return AsyncResource.bind(async (...args: T) => {
    try {
      await handler(...args)
    } catch (e) {
      logger.error(e, 'Encountered an error during handler execution')
      ws.close()
    }
  })
}
