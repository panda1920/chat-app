import { createHash } from 'node:crypto'
import { type IncomingMessage } from 'node:http'
import { type RequestContext } from '../../domain/models/request-context'

// create request context from http req
export function createRequestContext(req: IncomingMessage) {
  const url = req.url || ''

  return {
    url,
    startAt: Date.now(),
    traceId: generateTraceId(url),
    chatId: '',
    userId: '',
  } satisfies RequestContext
}

function generateTraceId(url: string) {
  const now = new Date().getTime()
  const path = url || ''
  const random = Math.random()

  return createHash('sha1')
    .update(now + path + random)
    .digest('hex')
    .substring(0, 16)
}
