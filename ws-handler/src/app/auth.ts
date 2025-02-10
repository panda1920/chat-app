import { UnauthorizedError } from './errors'
import { contextStorage } from './storage'
import { type RequestContext } from '../domain/models/request-context'

export async function authorize() {
  const context = contextStorage.getStore()
  if (!context) throw new UnauthorizedError('No context')

  const chatId = validateChatId(context)
  // TODO: do some authorization with chatId
  context.chatId = chatId
  // TODO: get userId from somewhere
  context.userId = 'test_user'
}

function validateChatId(context: RequestContext) {
  const validPathPattern = /^\/chat\/([^/?#]*)$/
  const matches = context.url.match(validPathPattern)
  if (!matches) throw new UnauthorizedError('Invalid path')

  const [_, chatId] = matches
  return chatId
}
