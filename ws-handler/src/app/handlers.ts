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

// using arrow functions to enforce type
// called when websocket connection is initiated
export const onConnect: ConnectHandler = async (chatId, sendMessage) => {
  await subscribeForMessage(chatId, async (message) => sendMessage(message))
}

// called when websocket connection is closed
export const onDisconnect: DisconnectHandler = async (chatId, sendMessage) => {
  await unsubscribeForMessage(chatId, async (message) => sendMessage(message))
}

// called when message is coming into a websocket connection
export const onMessage: MessageHandler = async (message) => {
  await publishMessage(message)
}
