import { CompressionTypes } from 'kafkajs'
import { producer, MESSAGES_TOPIC, subscriptionsByChatId } from './client'
import { serializeMessage, type Message } from '../../domain/models'

export async function subscribeForMessage(
  chatId: Message['chatId'],
  callback: (message: Message) => Promise<void>,
) {
  if (subscriptionsByChatId[chatId]) {
    subscriptionsByChatId[chatId].push(callback)
  } else {
    subscriptionsByChatId[chatId] = [callback]
  }
}

export async function unsubscribeForMessage() {}

export async function publishMessage(message: Message) {
  await producer.send({
    compression: CompressionTypes.GZIP,
    topic: MESSAGES_TOPIC,
    messages: [{ key: message.chatId, value: serializeMessage(message) }],
  })
  console.log('publishing to broker!')
}
