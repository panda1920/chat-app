import { type MessageHandler, type OnConnectHandler } from './types'
import {
  publishMessage,
  subscribeForMessage,
} from '../adapters/pubsub/kafka-broker'

// using arrow functions to enforce type
export const onConnection: OnConnectHandler = async (chatId, sendMessage) => {
  await subscribeForMessage(chatId, async (message) => sendMessage(message))
}

export const handleMessage: MessageHandler = async (message) => {
  await publishMessage(message)
}
