import { CompressionTypes } from 'kafkajs'
import { producer, MESSAGES_TOPIC, subscriptionsByChatId } from './client'
import { logger } from '../../app/logger'
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
  logger.debug(
    `🚀 ~ subscriptionsByChatId:',
    ${subscriptionsByChatId[chatId]?.length}`,
  )
  const subscriptions = subscriptionsByChatId[chatId] ?? []
  const foundIndex = subscriptions.findIndex(
    (subscription) => subscription === callback,
  )
  logger.debug(`🚀 ~ foundIndex:', ${foundIndex}`)
  if (foundIndex > -1) {
    subscriptions.splice(foundIndex, 1)
  }
  logger.debug(
    `🚀 ~ subscriptionsByChatId:',
    ${subscriptionsByChatId[chatId]?.length}`,
  )
}

export async function publishMessage(message: Message) {
  await producer.send({
    compression: CompressionTypes.GZIP,
    topic: MESSAGES_TOPIC,
    messages: [{ key: message.chatId, value: serializeMessage(message) }],
  })
  logger.info('Publishing message to broker')
}
