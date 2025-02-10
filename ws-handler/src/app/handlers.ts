import { getContext } from './storage'
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
export const onConnect: ConnectHandler = async (returnMessage) => {
  const chatId = getContext().chatId

  await subscribeForMessage(chatId, async (message) => returnMessage(message))
}

// called when websocket connection is closed
export const onDisconnect: DisconnectHandler = async (returnMessage) => {
  const chatId = getContext().chatId

  await unsubscribeForMessage(chatId, async (message) => returnMessage(message))
}

// called when message is coming into a websocket connection
export const onMessage: MessageHandler = async (data) => {
  const context = getContext()

  const messageData = {
    chatId: context.chatId,
    message: data,
    from: context.userId,
    createdAt: context.startAt, // TODO: maybe this coudl change - get it from frontend maybe
  }
  const message = Message.parse(messageData)

  await publishMessage(message)
}
