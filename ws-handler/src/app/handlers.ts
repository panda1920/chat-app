import { getContext } from './storage'
import { type MessageReturner } from './types'
import {
  publishMessage,
  subscribeForMessage,
  unsubscribeForMessage,
} from '../adapters/pubsub/kafka-broker'
import { Message } from '../domain/models/message'

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
