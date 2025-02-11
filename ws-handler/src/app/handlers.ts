import { getContext } from './storage'
import {
  publishMessage,
  subscribeForMessage,
  unsubscribeForMessage,
} from '../adapters/pubsub/kafka-broker'
import { Message } from '../domain/models/message'

// called when websocket connection is initiated
export async function onConnect(returnMessage: (message: Message) => void) {
  const chatId = getContext().chatId

  await subscribeForMessage(chatId, async (message) => returnMessage(message))
}

// called when websocket connection is closed
export async function onDisconnect(returnMessage: (message: Message) => void) {
  const chatId = getContext().chatId

  await unsubscribeForMessage(chatId, async (message) => returnMessage(message))
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
