import { UnauthorizedError } from './errors'
import { getContext } from './storage'
import { type RequestContext, type MessageReturner } from './types'
import {
  publishMessage,
  subscribeForMessage,
  unsubscribeForMessage,
} from '../adapters/pubsub/kafka-broker'
import { Message } from '../domain/models/message'

// validates path
// authenticate user
// authorize user against its actions
// populate request context
// TODO: maybe too much things going on here, potential refactor
export async function onRequest() {
  const context = getContext()

  const chatId = validateChatId(context)
  // TODO: do some authorization with chatId
  context.chatId = chatId
  // TODO: get userId from somewhere
  context.userId = 'test_user'
}

function validateChatId(context: RequestContext) {
  const validPathPattern = /^\/chat\/([^/?#]+)$/
  const matches = context.url.match(validPathPattern)
  if (!matches) throw new UnauthorizedError('Invalid path')

  const [_, chatId] = matches
  return chatId
}

// called when websocket connection is initiated
export async function onConnect(returnMessage: MessageReturner) {
  const chatId = getContext().chatId

  await subscribeForMessage(chatId, returnMessage)
}

// called when websocket connection is closed
export async function onDisconnect(returnMessage: MessageReturner) {
  const chatId = getContext().chatId

  await unsubscribeForMessage(chatId, returnMessage)
}

// called when new message data is coming into a websocket connection
export async function onMessage(data: string) {
  const context = getContext()

  // TODO: parse incoming data
  const messageData = {
    chatId: context.chatId,
    message: data,
    from: context.userId,
    createdAt: Date.now(),
  }
  const message = Message.parse(messageData)

  await publishMessage(message)
}
