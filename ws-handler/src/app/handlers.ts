import { InternalServerError } from './errors'
import { contextStorage } from './storage'
import {
  type DisconnectHandler,
  type MessageHandler,
  type ConnectHandler,
} from './types'
import {
  publishMessage,
  subscribeForMessage,
  unsubscribeForMessage,
} from '../adapters/pubsub/kafka-broker'
import { Message } from '../domain/models/message'

// using arrow functions to enforce type
// called when websocket connection is initiated
export const onConnect: ConnectHandler = async (sendMessage) => {
  const chatId = contextStorage.getStore()?.chatId
  if (!chatId) throw new InternalServerError('chatId not found!')

  await subscribeForMessage(chatId, async (message) => sendMessage(message))
}

// called when websocket connection is closed
export const onDisconnect: DisconnectHandler = async (sendMessage) => {
  const chatId = contextStorage.getStore()?.chatId
  if (!chatId) throw new InternalServerError('chatId not found!')

  await unsubscribeForMessage(chatId, async (message) => sendMessage(message))
}

// called when message is coming into a websocket connection
export const onMessage: MessageHandler = async (data) => {
  const context = contextStorage.getStore()
  if (!context) throw new InternalServerError('context not found!')

  const messageData = {
    chatId: context.chatId,
    message: data,
    from: context.userId,
    createdAt: context.startAt, // TODO: maybe this coudl change - get it from frontend maybe
  }
  const message = Message.parse(messageData)
  await publishMessage(message)
}
