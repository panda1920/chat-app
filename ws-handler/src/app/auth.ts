import { type RequestContext } from '../domain/models/request-context'

export async function authorize(context: RequestContext) {
  const validPathPattern = /^\/chat\/([^/?#]*)$/
  const matches = context.url.match(validPathPattern)
  if (!matches) return false

  const [_, chatId] = matches
  console.log(`chatId: ${chatId}`)

  return true
}
