import { CompressionTypes } from 'kafkajs'
import { producer, MESSAGES_TOPIC, subscriptionsByChatId } from './client'
import { serializeMessage, type Message } from '../../domain/models/message'

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

export async function unsubscribeForMessage(
  chatId: Message['chatId'],
  callback: (message: Message) => Promise<void>,
) {
  console.log(
    '🚀 ~ subscriptionsByChatId:',
    subscriptionsByChatId[chatId]?.length,
  )
  const subscriptions = subscriptionsByChatId[chatId] ?? []
  const foundIndex = subscriptions.findIndex(
    (subscription) => subscription === callback,
  )
  console.log('🚀 ~ foundIndex:', foundIndex)
  if (foundIndex > -1) {
    subscriptions.splice(foundIndex, 1)
  }
  console.log(
    '🚀 ~ subscriptionsByChatId:',
    subscriptionsByChatId[chatId]?.length,
  )
}

export async function publishMessage(message: Message) {
  await producer.send({
    compression: CompressionTypes.GZIP,
    topic: MESSAGES_TOPIC,
    messages: [{ key: message.chatId, value: serializeMessage(message) }],
  })
  console.log('publishing to broker!')
}
